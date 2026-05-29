import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { isValidDateKey, toDateKey } from "@/lib/date";
import {
  getDaySummary,
  serializeTransaction,
} from "@/lib/finance";
import Transaction from "@/models/Transaction";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") || toDateKey();

  if (!isValidDateKey(date)) {
    return NextResponse.json({ message: "Invalid date" }, { status: 400 });
  }

  await dbConnect();

  const summary = await getDaySummary(session.id, date);
  const entries = await Transaction.find({ userId: session.id, date }).sort({
    createdAt: 1,
  });

  return NextResponse.json({
    date,
    today: toDateKey(),
    summary,
    entries: entries.map(serializeTransaction),
  });
}
