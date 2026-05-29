import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { toDateKey } from "@/lib/date";
import User from "@/models/User";
import { getDaySummary, getCurrentBalance } from "@/lib/finance";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") || toDateKey();

  await dbConnect();

  const users = await User.find({ role: "user" }).select("-password").sort({
    name: 1,
  });

  const data = await Promise.all(
    users.map(async (user) => {
      const daySummary = await getDaySummary(user._id, date);
      const totalBalance = await getCurrentBalance(user._id);
      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        date,
        totalIncoming: daySummary.totalIncoming,
        totalOutgoing: daySummary.totalOutgoing,
        dayNet: daySummary.dayNet,
        closingBalance: daySummary.closingBalance,
        totalBalance,
        entryCount: daySummary.entryCount,
      };
    })
  );

  return NextResponse.json({ date, today: toDateKey(), users: data });
}
