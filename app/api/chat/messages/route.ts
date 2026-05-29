import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import {
  getThreadMessages,
  markThreadRead,
  serializeMessage,
} from "@/lib/chat";
import ChatMessage from "@/models/ChatMessage";
import User from "@/models/User";
import { saveEntryImage } from "@/lib/upload";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const peerId = new URL(request.url).searchParams.get("peerId");
  if (!peerId) {
    return NextResponse.json({ message: "peerId required" }, { status: 400 });
  }

  await dbConnect();

  const peer = await User.findById(peerId).select("_id");
  if (!peer) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  await markThreadRead(session.id, peerId);
  const messages = await getThreadMessages(session.id, peerId);

  return NextResponse.json({ messages });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let recipientId = "";
  let text = "";
  let imageFile: File | null = null;

  try {
    const form = await request.formData();
    recipientId = String(form.get("recipientId") ?? "");
    text = String(form.get("text") ?? "").trim();
    const file = form.get("image");
    if (file instanceof File && file.size > 0) {
      imageFile = file;
    }
  } catch {
    try {
      const body = await request.json();
      recipientId = String(body.recipientId ?? "");
      text = String(body.text ?? "").trim();
    } catch {
      return NextResponse.json(
        { message: "Invalid request body" },
        { status: 400 }
      );
    }
  }

  if (!recipientId) {
    return NextResponse.json(
      { message: "recipientId is required" },
      { status: 400 }
    );
  }

  if (!text && !imageFile) {
    return NextResponse.json(
      { message: "Message text or image is required" },
      { status: 400 }
    );
  }

  if (recipientId === session.id) {
    return NextResponse.json(
      { message: "Cannot message yourself" },
      { status: 400 }
    );
  }

  await dbConnect();

  const recipient = await User.findById(recipientId).select("_id");
  if (!recipient) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  let imageUrl: string | null = null;
  if (imageFile) {
    try {
      imageUrl = await saveEntryImage(session.id, imageFile);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Image upload failed";
      return NextResponse.json({ message: msg }, { status: 400 });
    }
  }

  const message = await ChatMessage.create({
    sender: session.id,
    recipient: recipientId,
    text: text || "",
    imageUrl,
    deliveredAt: null,
    readAt: null,
    deletedForEveryone: false,
    hiddenFor: [],
  });

  const dto = serializeMessage(
    {
      _id: message._id,
      sender: message.sender,
      text: message.text,
      imageUrl: message.imageUrl,
      deliveredAt: message.deliveredAt,
      readAt: message.readAt,
      deletedForEveryone: message.deletedForEveryone,
      hiddenFor: message.hiddenFor,
      createdAt: message.createdAt,
    },
    session.id
  );

  return NextResponse.json({ message: dto });
}
