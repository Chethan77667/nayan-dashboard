import mongoose, { Schema, models, model } from "mongoose";

export interface IChatMessage {
  sender: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  text: string;
  imageUrl: string | null;
  deliveredAt: Date | null;
  readAt: Date | null;
  deletedForEveryone: boolean;
  hiddenFor: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, default: "", trim: true, maxlength: 4000 },
    imageUrl: { type: String, default: null },
    deliveredAt: { type: Date, default: null },
    readAt: { type: Date, default: null },
    deletedForEveryone: { type: Boolean, default: false },
    hiddenFor: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

ChatMessageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
ChatMessageSchema.index({ recipient: 1, readAt: 1 });

const ChatMessage =
  models.ChatMessage || model<IChatMessage>("ChatMessage", ChatMessageSchema);

export default ChatMessage;

/** WhatsApp-style: delete for everyone within 1 hour */
export const DELETE_FOR_EVERYONE_MS = 60 * 60 * 1000;
