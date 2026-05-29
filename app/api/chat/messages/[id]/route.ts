import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import ChatMessage, { DELETE_FOR_EVERYONE_MS } from "@/models/ChatMessage";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(req: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  let mode: "me" | "everyone" = "me";

  try {
    const body = await req.json();
    if (body.mode === "everyone") mode = "everyone";
  } catch {
    /* default delete for me */
  }

  await dbConnect();

  const message = await ChatMessage.findById(id);
  if (!message) {
    return NextResponse.json({ message: "Message not found" }, { status: 404 });
  }

  const me = new mongoose.Types.ObjectId(session.id);
  const isParticipant =
    message.sender.equals(me) || message.recipient.equals(me);

  if (!isParticipant) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  if (mode === "everyone") {
    if (!message.sender.equals(me)) {
      return NextResponse.json(
        { message: "Only the sender can delete for everyone" },
        { status: 403 }
      );
    }

    const age = Date.now() - new Date(message.createdAt).getTime();
    if (age > DELETE_FOR_EVERYONE_MS) {
      return NextResponse.json(
        { message: "Delete for everyone is only available within 1 hour" },
        { status: 400 }
      );
    }

    message.deletedForEveryone = true;
    message.text = "";
    message.imageUrl = null;
    await message.save();

    return NextResponse.json({ success: true, mode: "everyone" });
  }

  if (!message.hiddenFor.some((uid: mongoose.Types.ObjectId) => uid.equals(me))) {
    message.hiddenFor.push(me);
    await message.save();
  }

  return NextResponse.json({ success: true, mode: "me" });
}
