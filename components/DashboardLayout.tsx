"use client";

import { useState } from "react";
import BackToDashboard from "./BackToDashboard";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userName: string;
  role: string;
  links: { href: string; label: string }[];
  backHref?: string;
  backLabel?: string;
}

export default function DashboardLayout({
  children,
  userName,
  role,
  links,
  backHref,
  backLabel,
}: DashboardLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const dashboardHref = role === "admin" ? "/admin/dashboard" : "/dashboard";

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <Navbar
        userName={userName}
        role={role}
        onMenuToggle={() => setMenuOpen((o) => !o)}
        dashboardHref={dashboardHref}
      />

      <div className="flex flex-1 overflow-hidden">
        {menuOpen && (
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setMenuOpen(false)}
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-slate-200 bg-slate-50 pt-16 transition-transform duration-300 ease-out lg:static lg:z-auto lg:translate-x-0 lg:pt-0 ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-4" onClick={() => setMenuOpen(false)}>
            <Sidebar links={links} dashboardHref={dashboardHref} />
          </div>
        </aside>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
          {backHref && (
            <div className="mb-4">
              <BackToDashboard href={backHref} label={backLabel} />
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
