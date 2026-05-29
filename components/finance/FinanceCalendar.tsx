"use client";

import { formatDisplayDate } from "@/lib/date";
import { useMemo } from "react";

interface FinanceCalendarProps {
  selectedDate: string;
  today: string;
  onSelect: (date: string) => void;
}

export default function FinanceCalendar({
  selectedDate,
  today,
  onSelect,
}: FinanceCalendarProps) {
  const [year, month] = selectedDate.split("-").map(Number);

  const days = useMemo(() => {
    const first = new Date(year, month - 1, 1);
    const last = new Date(year, month, 0).getDate();
    const startPad = first.getDay();
    const cells: (string | null)[] = [];

    for (let i = 0; i < startPad; i++) cells.push(null);
    const mm = String(month).padStart(2, "0");
    for (let d = 1; d <= last; d++) {
      cells.push(`${year}-${mm}-${String(d).padStart(2, "0")}`);
    }
    return cells;
  }, [year, month]);

  const shiftMonth = (delta: number) => {
    const d = new Date(year, month - 1 + delta, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = Math.min(
      parseInt(selectedDate.split("-")[2], 10),
      new Date(y, d.getMonth() + 1, 0).getDate()
    );
    onSelect(`${y}-${m}-${String(day).padStart(2, "0")}`);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          className="rounded-lg px-2 py-1 text-sm text-slate-600 hover:bg-slate-100"
        >
          ←
        </button>
        <p className="text-sm font-semibold text-slate-800">
          {new Date(year, month - 1).toLocaleDateString("en-IN", {
            month: "long",
            year: "numeric",
          })}
        </p>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          className="rounded-lg px-2 py-1 text-sm text-slate-600 hover:bg-slate-100"
        >
          →
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((dateKey, i) =>
          dateKey ? (
            <button
              key={dateKey}
              type="button"
              disabled={dateKey > today}
              onClick={() => onSelect(dateKey)}
              className={`relative rounded-lg py-2 text-xs font-medium transition ${
                dateKey === selectedDate
                  ? "bg-indigo-600 text-white"
                  : dateKey === today
                    ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200"
                    : dateKey > today
                      ? "cursor-not-allowed text-slate-300"
                      : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {parseInt(dateKey.split("-")[2], 10)}
            </button>
          ) : (
            <span key={`empty-${i}`} />
          )
        )}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
        <p className="text-xs text-slate-500">{formatDisplayDate(selectedDate)}</p>
        {selectedDate !== today && (
          <button
            type="button"
            onClick={() => onSelect(today)}
            className="text-xs font-medium text-indigo-600 hover:underline"
          >
            Go to today
          </button>
        )}
      </div>
    </div>
  );
}
