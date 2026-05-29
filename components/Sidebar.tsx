"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import WhatsAppLogo from "@/components/chat/WhatsAppLogo";
import BackToDashboard from "./BackToDashboard";

interface SidebarLink {
  href: string;
  label: string;
}

interface SidebarProps {
  links: SidebarLink[];
  dashboardHref?: string;
  showDashboardBack?: boolean;
}

export default function Sidebar({
  links,
  dashboardHref = "/dashboard",
  showDashboardBack = true,
}: SidebarProps) {
  const pathname = usePathname();
  const isOnMainDashboard =
    pathname === dashboardHref || pathname === "/dashboard" || pathname === "/admin/dashboard";

  return (
    <nav className="flex flex-col gap-2">
      {showDashboardBack && !isOnMainDashboard && (
        <BackToDashboard href={dashboardHref} className="mb-2 w-full justify-center" />
      )}
      {links.map((link) => {
        const active = pathname === link.href;
        const isChat = link.href.includes("/chat");
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold transition ${
              active
                ? isChat
                  ? "bg-[#25D366] text-white shadow-sm"
                  : "bg-indigo-600 text-white"
                : isChat
                  ? "text-[#075e54] hover:bg-[#25D366]/10"
                  : "text-slate-800 hover:bg-slate-200"
            }`}
          >
            {isChat && (
              <WhatsAppLogo size={24} className="shrink-0 rounded-full" />
            )}
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
