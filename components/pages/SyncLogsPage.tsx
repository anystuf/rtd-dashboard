"use client";

import { AppShell } from "@/components/layout/AppShell";
import { RealtimeTable } from "@/components/tables/RealtimeTable";
import { useCollection } from "@/lib/useFirestore";
import { qSyncLogs } from "@/lib/queries";
import { formatDateTime } from "@/lib/utils";

const columns = [
  { key: "sourceKey", label: "Source" },
  { key: "status", label: "Status" },
  { key: "rowsRead", label: "Rows read" },
  { key: "rowsInserted", label: "Inserted" },
  { key: "rowsUpdated", label: "Updated" },
  { key: "issuesCreated", label: "Issues" },
  { key: "startedAt", label: "Started", render: (row: Record<string, unknown>) => formatDateTime(row.startedAt) },
  { key: "finishedAt", label: "Finished", render: (row: Record<string, unknown>) => formatDateTime(row.finishedAt) },
  { key: "errorMessage", label: "Error" }
];

export function SyncLogsPage() {
  const { data } = useCollection<Record<string, unknown>>(qSyncLogs());
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Sync Logs</h1>
        <p className="text-sm text-slate-500">Latest Google Sheets sync runs.</p>
      </div>
      <RealtimeTable rows={data} columns={columns} />
    </AppShell>
  );
}
