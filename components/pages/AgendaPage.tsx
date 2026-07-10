"use client";

import { AppShell } from "@/components/layout/AppShell";
import { RealtimeTable } from "@/components/tables/RealtimeTable";
import { useCollection } from "@/lib/useFirestore";
import { qAgenda } from "@/lib/queries";

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
  const { data } = useCollection<Record<string, unknown>>(qAgenda());
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Agenda</h1>
        <p className="text-sm text-slate-500">Realtime agenda/session view.</p>
      </div>
      <RealtimeTable rows={data} columns={columns} />
    </AppShell>
  );
}
