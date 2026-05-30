import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import AuthEvent from "@/models/AuthEvent";
import FinanceAudit from "@/models/FinanceAudit";
import User from "@/models/User";

type RouteContext = { params: Promise<{ userId: string }> };

export async function GET(_req: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (session.role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { userId } = await context.params;
  await dbConnect();

  const user = await User.findById(userId).select("name email");
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const [authEvents, financeAudits] = await Promise.all([
    AuthEvent.find({ userId })
      .sort({ createdAt: -1 })
      .limit(80)
      .lean(),
    FinanceAudit.find({ userId })
      .sort({ createdAt: -1 })
      .limit(80)
      .lean(),
  ]);

  return NextResponse.json({
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
