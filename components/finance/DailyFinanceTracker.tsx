"use client";

import { formatINR } from "@/lib/currency";
import { useCallback, useEffect, useState } from "react";
import WhatsAppFab from "@/components/chat/WhatsAppFab";
import BackToDashboard from "@/components/BackToDashboard";
import DatePickerChip from "./DatePickerChip";
import EntryHistoryPanel from "./EntryHistoryPanel";
import AmountDisplay from "./AmountDisplay";
import type { DailyData } from "./types";

interface DailyFinanceTrackerProps {
  userName: string;
  readOnly?: boolean;
  adminUserId?: string;
  backHref?: string;
  backLabel?: string;
  showPageBack?: boolean;
  /** Admin viewing a user's accounts (not shown on normal user dashboard). */
  ownerView?: boolean;
}

export default function DailyFinanceTracker({
  userName,
  readOnly = false,
  adminUserId,
  backHref = "/admin/dashboard",
  backLabel = "Back to dashboard",
  showPageBack = false,
  ownerView = false,
}: DailyFinanceTrackerProps) {
  const [data, setData] = useState<DailyData | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [panel, setPanel] = useState<"incoming" | "outgoing" | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDay = useCallback(async (date?: string) => {
    setLoading(true);
    const q = date ? `?date=${date}` : "";
    const url = adminUserId
      ? `/api/admin/finance/${adminUserId}${q}`
      : `/api/finance/daily${q}`;

    const res = await fetch(url);
    const json = await res.json();
    setLoading(false);

    if (res.ok) {
      setData({
        date: json.date,
        today: json.today,
        summary: json.summary,
        entries: json.entries,
      });
      setSelectedDate(json.date);
    }
  }, [adminUserId]);

  useEffect(() => {
    fetchDay();
  }, [fetchDay]);

  if (panel && data) {
    return (
      <EntryHistoryPanel
        type={panel}
        date={selectedDate}
        entries={data.entries}
        readOnly={readOnly}
        onClose={() => setPanel(null)}
        onSaved={() => fetchDay(selectedDate)}
        backLabel={backLabel}
      />
    );
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-600 font-medium">
        Loading daily accounts...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-20 text-center font-semibold text-red-700">
        Could not load finance data.
      </div>
    );
  }

  const { summary, entries, today } = data;
  const isToday = selectedDate === today;
  const canEdit = !readOnly;
  const showWhatsAppFab = canEdit && !adminUserId;
  const incomingCount = entries.filter((e) => e.type === "incoming").length;
  const outgoingCount = entries.filter((e) => e.type === "outgoing").length;

  return (
    <div className={`space-y-4 sm:space-y-5 ${showWhatsAppFab ? "pb-24" : ""}`}>
      {/* Top bar: back + date chip */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          {showPageBack && (
            <BackToDashboard href={backHref} label={backLabel} />
          )}
          <div>
            <h1 className="text-lg font-bold text-slate-900 sm:text-xl">
              {readOnly ? userName : `Hi, ${userName}`}
            </h1>
            <p className="text-sm font-medium text-slate-600">
              {ownerView
                ? "Owner view — read only. Use Activity log tab for login & entry history."
                : "Tap Incoming or Outgoing to add your amounts for the day."}
            </p>
          </div>
        </div>
        <DatePickerChip
          selectedDate={selectedDate}
          today={today}
          onSelect={(d) => fetchDay(d)}
        />
      </div>

      {/* Balance card */}
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-600 to-indigo-800 p-5 text-white shadow-lg">
        <p className="text-xs font-bold uppercase tracking-wider text-indigo-200">
          Total balance
        </p>
        <p className="mt-1 text-4xl font-extrabold tabular-nums sm:text-5xl">
          {formatINR(summary.closingBalance)}
        </p>
        <p className="mt-2 text-sm font-medium text-indigo-100">
          Opening {formatINR(summary.openingBalance)} · Day net{" "}
          <span className={summary.dayNet >= 0 ? "text-green-300" : "text-red-300"}>
            {summary.dayNet >= 0 ? "+" : ""}
            {formatINR(summary.dayNet)}
          </span>
        </p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border-2 border-green-300 bg-green-50 p-3">
          <p className="text-xs font-bold uppercase text-green-800">Incoming</p>
          <AmountDisplay amount={summary.totalIncoming} size="lg" variant="incoming" />
        </div>
        <div className="rounded-xl border-2 border-red-300 bg-red-50 p-3">
          <p className="text-xs font-bold uppercase text-red-800">Outgoing</p>
          <AmountDisplay amount={summary.totalOutgoing} size="lg" variant="outgoing" />
        </div>
      </div>

      {/* WhatsApp-style chat shortcuts */}
      <div className="space-y-3">
        <p className="text-sm font-bold text-slate-800">Open chat</p>
        <button
          type="button"
          onClick={() => setPanel("incoming")}
          className="flex w-full items-center gap-3 rounded-2xl border-2 border-green-400 bg-white p-4 shadow-sm active:scale-[0.99]"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-2xl text-white">
            +
          </span>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-lg font-bold text-slate-900">Incoming</p>
            <p className="text-2xl font-extrabold tabular-nums text-green-700">
              {formatINR(summary.totalIncoming)}
            </p>
            <p className="text-sm font-medium text-slate-600">
              {incomingCount} {incomingCount === 1 ? "message" : "messages"}
            </p>
          </div>
          <svg className="h-5 w-5 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => setPanel("outgoing")}
          className="flex w-full items-center gap-3 rounded-2xl border-2 border-red-400 bg-white p-4 shadow-sm active:scale-[0.99]"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ea0038] text-2xl text-white">
            −
          </span>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-lg font-bold text-slate-900">Outgoing</p>
            <p className="text-2xl font-extrabold tabular-nums text-red-700">
              {formatINR(summary.totalOutgoing)}
            </p>
            <p className="text-sm font-medium text-slate-600">
              {outgoingCount} {outgoingCount === 1 ? "message" : "messages"}
            </p>
          </div>
          <svg className="h-5 w-5 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="rounded-xl border-2 border-slate-200 bg-white p-4">
        <p className="text-xs font-bold uppercase text-slate-600">Today&apos;s calculation</p>
        <p className="mt-2 text-sm font-semibold text-slate-800">
          {formatINR(summary.openingBalance)} + {formatINR(summary.totalIncoming)} −{" "}
          {formatINR(summary.totalOutgoing)} ={" "}
          <span className="text-lg font-extrabold text-slate-900">
            {formatINR(summary.closingBalance)}
          </span>
        </p>
      </div>

      {ownerView && !canEdit && (
        <p className="rounded-xl border-2 border-amber-300 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900">
          Owner view — you cannot edit this user&apos;s entries here.
        </p>
      )}

      {canEdit && !isToday && (
        <p className="rounded-xl border-2 border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-900">
          Viewing a past day — you can still add entries in chat.
        </p>
      )}

      {showWhatsAppFab && <WhatsAppFab />}
    </div>
  );
}
