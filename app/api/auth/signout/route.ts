import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { recordAuthEvent } from "@/lib/auth-events";

export async function POST(req: Request) {
  const session = await getSession();
  if (session) {
    await dbConnect();
    await recordAuthEvent("logout", session.id, req);
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("token", "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
  });
  return response;
}
