export type MessageStatus = "sent" | "delivered" | "read";

export type ChatContact = {
  id: string;
  name: string;
  email: string;
  role: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
};

export type ChatMessage = {
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
