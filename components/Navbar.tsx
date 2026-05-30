"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import BackToDashboard from "./BackToDashboard";
import NayanRLogo from "./NayanRLogo";

interface NavbarProps {
  userName?: string;
  role?: string;
  onMenuToggle?: () => void;
  dashboardHref?: string;
  showBack?: boolean;
}

export default function Navbar({
  userName,
  role,
  onMenuToggle,
  dashboardHref = "/dashboard",
  showBack = false,
}: NavbarProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/signin");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 sm:h-16 sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        {onMenuToggle && (
          <button
            type="button"
            onClick={onMenuToggle}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-700 lg:hidden"
            aria-label="Open menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        {showBack ? (
          <BackToDashboard href={dashboardHref} className="!py-2 !px-3 text-xs sm:text-sm" />
        ) : (
          <NayanRLogo href={dashboardHref} variant="dark" size="sm" />
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        {userName && (
          <span className="hidden max-w-[100px] truncate text-sm font-medium text-slate-700 sm:block sm:max-w-none">
            {userName}
            {role === "admin" && (
              <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-800">
                Owner
              </span>
            )}
          </span>
        )}
        <button
          onClick={handleSignOut}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-800 transition hover:bg-slate-50 sm:text-sm"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
