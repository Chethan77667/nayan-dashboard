import AuthEvent, { type AuthEventType } from "@/models/AuthEvent";
import mongoose from "mongoose";

export function getRequestUserAgent(req?: Request): string {
  if (!req) return "";
  return req.headers.get("user-agent")?.slice(0, 500) ?? "";
}

export async function recordAuthEvent(
  type: AuthEventType,
  userId: string,
  req?: Request
) {
  await AuthEvent.create({
    userId: new mongoose.Types.ObjectId(userId),
    type,
    userAgent: getRequestUserAgent(req),
  });
}
