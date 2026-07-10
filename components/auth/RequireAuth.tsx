"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { canAccess } from "@/lib/permissions";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, role, loading, login } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">Loading RTD dashboard…</div>;
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
          <div className="mb-6">
            <p className="text-sm font-semibold text-blue-600">RTD 2026</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">Event operations dashboard</h1>
            <p className="mt-2 text-sm text-slate-500">Sign in with your authorized Google account.</p>
          </div>
          <button onClick={login} className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  if (!canAccess(pathname, role)) {
    return <div className="p-8 text-sm text-red-600">You do not have permission to access this page.</div>;
  }

  return <>{children}</>;
}
