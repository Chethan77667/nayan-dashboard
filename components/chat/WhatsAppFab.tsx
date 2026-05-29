"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import WhatsAppLogo from "./WhatsAppLogo";

/** Fixed WhatsApp FAB — portaled to body so it never scrolls with the page (Lenis-safe). */
export default function WhatsAppFab() {
  const [unread, setUnread] = useState(0);
  const [mounted, setMounted] = useState(false);

  const loadUnread = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/contacts");
      if (!res.ok) return;
      const data = await res.json();
      const total = (data.contacts ?? []).reduce(
        (sum: number, c: { unreadCount: number }) => sum + (c.unreadCount || 0),
        0
      );
      setUnread(total);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    loadUnread();
    const id = setInterval(loadUnread, 8000);
    return () => clearInterval(id);
  }, [loadUnread]);

  if (!mounted) return null;

  const fab = (
    <Link
      href="/chat"
      data-lenis-prevent
      className="safe-bottom fixed bottom-5 left-4 z-[100] block transition hover:scale-105 active:scale-95 sm:bottom-6 sm:left-6"
      aria-label="Open WhatsApp chat"
      title="WhatsApp"
    >
      <span className="relative block">
        <WhatsAppLogo
          size={58}
          className="drop-shadow-[0_4px_14px_rgba(0,0,0,0.25)]"
        />
        {unread > 0 && (
          <span className="absolute -right-1 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ea0038] px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </span>
    </Link>
  );

  return createPortal(fab, document.body);
}
