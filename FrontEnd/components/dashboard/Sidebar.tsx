"use client";

import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Notifications from "./Notifications";
import { isAdmin, toDisplayRole } from "@/lib/roles";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "⬡" },
  { href: "/projects", label: "Projects", icon: "◇" },
  { href: "/dashboard/issues", label: "Issues", icon: "⬢" },
  { href: "/dashboard/analytics", label: "Analytics", icon: "◈" },
  { href: "/dashboard/audit-log", label: "Audit Log", icon: "◉" },
  { href: "/dashboard/settings", label: "Settings", icon: "◎" },
];

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [openForPath, setOpenForPath] = useState<string | null>(null);
  const mobileOpen = openForPath === pathname;

  const setMobileOpen = (open: boolean | ((prev: boolean) => boolean)) => {
    setOpenForPath((prev) => {
      const currentlyOpen = prev === pathname;
      const nextOpen = typeof open === "function" ? open(currentlyOpen) : open;
      return nextOpen ? pathname : null;
    });
  };

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenForPath(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  const activeLabel =
    pathname === "/space"
      ? "Create Issue"
      : pathname === "/dashboard/admin"
      ? "User Management"
      : navItems.find((item) => item.href === pathname)?.label || "PestControl";

  const renderNavLinks = (onNavigate?: () => void) => (
    <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-all duration-150 group
              ${isActive
                ? "bg-[#1ef2c1]/10 text-[#1ef2c1] border-l-2 border-[#1ef2c1]"
                : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 border-l-2 border-transparent"
              }`}
          >
            <span className={`text-base ${isActive ? "text-[#1ef2c1]" : "text-zinc-700 group-hover:text-zinc-400"}`}>
              {item.icon}
            </span>
            {item.label}
          </Link>
        );
      })}
      {isAdmin(session?.user?.role) && (
        <Link
          href="/dashboard/admin"
          onClick={onNavigate}
          className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-all duration-150 group mt-4
            ${pathname === "/dashboard/admin"
              ? "bg-[#1ef2c1]/10 text-[#1ef2c1] border-l-2 border-[#1ef2c1]"
              : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 border-l-2 border-transparent"
            }`}
        >
          <span className={`text-base ${pathname === "/dashboard/admin" ? "text-[#1ef2c1]" : "text-zinc-700 group-hover:text-zinc-400"}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </span>
          User Management
        </Link>
      )}
    </nav>
  );

  const renderUserCard = (showNotifications: boolean) => (
    <div className="px-4 py-4 border-t border-zinc-900">
      <div className="flex items-center gap-3">
        {session?.user?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={session.user.image}
            alt={session.user.name || "User"}
            className="w-8 h-8 rounded-full border border-zinc-700 shrink-0"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 text-xs font-bold shrink-0">
            {session?.user?.name?.[0] ?? "U"}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-zinc-300 text-xs font-medium truncate">
            {session?.user?.name ?? "Developer"}
          </p>
          <p className="text-[#1ef2c1]/70 text-[10px] truncate font-medium">
            {toDisplayRole(session?.user?.role)}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {showNotifications && <Notifications placement="sidebar" />}
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Sign out"
            aria-label="Sign out"
            className="p-2 text-zinc-500 hover:text-red-400 hover:bg-zinc-900/50 rounded-md transition-all flex items-center justify-center border border-transparent hover:border-zinc-800"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Compact Navigation Bar */}
      <div className="md:hidden sticky top-0 z-40 h-14 px-4 bg-[#0a0a0a]/95 backdrop-blur border-b border-zinc-900 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            id="mobile-nav-toggle"
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
            className="p-2 -ml-1 text-zinc-300 hover:text-[#1ef2c1] hover:bg-zinc-900 border border-zinc-800/80 rounded-md transition-colors shrink-0"
          >
            {mobileOpen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
          <div className="min-w-0">
            <p className="text-[10px] text-[#1ef2c1] tracking-[0.2em] uppercase font-bold truncate">
              PestControl
            </p>
            <p className="text-xs text-zinc-300 font-medium truncate">
              {activeLabel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Notifications placement="topbar" />
          <Link
            href="/space"
            className="bg-[#1ef2c1]/15 text-[#1ef2c1] border border-[#1ef2c1]/40 text-[11px] font-bold px-2.5 py-1.5 hover:bg-[#1ef2c1] hover:text-black transition-colors uppercase tracking-wider whitespace-nowrap"
          >
            + Issue
          </Link>
        </div>
      </div>

      {/* Mobile Collapsible Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside
            id="mobile-nav-drawer"
            aria-label="Mobile Navigation"
            className="relative z-10 w-72 max-w-[85vw] h-full bg-[#0a0a0a] border-r border-zinc-800 flex flex-col shadow-2xl"
          >
            <div className="px-5 py-4 border-b border-zinc-900 flex items-center justify-between gap-2">
              <p className="text-zinc-500 text-[10px] tracking-[0.25em] uppercase font-semibold">
                Bug Tracking System
              </p>
              <button
                type="button"
                aria-label="Close navigation menu"
                onClick={() => setMobileOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-md transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            {renderNavLinks(() => setMobileOpen(false))}
            {renderUserCard(false)}
          </aside>
        </div>
      )}

      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 min-h-screen bg-[#0a0a0a] border-r border-zinc-900 flex-col">
        {/* Brand */}
        <div className="px-6 py-5 border-b border-zinc-900">
          <div>
            <p className="text-zinc-600 text-[10px] tracking-[0.25em] uppercase">Bug Tracking System</p>
          </div>
        </div>

        {/* Navigation */}
        {renderNavLinks()}

        {/* User section */}
        {renderUserCard(true)}
      </aside>
    </>
  );
}
