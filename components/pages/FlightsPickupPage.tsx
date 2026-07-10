"use client";

import { AppShell } from "@/components/layout/AppShell";
import { RealtimeTable } from "@/components/tables/RealtimeTable";
import { useCollection } from "@/lib/useFirestore";
import { qFlights, qPickup } from "@/lib/queries";

const flightColumns = [
  { key: "fullName", label: "Guest" },
  { key: "direction", label: "Direction" },
  { key: "flightNo", label: "Flight" },
  { key: "airport", label: "Airport" },
  { key: "flightDatetime", label: "Flight time" },
  { key: "airline", label: "Airline" },
  { key: "notes", label: "Notes" }
];

const pickupColumns = [
  { key: "fullName", label: "Guest" },
  { key: "pickupRequired", label: "Required" },
  { key: "pickupDatetime", label: "Pickup time" },
  { key: "pickupLocation", label: "Pickup" },
  { key: "dropoffLocation", label: "Dropoff" },
  { key: "driver", label: "Driver" },
  { key: "vehicle", label: "Vehicle" },
  { key: "pickupStatus", label: "Status" }
];

export function FlightsPickupPage() {
  const flights = useCollection<Record<string, unknown>>(qFlights());
  const pickups = useCollection<Record<string, unknown>>(qPickup());
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Flights & Pickup</h1>
        <p className="text-sm text-slate-500">Restricted logistics view. Passport and DOB fields are excluded.</p>
      </div>
      <h2 className="mb-3 text-lg font-semibold text-slate-900">Flights</h2>
      <RealtimeTable rows={flights.data} columns={flightColumns} />
      <h2 className="mb-3 mt-8 text-lg font-semibold text-slate-900">Pickup tasks</h2>
      <RealtimeTable rows={pickups.data} columns={pickupColumns} />
    </AppShell>
  );
}
