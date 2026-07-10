import type { UserRole } from "./types";

export function canAccess(path: string, role?: UserRole | null) {
  if (!role) return false;
  if (role === "admin") return true;
  if (path.startsWith("/admin")) return false;
  if (["/flights-pickup", "/hotel"].some((p) => path.startsWith(p))) {
    return role === "logistics";
  }
  if (["/data-quality", "/sync-logs"].some((p) => path.startsWith(p))) {
    return role === "program" || role === "logistics";
  }
  return true;
}

export function labelForRole(role?: UserRole | null) {
  return role || "viewer";
}
