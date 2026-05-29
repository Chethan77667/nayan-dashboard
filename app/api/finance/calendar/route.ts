import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { computeDaySummaries } from "@/lib/finance";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");

  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ message: "Invalid month" }, { status: 400 });
  }

  await dbConnect();

  const allSummaries = await computeDaySummaries(session.id);
  const monthSummaries = allSummaries.filter((s) => s.date.startsWith(month));

  return NextResponse.json({ month, days: monthSummaries });
}
