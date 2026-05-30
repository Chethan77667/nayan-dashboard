"use client";

import DailyFinanceTracker from "@/components/finance/DailyFinanceTracker";
import { useHorizontalSwipe } from "@/components/useHorizontalSwipe";
import UserTrackingPanel from "./UserTrackingPanel";
import { useEffect, useState } from "react";

type AdminUserDetailTabsProps = {
  userId: string;
  userName: string;
  userEmail: string;
};

type Tab = "accounts" | "activity";

export default function AdminUserDetailTabs({
  userId,
  userName,
  userEmail,
}: AdminUserDetailTabsProps) {
  const [tab, setTab] = useState<Tab>("accounts");
  const [activityReady, setActivityReady] = useState(false);

  useEffect(() => {
    if (tab === "activity") setActivityReady(true);
  }, [tab]);

  const swipe = useHorizontalSwipe({
    onSwipeLeft: () => setTab((t) => (t === "accounts" ? "activity" : t)),
    onSwipeRight: () => setTab((t) => (t === "activity" ? "accounts" : t)),
  });

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-slate-600">{userEmail}</p>

      <div
        className="flex gap-2 rounded-xl border-2 border-indigo-200 bg-indigo-50 p-1"
        role="tablist"
        aria-label="Owner view sections"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "accounts"}
          onClick={() => setTab("accounts")}
          className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-bold transition ${
            tab === "accounts"
              ? "bg-white text-indigo-900 shadow-sm"
              : "text-indigo-700 hover:bg-white/60"
          }`}
        >
          Daily accounts
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "activity"}
          onClick={() => setTab("activity")}
          className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-bold transition ${
            tab === "activity"
              ? "bg-white text-indigo-900 shadow-sm"
              : "text-indigo-700 hover:bg-white/60"
          }`}
        >
          Activity log
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 md:hidden" aria-hidden>
        <span
          className={`h-1.5 rounded-full transition-all ${
            tab === "accounts" ? "w-7 bg-indigo-600" : "w-2 bg-indigo-300"
          }`}
        />
        <span
          className={`h-1.5 rounded-full transition-all ${
            tab === "activity" ? "w-7 bg-indigo-600" : "w-2 bg-indigo-300"
          }`}
        />
      </div>

      <p className="text-center text-xs font-medium text-indigo-600 md:hidden">
        {tab === "accounts"
          ? "Swipe left for Activity log"
          : "Swipe right for Daily accounts"}
      </p>

      <div
        className="touch-pan-y overflow-hidden max-md:overflow-hidden"
        onTouchStart={swipe.onTouchStart}
        onTouchEnd={swipe.onTouchEnd}
      >
        <div
          className={`flex transition-transform duration-300 ease-out max-md:w-[200%] md:w-full md:transform-none ${
            tab === "accounts" ? "translate-x-0" : "-translate-x-1/2 md:translate-x-0"
          }`}
        >
          <div
            className={`min-w-0 max-md:w-1/2 max-md:pr-1 md:w-full ${
              tab === "accounts" ? "" : "md:hidden"
            }`}
          >
            <DailyFinanceTracker
              userName={userName}
              readOnly
              adminUserId={userId}
              backHref="/admin/dashboard"
              backLabel="Back to dashboard"
              ownerView
            />
          </div>

          <div
            className={`min-w-0 max-md:w-1/2 max-md:pl-1 md:w-full ${
              tab === "activity" ? "" : "md:hidden"
            }`}
          >
            {activityReady && <UserTrackingPanel userId={userId} />}
          </div>
        </div>
      </div>
    </div>
  );
}
