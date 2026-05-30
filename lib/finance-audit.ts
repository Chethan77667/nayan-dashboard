import FinanceAudit, {
  type FinanceAuditAction,
} from "@/models/FinanceAudit";
import mongoose from "mongoose";

export async function logFinanceAudit(params: {
  userId: string;
  transactionId?: string;
  action: FinanceAuditAction;
  entryType: "incoming" | "outgoing";
  amount: number;
  reason: string;
  date: string;
  performedBy: string;
  performedByRole: "user" | "admin";
}) {
  await FinanceAudit.create({
    userId: new mongoose.Types.ObjectId(params.userId),
    transactionId: params.transactionId
      ? new mongoose.Types.ObjectId(params.transactionId)
      : undefined,
    action: params.action,
    entryType: params.entryType,
    amount: params.amount,
    reason: params.reason,
    date: params.date,
    performedBy: new mongoose.Types.ObjectId(params.performedBy),
    performedByRole: params.performedByRole,
  });
}
