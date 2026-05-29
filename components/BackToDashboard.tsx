import Link from "next/link";

interface BackToDashboardProps {
  href: string;
  label?: string;
  className?: string;
}

export default function BackToDashboard({
  href,
  label = "Back to dashboard",
  className = "",
}: BackToDashboardProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-full border-2 border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 shadow-sm transition hover:border-indigo-400 hover:bg-indigo-50 ${className}`}
    >
      <svg className="h-5 w-5 shrink-0 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      {label}
    </Link>
  );
}
