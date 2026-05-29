import Transaction from "@/models/Transaction";
import { toDateKey } from "@/lib/date";
import mongoose from "mongoose";

export interface DaySummary {
  date: string;
  openingBalance: number;
  totalIncoming: number;
  totalOutgoing: number;
  dayNet: number;
  closingBalance: number;
  entryCount: number;
}

export interface TransactionDto {
  _id: string;
  userId: string;
  date: string;
  type: "incoming" | "outgoing";
  amount: number;
  reason: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export async function computeDaySummaries(
  userId: string | mongoose.Types.ObjectId,
  upToDate?: string
): Promise<DaySummary[]> {
  const filter: Record<string, unknown> = {
    userId: new mongoose.Types.ObjectId(userId.toString()),
  };
  if (upToDate) {
    filter.date = { $lte: upToDate };
  }

  const entries = await Transaction.find(filter).sort({ date: 1, createdAt: 1 });

  const byDate = new Map<string, typeof entries>();
  for (const e of entries) {
    const list = byDate.get(e.date) ?? [];
    list.push(e);
    byDate.set(e.date, list);
  }

  const dates = [...byDate.keys()].sort();
  let runningBalance = 0;
  const summaries: DaySummary[] = [];

  for (const date of dates) {
    const dayEntries = byDate.get(date)!;
    const totalIncoming = round2(
      dayEntries
        .filter((e) => e.type === "incoming")
        .reduce((s, e) => s + e.amount, 0)
    );
    const totalOutgoing = round2(
      dayEntries
        .filter((e) => e.type === "outgoing")
        .reduce((s, e) => s + e.amount, 0)
    );
    const openingBalance = runningBalance;
    const dayNet = round2(totalIncoming - totalOutgoing);
    const closingBalance = round2(openingBalance + dayNet);
    runningBalance = closingBalance;

    summaries.push({
      date,
      openingBalance,
      totalIncoming,
      totalOutgoing,
      dayNet,
      closingBalance,
      entryCount: dayEntries.length,
    });
  }

  return summaries;
}

export async function getDaySummary(
  userId: string | mongoose.Types.ObjectId,
  date: string
): Promise<DaySummary> {
  const summaries = await computeDaySummaries(userId, date);
  const found = summaries.find((s) => s.date === date);
  if (found) return found;

  const before = summaries.filter((s) => s.date < date);
  const openingBalance =
    before.length > 0 ? before[before.length - 1].closingBalance : 0;

  return {
    date,
    openingBalance,
    totalIncoming: 0,
    totalOutgoing: 0,
    dayNet: 0,
    closingBalance: openingBalance,
    entryCount: 0,
  };
}

export async function getCurrentBalance(
  userId: string | mongoose.Types.ObjectId
): Promise<number> {
  const today = toDateKey();
  const summary = await getDaySummary(userId, today);
  return summary.closingBalance;
}

export function serializeTransaction(doc: {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  date: string;
  type: "incoming" | "outgoing";
  amount: number;
  reason: string;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}): TransactionDto {
  return {
    _id: doc._id.toString(),
    userId: doc.userId.toString(),
    date: doc.date,
    type: doc.type,
    amount: doc.amount,
    reason: doc.reason,
    imageUrl: doc.imageUrl,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}
