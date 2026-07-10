"use client";

import { AppShell } from "@/components/layout/AppShell";
import { RealtimeTable } from "@/components/tables/RealtimeTable";
import { qHotel } from "@/lib/queries";
import { useCollectionSource } from "@/lib/useDataSource";

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
  const { data } = useCollectionSource<Record<string, unknown>>("hotel_bookings", qHotel());
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
