import type { UserRole } from "./types";

export function isOpsRole(role?: UserRole | null) {
  return role === "admin" || role === "logistics" || role === "program";
}

export function canAccess(path: string, role?: UserRole | null) {
  if (!role) return false;
  if (role === "admin") return true;
  if (role === "guest") return path.startsWith("/me");
  if (path.startsWith("/me")) return true;
  if (path.startsWith("/admin")) return false;
  if (["/flights-pickup", "/hotel"].some((p) => path.startsWith(p))) {
    return role === "logistics";
  }
  if (["/dashboard", "/vip", "/ueh", "/agenda", "/data-quality", "/sync-logs"].some((p) => path.startsWith(p))) {
    return role === "program" || role === "logistics";
  }
  return false;
}

export function requiredRoleForPath(path: string) {
  if (path.startsWith("/me")) return "signed-in guest";
  if (path.startsWith("/admin")) return "admin";
  if (["/flights-pickup", "/hotel"].some((p) => path.startsWith(p))) return "logistics or admin";
  if (["/dashboard", "/vip", "/ueh", "/agenda", "/data-quality", "/sync-logs"].some((p) => path.startsWith(p))) return "program, logistics, or admin";
  return "authorized user";
}

export function labelForRole(role?: UserRole | null) {
  return role || "guest";
}
