import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { getIstDayBounds, isValidDateKey, toDateKey } from "@/lib/date";
import AuthEvent from "@/models/AuthEvent";
import FinanceAudit from "@/models/FinanceAudit";
import User from "@/models/User";

type RouteContext = { params: Promise<{ userId: string }> };

export async function GET(req: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (session.role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { userId } = await context.params;
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") || toDateKey();

  if (!isValidDateKey(date)) {
    return NextResponse.json({ message: "Invalid date" }, { status: 400 });
  }

  await dbConnect();

  const user = await User.findById(userId).select("name email");
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const { start, end } = getIstDayBounds(date);

  const [authEvents, financeAudits] = await Promise.all([
    AuthEvent.find({
      userId,
      createdAt: { $gte: start, $lte: end },
    })
      .sort({ createdAt: -1 })
      .lean(),
    FinanceAudit.find({ userId, date })
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  return NextResponse.json({
    date,
    today: toDateKey(),
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    },
    authEvents: authEvents.map((e) => ({
      id: e._id.toString(),
      type: e.type,
      at: e.createdAt,
      userAgent: e.userAgent,
    })),
    financeAudits: financeAudits.map((a) => ({
      id: a._id.toString(),
      action: a.action,
      entryType: a.entryType,
      amount: a.amount,
      reason: a.reason,
      date: a.date,
      transactionId: a.transactionId?.toString() ?? null,
      at: a.createdAt,
    })),
  });
}
