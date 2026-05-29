import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { isValidDateKey, toDateKey } from "@/lib/date";
import {
  computeDaySummaries,
  getDaySummary,
  serializeTransaction,
} from "@/lib/finance";
import Transaction from "@/models/Transaction";
import User from "@/models/User";

type RouteContext = { params: Promise<{ userId: string }> };

export async function GET(req: Request, context: RouteContext) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { userId } = await context.params;
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") || toDateKey();

  if (!isValidDateKey(date)) {
    return NextResponse.json({ message: "Invalid date" }, { status: 400 });
  }

  await dbConnect();

  const user = await User.findById(userId).select("-password");
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const summary = await getDaySummary(userId, date);
  const entries = await Transaction.find({ userId, date }).sort({
    createdAt: 1,
  });
  const history = await computeDaySummaries(userId);

  return NextResponse.json({
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    },
    date,
    today: toDateKey(),
    summary,
    entries: entries.map(serializeTransaction),
    history: history.slice(-30),
    readOnly: true,
  });
}
