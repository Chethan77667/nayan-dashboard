export interface DaySummary {
  date: string;
  openingBalance: number;
  totalIncoming: number;
  totalOutgoing: number;
  dayNet: number;
  closingBalance: number;
  entryCount: number;
}

export interface TransactionEntry {
  _id: string;
  userId: string;
  date: string;
  type: "incoming" | "outgoing";
  amount: number;
  reason: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyData {
  date: string;
  today: string;
  summary: DaySummary;
  entries: TransactionEntry[];
}
