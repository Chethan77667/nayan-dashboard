import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { isValidDateKey, toDateKey } from "@/lib/date";
import { parseAmount } from "@/lib/currency";
import { serializeTransaction } from "@/lib/finance";
import Transaction from "@/models/Transaction";
import { saveEntryImage } from "@/lib/upload";
import { logFinanceAudit } from "@/lib/finance-audit";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const type = formData.get("type") as string;
    const amountRaw = formData.get("amount") as string;
    const reason = (formData.get("reason") as string) || "";
    const date = (formData.get("date") as string) || toDateKey();
    const image = formData.get("image") as File | null;

    if (type !== "incoming" && type !== "outgoing") {
      return NextResponse.json({ message: "Invalid type" }, { status: 400 });
    }

    if (!isValidDateKey(date)) {
      return NextResponse.json({ message: "Invalid date" }, { status: 400 });
    }

    const amount = parseAmount(amountRaw);
    if (amount <= 0) {
      return NextResponse.json(
        { message: "Amount must be greater than zero" },
        { status: 400 }
      );
    }

    let imageUrl = "";
    if (image && image.size > 0) {
      imageUrl = await saveEntryImage(session.id, image);
    }

    await dbConnect();

    const entry = await Transaction.create({
      userId: session.id,
      date,
      type,
      amount,
      reason: reason.trim(),
      imageUrl,
    });

    await logFinanceAudit({
      userId: session.id,
      transactionId: entry._id.toString(),
      action: "create",
      entryType: type,
      amount,
      reason: reason.trim(),
      date,
      performedBy: session.id,
      performedByRole: session.role === "admin" ? "admin" : "user",
    });

    return NextResponse.json({
      success: true,
      entry: serializeTransaction(entry),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save entry";
    return NextResponse.json({ message }, { status: 400 });
  }
}
