import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import ChatMessage from "@/models/ChatMessage";

type RouteContext = { params: Promise<{ userId: string }> };

export async function DELETE(req: Request, context: RouteContext) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (session.role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { userId } = await context.params;

  if (session.id === userId) {
    return NextResponse.json(
      { message: "You cannot delete your own account" },
      { status: 400 }
    );
  }

  let body: { deleteCode?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { message: "Delete code is required" },
      { status: 400 }
    );
  }

  const deleteCode = body.deleteCode?.trim();
  const expectedCode = process.env.ADMIN_DELETE_CODE;

  if (!expectedCode) {
    console.error("ADMIN_DELETE_CODE is not set in environment");
    return NextResponse.json(
      { message: "Delete is not configured on the server" },
      { status: 500 }
    );
  }

  if (!deleteCode || deleteCode !== expectedCode) {
    return NextResponse.json(
      { message: "Invalid delete code" },
      { status: 403 }
    );
  }

  await dbConnect();

  const user = await User.findById(userId);

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  if (user.role === "admin") {
    return NextResponse.json(
      { message: "Admin accounts cannot be deleted" },
      { status: 400 }
    );
  }

  await Transaction.deleteMany({ userId: user._id });
  await ChatMessage.deleteMany({
    $or: [{ sender: user._id }, { recipient: user._id }],
  });
  await User.findByIdAndDelete(userId);

  return NextResponse.json({
    success: true,
    message: "User account permanently deleted",
  });
}
