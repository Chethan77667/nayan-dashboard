const TIMEZONE = "Asia/Kolkata";

/** YYYY-MM-DD in local business timezone (midnight rollover at 12:00 AM IST). */
export function toDateKey(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE }).format(date);
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatDisplayDate(key: string): string {
  const date = parseDateKey(key);
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getMonthDays(year: number, month: number): string[] {
  const days: string[] = [];
  const last = new Date(year, month, 0).getDate();
  const mm = String(month).padStart(2, "0");
  for (let d = 1; d <= last; d++) {
    days.push(`${year}-${mm}-${String(d).padStart(2, "0")}`);
  }
  return days;
}

export function isValidDateKey(key: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return false;
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return (
    dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d
  );
}
