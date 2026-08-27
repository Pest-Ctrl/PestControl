"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "⬡" },
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
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Sign out"
            className="text-zinc-700 hover:text-red-400 transition-colors text-xs"
          >
            ⏻
          </button>
        </div>
      </div>
    </aside>
  );
}
