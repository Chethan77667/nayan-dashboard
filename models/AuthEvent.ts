import mongoose, { Schema, models, model } from "mongoose";

export type AuthEventType = "login" | "logout";

export interface IAuthEvent {
  userId: mongoose.Types.ObjectId;
  type: AuthEventType;
  userAgent: string;
  createdAt: Date;
}

const AuthEventSchema = new Schema<IAuthEvent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["login", "logout"], required: true },
    userAgent: { type: String, default: "" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AuthEventSchema.index({ userId: 1, createdAt: -1 });

const AuthEvent =
  models.AuthEvent || model<IAuthEvent>("AuthEvent", AuthEventSchema);

export default AuthEvent;
