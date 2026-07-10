"use client";

import { AppShell } from "@/components/layout/AppShell";
import { RealtimeTable } from "@/components/tables/RealtimeTable";
import { useCollection } from "@/lib/useFirestore";
import { qHotel } from "@/lib/queries";

const columns = [
  { key: "fullName", label: "Guest" },
  { key: "hotelName", label: "Hotel" },
  { key: "checkIn", label: "Check-in" },
  { key: "checkOut", label: "Check-out" },
  { key: "roomType", label: "Room" },
  { key: "supportStatus", label: "Support" },
  { key: "notes", label: "Notes" }
];

export function HotelPage() {
  const { data } = useCollection<Record<string, unknown>>(qHotel());
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Hotel</h1>
        <p className="text-sm text-slate-500">Restricted logistics view.</p>
      </div>
      <RealtimeTable rows={data} columns={columns} />
    </AppShell>
  );
}
