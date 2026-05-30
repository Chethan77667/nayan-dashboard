import mongoose, { Schema, models, model } from "mongoose";

export type FinanceAuditAction = "create" | "update" | "delete";

export interface IFinanceAudit {
  userId: mongoose.Types.ObjectId;
  transactionId?: mongoose.Types.ObjectId;
  action: FinanceAuditAction;
  entryType: "incoming" | "outgoing";
  amount: number;
  reason: string;
  date: string;
  performedBy: mongoose.Types.ObjectId;
  performedByRole: "user" | "admin";
  createdAt: Date;
}

const FinanceAuditSchema = new Schema<IFinanceAudit>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    transactionId: { type: Schema.Types.ObjectId, ref: "Transaction" },
    action: {
      type: String,
      enum: ["create", "update", "delete"],
      required: true,
    },
    entryType: { type: String, enum: ["incoming", "outgoing"], required: true },
    amount: { type: Number, required: true },
    reason: { type: String, default: "" },
    date: { type: String, required: true },
    performedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    performedByRole: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

FinanceAuditSchema.index({ userId: 1, createdAt: -1 });

const FinanceAudit =
  models.FinanceAudit || model<IFinanceAudit>("FinanceAudit", FinanceAuditSchema);

export default FinanceAudit;
