"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { canAccess, labelForRole, requiredRoleForPath } from "@/lib/permissions";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, role, loading, authError, login } = useAuth();
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
          {authError ? (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {authError}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  if (!canAccess(pathname, role)) {
    return (
      <div className="p-8">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <div className="font-semibold">You do not have permission to access this page.</div>
          <div className="mt-1">Current role: {labelForRole(role)}. Required role: {requiredRoleForPath(pathname)}.</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
