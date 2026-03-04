// app/dashboard/layout.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard, CheckSquare, Sparkles, Settings, Menu, X,
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/dashboard",        icon: LayoutDashboard, label: "Vue d'ensemble" },
  { href: "/dashboard/tasks",  icon: CheckSquare,     label: "Tâches"         },
  { href: "/dashboard/ai",     icon: Sparkles,        label: "Insights IA"    },
  { href: "/dashboard/settings", icon: Settings,      label: "Paramètres"     },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#09090e]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static z-30 h-full w-64 flex-shrink-0
        flex flex-col border-r border-slate-800 bg-[#0d0d14]
        transition-transform duration-200
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-800">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
            <Sparkles size={14} className="text-white" />
          </div>
          <span className="font-bold text-sm tracking-tight">ProductivityAI</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${active
                    ? "bg-violet-600/15 text-violet-300 border border-violet-700/30"
                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
                  }
                `}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t border-slate-800 flex items-center gap-3">
          <UserButton afterSignOutUrl="/" appearance={{ baseTheme: undefined }} />
          <span className="text-xs text-slate-500 font-medium">Mon compte</span>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#0d0d14]">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-400 hover:text-slate-200">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-violet-400" />
            <span className="font-bold text-sm">ProductivityAI</span>
          </div>
          <UserButton afterSignOutUrl="/" />
        </header>

        <main className="flex-1 overflow-auto p-6 md:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
