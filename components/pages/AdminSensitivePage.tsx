"use client";

import { AppShell } from "@/components/layout/AppShell";
import { useCollection } from "@/lib/useFirestore";
import { collection, limit, query } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { RealtimeTable } from "@/components/tables/RealtimeTable";

const columns = [
  { key: "personId", label: "Person ID" },
  { key: "passportNo", label: "Passport", render: () => "••••••••" },
  { key: "dateOfBirth", label: "DOB", render: () => "••••••••" },
  { key: "passportName", label: "Passport name" },
  { key: "phone", label: "Phone", render: () => "••••••••" }
];

export function AdminSensitivePage() {
  const { data } = useCollection<Record<string, unknown>>(query(collection(db, "person_sensitive"), limit(100)));
  return (
    <AppShell>
      <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">
        <h1 className="text-2xl font-bold text-red-900">Sensitive Data</h1>
        <p className="text-sm text-red-700">Admin-only. Values are masked by default. Use raw Firestore only when operationally necessary.</p>
      </div>
      <RealtimeTable rows={data} columns={columns} />
    </AppShell>
  );
}
