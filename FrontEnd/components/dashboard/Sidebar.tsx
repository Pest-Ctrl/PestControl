"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Notifications from "./Notifications";

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

  return (
    <aside className="w-64 min-h-screen bg-[#0a0a0a] border-r border-zinc-900 flex flex-col">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-zinc-900">
        <div>
          <p className="text-zinc-600 text-[10px] tracking-[0.25em] uppercase">Bug Tracking System</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-all duration-150 group
                ${isActive
                  ? "bg-[#1ef2c1]/10 text-[#1ef2c1] border-l-2 border-[#1ef2c1]"
                  : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 border-l-2 border-transparent"
                }`}
            >
              <span className={`font-mono text-base ${isActive ? "text-[#1ef2c1]" : "text-zinc-700 group-hover:text-zinc-400"}`}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
        {session?.user?.role === "Project Manager" && (
          <Link
            href="/dashboard/admin"
            className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-all duration-150 group mt-4
              ${pathname === "/dashboard/admin"
                ? "bg-[#1ef2c1]/10 text-[#1ef2c1] border-l-2 border-[#1ef2c1]"
                : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 border-l-2 border-transparent"
              }`}
          >
            <span className={`font-mono text-base ${pathname === "/dashboard/admin" ? "text-[#1ef2c1]" : "text-zinc-700 group-hover:text-zinc-400"}`}>
              {/* Shield Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </span>
            User Management
          </Link>
        )}
      </nav>

      {/* User section */}
      <div className="px-4 py-4 border-t border-zinc-900">
        <div className="flex items-center gap-3">
          {session?.user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={session.user.image}
              alt={session.user.name || "User"}
              className="w-8 h-8 rounded-full border border-zinc-700"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 text-xs font-bold">
              {session?.user?.name?.[0] ?? "U"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-zinc-300 text-xs font-medium truncate">
              {session?.user?.name ?? "Developer"}
            </p>
            <p className="text-zinc-600 text-[10px] truncate">
              {session?.user?.email ?? ""}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Notifications />
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              title="Sign out"
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
    </aside>
  );
}
