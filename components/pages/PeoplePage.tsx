"use client";

import { AppShell } from "@/components/layout/AppShell";
import { RealtimeTable } from "@/components/tables/RealtimeTable";
import { useCollection } from "@/lib/useFirestore";
import { qPeople, qUEH, qVIP } from "@/lib/queries";
import type { Person } from "@/lib/types";

const columns = [
  { key: "fullName", label: "Full name" },
  { key: "academicTitle", label: "Title" },
  { key: "organization", label: "Organization" },
  { key: "department", label: "Department" },
  { key: "country", label: "Country" },
  { key: "role", label: "Role" },
  { key: "email", label: "Email" },
  { key: "issueCount", label: "Issues" }
];

export function PeoplePage({ mode }: { mode: "all" | "vip" | "ueh" }) {
  const q = mode === "vip" ? qVIP() : mode === "ueh" ? qUEH() : qPeople();
  const { data, loading, error } = useCollection<Person>(q);
  const title = mode === "vip" ? "VIP Data" : mode === "ueh" ? "UEH Data" : "Participants";
  const desc = mode === "vip" ? "Sanitized VIP participant list." : mode === "ueh" ? "UEH-related people extracted from all sources." : "All normalized people.";

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-500">{desc}</p>
      </div>
      {error ? <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
      <RealtimeTable rows={loading ? [] : data} columns={columns} />
    </AppShell>
  );
}
