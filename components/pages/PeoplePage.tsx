"use client";

import { AppShell } from "@/components/layout/AppShell";
import { RealtimeTable } from "@/components/tables/RealtimeTable";
import { qPeople, qUEH, qVIP } from "@/lib/queries";
import { useCollectionSource } from "@/lib/useDataSource";
import { sortByText } from "@/lib/utils";
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
  const { data, loading, error } = useCollectionSource<Person>("people", q);
  const filtered = mode === "vip" ? data.filter((p) => p.isVIP) : mode === "ueh" ? data.filter((p) => p.isUEH) : data;
  const rows = sortByText(filtered, "fullName");
  const title = mode === "vip" ? "VIP Data" : mode === "ueh" ? "UEH Data" : "Participants";
  const desc = mode === "vip" ? "Sanitized VIP participant list." : mode === "ueh" ? "UEH-related people extracted from all sources." : "All normalized people.";

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-500">{desc}</p>
      </div>
      {error ? <div className="mb-4 max-w-full overflow-hidden rounded-lg bg-red-50 p-3 text-sm text-red-700 break-words">{error}</div> : null}
      <RealtimeTable rows={loading ? [] : rows} columns={columns} />
    </AppShell>
  );
}
