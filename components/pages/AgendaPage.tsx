"use client";

import { AppShell } from "@/components/layout/AppShell";
import { RealtimeTable } from "@/components/tables/RealtimeTable";
import { qAgenda } from "@/lib/queries";
import { useCollectionSource } from "@/lib/useDataSource";
import { sortByFields } from "@/lib/utils";

const columns = [
  { key: "date", label: "Date" },
  { key: "startTime", label: "Start" },
  { key: "endTime", label: "End" },
  { key: "session", label: "Session" },
  { key: "title", label: "Title" },
  { key: "speaker", label: "Speaker" },
  { key: "room", label: "Room" },
  { key: "notes", label: "Notes" }
];

export function AgendaPage() {
  const { data } = useCollectionSource<Record<string, unknown>>("agenda_items", qAgenda());
  const rows = sortByFields(data, ["date", "startTime", "title"]);
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Agenda</h1>
        <p className="text-sm text-slate-500">Realtime agenda/session view.</p>
      </div>
      <RealtimeTable rows={rows} columns={columns} />
    </AppShell>
  );
}
