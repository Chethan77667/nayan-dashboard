"use client";

import { formatDisplayDate } from "@/lib/date";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  const updateMenuPos = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const width = Math.min(window.innerWidth - 16, 320);
    const left = Math.min(Math.max(8, rect.left), window.innerWidth - width - 8);
    setMenuPos({ top: rect.bottom + 8, left });
  }, []);

  useEffect(() => {
    if (!open) return;
    updateMenuPos();
    const onResize = () => updateMenuPos();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [open, updateMenuPos]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        const menu = document.getElementById("date-picker-calendar-menu");
        if (menu?.contains(e.target as Node)) return;
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const dayNum = parseInt(selectedDate.split("-")[2], 10);
  const isToday = selectedDate === today;

  const calendarMenu =
    open &&
    mounted &&
    createPortal(
      <div
        id="date-picker-calendar-menu"
        className="fixed z-[100] w-[min(calc(100vw-1rem),320px)] shadow-xl"
        style={{ top: menuPos.top, left: menuPos.left }}
      >
        <FinanceCalendar
          selectedDate={selectedDate}
          today={today}
          onSelect={(d) => {
            onSelect(d);
            setOpen(false);
          }}
        />
      </div>,
      document.body
    );

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => {
          if (!open) updateMenuPos();
          setOpen((o) => !o);
        }}
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
          <span className="block text-sm font-bold leading-tight text-slate-900">
            {formatDisplayDate(selectedDate)}
          </span>
        </span>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-lg font-extrabold text-indigo-700">
          {dayNum}
        </span>
      </button>
      {calendarMenu}
    </div>
  );
}
