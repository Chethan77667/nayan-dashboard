"use client";

import DailyFinanceTracker from "@/components/finance/DailyFinanceTracker";
import UserTrackingPanel from "./UserTrackingPanel";
import { useState } from "react";

type AdminUserDetailTabsProps = {
  userId: string;
  userName: string;
  userEmail: string;
};

export default function AdminUserDetailTabs({
  userId,
  userName,
  userEmail,
}: AdminUserDetailTabsProps) {
  const [tab, setTab] = useState<"accounts" | "activity">("accounts");

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

      {tab === "accounts" && (
        <DailyFinanceTracker
          userName={userName}
          readOnly
          adminUserId={userId}
          backHref="/admin/dashboard"
          backLabel="Back to dashboard"
          ownerView
        />
      )}

      {tab === "activity" && <UserTrackingPanel userId={userId} />}
    </div>
  );
}
