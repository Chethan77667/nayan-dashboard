"use client";

import { formatDisplayDate } from "@/lib/date";
import { useEffect, useRef, useState } from "react";
import FinanceCalendar from "./FinanceCalendar";

interface DatePickerChipProps {
  selectedDate: string;
  today: string;
  onSelect: (date: string) => void;
}

export default function DatePickerChip({
  selectedDate,
  today,
  onSelect,
}: DatePickerChipProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const dayNum = parseInt(selectedDate.split("-")[2], 10);
  const isToday = selectedDate === today;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 rounded-full border-2 border-indigo-200 bg-white px-3 py-2 shadow-sm transition hover:border-indigo-400 hover:bg-indigo-50"
        aria-expanded={open}
        aria-label="Pick date"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-white">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </span>
        <span className="text-left">
          <span className="block text-[10px] font-bold uppercase tracking-wide text-indigo-600">
            {isToday ? "Today" : "Selected day"}
          </span>
          <span className="block text-sm font-bold text-slate-900 leading-tight">
            {formatDisplayDate(selectedDate)}
          </span>
        </span>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-lg font-extrabold text-indigo-700">
          {dayNum}
        </span>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-40 mt-2 w-[min(100vw-2rem,320px)] shadow-xl">
          <FinanceCalendar
            selectedDate={selectedDate}
            today={today}
            onSelect={(d) => {
              onSelect(d);
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
