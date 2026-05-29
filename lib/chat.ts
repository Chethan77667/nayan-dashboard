import mongoose from "mongoose";
import ChatMessage from "@/models/ChatMessage";
import User from "@/models/User";
import { displayUserName } from "@/lib/branding";
import { messagePreview } from "@/lib/chat-text";
import type { MessageStatus } from "@/components/chat/types";

export type ChatContact = {
  id: string;
  name: string;
  email: string;
  role: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
};

export type ChatMessageDto = {
  id: string;
  senderId: string;
  text: string;
  imageUrl: string | null;
  createdAt: string;
  isMine: boolean;
  status: MessageStatus;
  deleted: boolean;
  canDeleteForEveryone: boolean;
};

function outgoingStatus(
  deliveredAt: Date | null | undefined,
  readAt: Date | null | undefined
): MessageStatus {
  if (readAt) return "read";
  if (deliveredAt) return "delivered";
  return "sent";
}

function isHiddenForUser(
  hiddenFor: mongoose.Types.ObjectId[] | undefined,
  userId: string
): boolean {
  return (hiddenFor ?? []).some((id) => id.toString() === userId);
}

function canDeleteForEveryone(
  senderId: string,
  currentUserId: string,
  createdAt: Date,
  deletedForEveryone: boolean
): boolean {
  if (deletedForEveryone) return false;
  if (senderId !== currentUserId) return false;
  return Date.now() - new Date(createdAt).getTime() <= 60 * 60 * 1000;
}

export function serializeMessage(
  m: {
    _id: mongoose.Types.ObjectId;
    sender: mongoose.Types.ObjectId;
    text?: string;
    imageUrl?: string | null;
    deliveredAt?: Date | null;
    readAt?: Date | null;
    deletedForEveryone?: boolean;
    hiddenFor?: mongoose.Types.ObjectId[];
    createdAt: Date;
  },
  currentUserId: string
): ChatMessageDto | null {
  if (isHiddenForUser(m.hiddenFor, currentUserId)) {
    return null;
  }

  const isMine = m.sender.toString() === currentUserId;
  const deleted = Boolean(m.deletedForEveryone);

  return {
    id: m._id.toString(),
    senderId: m.sender.toString(),
    text: deleted ? "This message was deleted" : (m.text ?? ""),
    imageUrl: deleted ? null : (m.imageUrl ?? null),
    createdAt: new Date(m.createdAt).toISOString(),
    isMine,
    status: isMine ? outgoingStatus(m.deliveredAt, m.readAt) : "delivered",
    deleted,
    canDeleteForEveryone: canDeleteForEveryone(
      m.sender.toString(),
      currentUserId,
      m.createdAt,
      deleted
    ),
  };
}

export async function markIncomingDelivered(currentUserId: string): Promise<void> {
  const me = new mongoose.Types.ObjectId(currentUserId);
  await ChatMessage.updateMany(
    { recipient: me, deliveredAt: null, deletedForEveryone: false },
    { $set: { deliveredAt: new Date() } }
  );
}

export async function getChatContacts(
  currentUserId: string
): Promise<ChatContact[]> {
  const me = new mongoose.Types.ObjectId(currentUserId);

  await markIncomingDelivered(currentUserId);

  const users = await User.find({ _id: { $ne: me } })
    .select("name email role createdAt")
    .lean();

  const contacts: ChatContact[] = await Promise.all(
    users.map(async (user) => {
      const userId = user._id.toString();

      const recent = await ChatMessage.find({
        $or: [
          { sender: me, recipient: user._id },
          { sender: user._id, recipient: me },
        ],
        hiddenFor: { $ne: me },
      })
        .sort({ createdAt: -1 })
        .limit(20)
        .select("text imageUrl createdAt sender deletedForEveryone hiddenFor")
        .lean();

      const lastMsg = recent.find(
        (m) => !isHiddenForUser(m.hiddenFor, currentUserId)
      );

      const unreadCount = await ChatMessage.countDocuments({
        sender: user._id,
        recipient: me,
        readAt: null,
        deletedForEveryone: false,
        hiddenFor: { $ne: me },
      });

      let preview = "";
      if (lastMsg) {
        if (lastMsg.deletedForEveryone) {
          preview = "This message was deleted";
        } else {
          preview = messagePreview(lastMsg.text ?? null, lastMsg.imageUrl ?? null);
        }
      }

      return {
        id: userId,
        name: displayUserName(user.name, user.role),
        email: user.email,
        role: user.role,
        lastMessage: preview || null,
        lastMessageAt: lastMsg?.createdAt
          ? new Date(lastMsg.createdAt).toISOString()
          : null,
        unreadCount,
      };
    })
  );

  contacts.sort((a, b) => {
    if (a.lastMessageAt && b.lastMessageAt) {
      return (
        new Date(b.lastMessageAt).getTime() -
        new Date(a.lastMessageAt).getTime()
      );
    }
    if (a.lastMessageAt) return -1;
    if (b.lastMessageAt) return 1;
    return a.name.localeCompare(b.name);
  });

  return contacts;
}

export async function getThreadMessages(
  currentUserId: string,
  peerId: string
): Promise<ChatMessageDto[]> {
  const me = new mongoose.Types.ObjectId(currentUserId);
  const peer = new mongoose.Types.ObjectId(peerId);

  const messages = await ChatMessage.find({
    $or: [
      { sender: me, recipient: peer },
      { sender: peer, recipient: me },
    ],
    hiddenFor: { $ne: me },
  })
    .sort({ createdAt: 1 })
    .lean();

  return messages
    .map((m) => serializeMessage(m, currentUserId))
    .filter((m): m is ChatMessageDto => m !== null);
}

export async function markThreadRead(
  currentUserId: string,
  peerId: string
): Promise<void> {
  const me = new mongoose.Types.ObjectId(currentUserId);
  const peer = new mongoose.Types.ObjectId(peerId);
  const now = new Date();

  await ChatMessage.updateMany(
    {
      sender: peer,
      recipient: me,
      readAt: null,
      deletedForEveryone: false,
    },
    { $set: { readAt: now, deliveredAt: now } }
  );

  await ChatMessage.updateMany(
    {
      sender: peer,
      recipient: me,
      readAt: { $ne: null },
      deliveredAt: null,
    },
    { $set: { deliveredAt: now } }
  );
}
