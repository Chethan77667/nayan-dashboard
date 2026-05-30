"use client";

import DatePickerChip from "@/components/finance/DatePickerChip";
import { formatINR } from "@/lib/currency";
import { formatDisplayDate, toDateKey } from "@/lib/date";
import { useCallback, useEffect, useState } from "react";

type AuthEventRow = {
  id: string;
  type: "login" | "logout";
  at: string;
  userAgent: string;
};

type FinanceAuditRow = {
  id: string;
  action: "create" | "update" | "delete";
  entryType: "incoming" | "outgoing";
  amount: number;
  reason: string;
  date: string;
  at: string;
};

export default function UserTrackingPanel({ userId }: { userId: string }) {
  const [selectedDate, setSelectedDate] = useState(() => toDateKey());
  const [today, setToday] = useState(() => toDateKey());
  const [authEvents, setAuthEvents] = useState<AuthEventRow[]>([]);
  const [financeAudits, setFinanceAudits] = useState<FinanceAuditRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (date: string) => {
    setLoading(true);
    const res = await fetch(`/api/admin/users/${userId}/tracking?date=${date}`);
    setLoading(false);
    if (!res.ok) return;
    const data = await res.json();
    setToday(data.today ?? toDateKey());
    setAuthEvents(data.authEvents ?? []);
    setFinanceAudits(data.financeAudits ?? []);
  }, [userId]);

  useEffect(() => {
    load(selectedDate);
  }, [load, selectedDate]);

  const formatWhen = (iso: string) =>
    new Date(iso).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Activity log</h2>
          <p className="text-sm font-medium text-slate-600">
            Login and entry changes for the selected day.
          </p>
        </div>
        <DatePickerChip
          selectedDate={selectedDate}
          today={today}
          onSelect={setSelectedDate}
        />
      </div>

      {loading ? (
        <p className="text-sm font-medium text-slate-600">Loading activity...</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border-2 border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-base font-bold text-slate-900">Login & logout</h3>
            <p className="mt-1 text-xs font-medium text-slate-600">
              Sign-in and sign-out on {formatDisplayDate(selectedDate)}
            </p>
            {authEvents.length === 0 ? (
              <p className="mt-4 text-sm text-slate-600">No login or logout on this day.</p>
            ) : (
              <ul className="mt-3 max-h-72 space-y-2 overflow-y-auto">
                {authEvents.map((e) => (
                  <li
                    key={e.id}
                    className="flex items-start justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm"
                  >
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${
                        e.type === "login"
                          ? "bg-green-100 text-green-900"
                          : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {e.type === "login" ? "Login" : "Logout"}
                    </span>
                    <span className="text-right font-medium text-slate-800">
                      {formatWhen(e.at)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-xl border-2 border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-base font-bold text-slate-900">Incoming / outgoing changes</h3>
            <p className="mt-1 text-xs font-medium text-slate-600">
              Entries added, edited, or deleted on {formatDisplayDate(selectedDate)}
            </p>
            {financeAudits.length === 0 ? (
              <p className="mt-4 text-sm text-slate-600">No entry changes on this day.</p>
            ) : (
              <ul className="mt-3 max-h-72 space-y-2 overflow-y-auto">
                {financeAudits.map((a) => (
                  <li
                    key={a.id}
                    className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-bold capitalize text-indigo-900">
                        {a.action}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-bold capitalize ${
                          a.entryType === "incoming"
                            ? "bg-green-100 text-green-900"
                            : "bg-red-100 text-red-900"
                        }`}
                      >
                        {a.entryType}
                      </span>
                      <span className="font-bold tabular-nums text-slate-900">
                        {formatINR(a.amount)}
                      </span>
                    </div>
                    {a.reason && <p className="mt-1 text-slate-700">{a.reason}</p>}
                    <p className="mt-1 text-[11px] font-medium text-slate-500">
                      {formatWhen(a.at)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
