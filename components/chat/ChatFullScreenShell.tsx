"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import NayanRLogo from "@/components/NayanRLogo";

type ChatFullScreenShellProps = {
  children: React.ReactNode;
  userName: string;
  role: string;
  dashboardHref: string;
};

/** Full-viewport WhatsApp-style shell (no sidebar). */
export default function ChatFullScreenShell({
  children,
  userName,
  role,
  dashboardHref,
}: ChatFullScreenShellProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/signin");
    router.refresh();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#111b21]">
      <header className="safe-top flex h-12 shrink-0 items-center justify-between gap-2 border-b border-[#2a3942] bg-[#202c33] px-3 text-white sm:h-14">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            href={dashboardHref}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-white/10"
            aria-label="Back to dashboard"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <NayanRLogo href={dashboardHref} variant="light" size="sm" showText={false} />
          <span className="truncate text-sm font-bold">{userName}</span>
          {role && (
            <span className="hidden rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase sm:inline">
              {role}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold text-white/90 hover:bg-white/10"
        >
          Sign out
        </button>
      </header>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
