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
