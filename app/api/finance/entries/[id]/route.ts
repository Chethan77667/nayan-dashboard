import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { isValidDateKey } from "@/lib/date";
import { parseAmount } from "@/lib/currency";
import { serializeTransaction } from "@/lib/finance";
import Transaction from "@/models/Transaction";
import { saveEntryImage } from "@/lib/upload";
import { logFinanceAudit } from "@/lib/finance-audit";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(req: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    await dbConnect();
    const entry = await Transaction.findOne({ _id: id, userId: session.id });

    if (!entry) {
      return NextResponse.json({ message: "Entry not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const amountRaw = formData.get("amount");
    const reason = formData.get("reason");
    const date = formData.get("date");
    const image = formData.get("image") as File | null;
    const removeImage = formData.get("removeImage") === "true";

    if (amountRaw !== null && amountRaw !== "") {
      entry.amount = parseAmount(amountRaw as string);
    }
    if (reason !== null) {
      entry.reason = (reason as string).trim();
    }
    if (date !== null && date !== "") {
      const dateStr = date as string;
      if (!isValidDateKey(dateStr)) {
        return NextResponse.json({ message: "Invalid date" }, { status: 400 });
      }
      entry.date = dateStr;
    }

    if (removeImage) {
      entry.imageUrl = "";
    } else if (image && image.size > 0) {
      entry.imageUrl = await saveEntryImage(session.id, image);
    }

    await entry.save();

    await logFinanceAudit({
      userId: session.id,
      transactionId: entry._id.toString(),
      action: "update",
      entryType: entry.type as "incoming" | "outgoing",
      amount: entry.amount,
      reason: entry.reason,
      date: entry.date,
      performedBy: session.id,
      performedByRole: session.role === "admin" ? "admin" : "user",
    });

    return NextResponse.json({
      success: true,
      entry: serializeTransaction(entry),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update entry";
    return NextResponse.json({ message }, { status: 400 });
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  await dbConnect();
  const entry = await Transaction.findOne({ _id: id, userId: session.id });

  if (!entry) {
    return NextResponse.json({ message: "Entry not found" }, { status: 404 });
  }

  await logFinanceAudit({
    userId: session.id,
    transactionId: entry._id.toString(),
    action: "delete",
    entryType: entry.type as "incoming" | "outgoing",
    amount: entry.amount,
    reason: entry.reason,
    date: entry.date,
    performedBy: session.id,
    performedByRole: session.role === "admin" ? "admin" : "user",
  });

  await Transaction.deleteOne({ _id: id, userId: session.id });

  return NextResponse.json({ success: true });
}
