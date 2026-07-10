"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { cn } from "@/lib/utils";
import { BarChart3, CalendarDays, DatabaseZap, Hotel, Plane, ShieldAlert, Star, University, Users } from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/vip", label: "VIP", icon: Star },
  { href: "/ueh", label: "UEH", icon: University },
  { href: "/flights-pickup", label: "Flights & Pickup", icon: Plane },
  { href: "/hotel", label: "Hotel", icon: Hotel },
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/data-quality", label: "Data Quality", icon: ShieldAlert },
  { href: "/sync-logs", label: "Sync Logs", icon: DatabaseZap },
  { href: "/admin/sensitive", label: "Sensitive", icon: Users }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, role, logout } = useAuth();

  return (
    <RequireAuth>
      <div className="min-h-screen bg-slate-50">
        <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r bg-white lg:block">
          <div className="border-b px-5 py-5">
            <div className="text-sm font-semibold text-blue-600">RTD 2026</div>
            <div className="mt-1 text-lg font-bold text-slate-900">Live Operations</div>
          </div>
          <nav className="space-y-1 p-3">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link key={item.href} href={item.href} className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium", active ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100")}> 
                  <Icon className="h-4 w-4" /> {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="lg:pl-64">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white/90 px-6 backdrop-blur">
            <div>
              <div className="text-sm font-medium text-slate-900">Realtime dashboard</div>
              <div className="text-xs text-slate-500">Live from Firestore sync collections</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">Live</span>
              <span className="hidden text-xs text-slate-500 sm:inline">{user?.email} · {role}</span>
              <button onClick={logout} className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-slate-100">Logout</button>
            </div>
          </header>
          <div className="p-6">{children}</div>
        </main>
      </div>
    </RequireAuth>
  );
}
