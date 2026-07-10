import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(value?: unknown) {
  if (!value) return "—";
  try {
    const date = typeof value === "object" && value !== null && "toDate" in value
      ? (value as { toDate: () => Date }).toDate()
      : new Date(String(value));
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(date);
  } catch {
    return String(value);
  }
}

export function fmt(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

export function sortByText<T>(rows: T[], field: keyof T | string) {
  return [...rows].sort((a, b) => {
    const left = String((a as Record<string, unknown>)[String(field)] ?? "");
    const right = String((b as Record<string, unknown>)[String(field)] ?? "");
    return left.localeCompare(right, undefined, { sensitivity: "base" });
  });
}

export function sortByFields<T>(rows: T[], fields: Array<keyof T | string>) {
  return [...rows].sort((a, b) => {
    for (const field of fields) {
      const left = String((a as Record<string, unknown>)[String(field)] ?? "");
      const right = String((b as Record<string, unknown>)[String(field)] ?? "");
      const result = left.localeCompare(right, undefined, { sensitivity: "base" });
      if (result !== 0) return result;
    }
    return 0;
  });
}
