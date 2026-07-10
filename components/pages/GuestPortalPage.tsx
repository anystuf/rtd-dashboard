"use client";

import { FormEvent, useMemo, useState } from "react";
import { httpsCallable } from "firebase/functions";
import { doc } from "firebase/firestore";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/components/auth/AuthProvider";
import { functions, db } from "@/lib/firebaseClient";
import { qFlightsForPerson, qGuestAccess, qHotelForPerson, qParticipationForPerson, qPickupForPerson } from "@/lib/queries";
import { useCollection, useDoc } from "@/lib/useFirestore";
import type { FlightSegment, GuestAccess, HotelBooking, Participation, Person, PersonSensitive, PickupTask } from "@/lib/types";
import { fmt } from "@/lib/utils";

function Field({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="rounded-lg border bg-white p-3">
      <div className="text-xs font-semibold uppercase text-slate-400">{label}</div>
      <div className="mt-1 min-h-5 text-sm font-medium text-slate-800">{fmt(value)}</div>
    </div>
  );
}

function MiniList({ title, rows, fields }: { title: string; rows: Record<string, unknown>[]; fields: string[] }) {
  return (
    <section>
      <h2 className="mb-3 text-base font-semibold text-slate-900">{title}</h2>
      {!rows.length ? (
        <div className="rounded-lg border bg-white p-4 text-sm text-slate-500">No data yet.</div>
      ) : (
        <div className="grid gap-3">
          {rows.map((row, idx) => (
            <div key={String(row.id || idx)} className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-3">
              {fields.map((field) => <Field key={field} label={field} value={row[field]} />)}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function PersonBundle({ access }: { access: GuestAccess }) {
  const person = useDoc<Person>(doc(db, "people", access.personId || "__none__"));
  const sensitive = useDoc<PersonSensitive>(doc(db, "person_sensitive", access.personId || "__none__"));
  const participation = useCollection<Participation>(qParticipationForPerson(access.personId || "__none__"));
  const hotels = useCollection<HotelBooking>(qHotelForPerson(access.personId || "__none__"));
  const flights = useCollection<FlightSegment>(qFlightsForPerson(access.personId || "__none__"));
  const pickups = useCollection<PickupTask>(qPickupForPerson(access.personId || "__none__"));
  const p = person.data;
  const s = sensitive.data;

  return (
    <div className="space-y-6">
      <section className="rounded-lg border bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{p?.fullName || access.fullName || "My RTD Info"}</h1>
            <p className="mt-1 text-sm text-slate-500">{p?.organization || p?.department || "RTD 2026 participant"}</p>
          </div>
          <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            Linked account
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <Field label="Academic title" value={p?.academicTitle} />
          <Field label="Email" value={p?.email} />
          <Field label="Country" value={p?.country} />
          <Field label="Nationality" value={p?.nationality} />
          <Field label="Role" value={p?.role} />
          <Field label="Position" value={p?.positionTitle} />
          <Field label="Passport name" value={s?.passportName} />
          <Field label="Passport no." value={s?.passportNo} />
          <Field label="Date of birth" value={s?.dateOfBirth} />
        </div>
      </section>

      <MiniList title="Conference information" rows={participation.data as unknown as Record<string, unknown>[]} fields={["session", "presentationTitle", "conferenceRole", "typeOfAttendance", "attendConference", "attendanceConfirmStatus"]} />
      <MiniList title="Hotel" rows={hotels.data as unknown as Record<string, unknown>[]} fields={["hotelName", "checkIn", "checkOut", "roomType", "supportStatus", "notes"]} />
      <MiniList title="Flights" rows={flights.data as unknown as Record<string, unknown>[]} fields={["direction", "flightNo", "airport", "flightDatetime", "airline", "notes"]} />
      <MiniList title="Pickup / Transfer" rows={pickups.data as unknown as Record<string, unknown>[]} fields={["pickupDatetime", "pickupLocation", "dropoffLocation", "driver", "vehicle", "pickupStatus"]} />
    </div>
  );
}

export function GuestPortalPage() {
  const { user } = useAuth();
  const access = useCollection<GuestAccess>(qGuestAccess(user?.uid || "__none__"));
  const [fullName, setFullName] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const firstAccess = useMemo(() => access.data[0], [access.data]);

  async function claim(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const fn = httpsCallable(functions, "claimGuestAccess");
      const result = await fn({ fullName, code });
      const data = result.data as { fullName?: string };
      setMessage(`Linked successfully: ${data.fullName || fullName}`);
      setFullName("");
      setCode("");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not link this account.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My RTD Info</h1>
          <p className="text-sm text-slate-500">Only records linked to your signed-in account are visible here.</p>
        </div>
        <div className="text-xs text-slate-500">Signed in as {user?.email}</div>
      </div>

      {firstAccess ? (
        <PersonBundle access={firstAccess} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <form onSubmit={claim} className="rounded-lg border bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Link my guest record</h2>
            <p className="mt-1 text-sm text-slate-500">Enter your full name exactly as registered, plus phone/code/passport ending if available. Staff can also link accounts manually.</p>
            <label className="mt-5 block text-sm font-medium text-slate-700">
              Full name
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" required />
            </label>
            <label className="mt-4 block text-sm font-medium text-slate-700">
              Phone / code / passport ending
              <input value={code} onChange={(e) => setCode(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" placeholder="At least 4 characters" />
            </label>
            <button disabled={submitting} className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
              {submitting ? "Checking..." : "Link account"}
            </button>
            {message ? <div className="mt-4 rounded-lg border bg-slate-50 p-3 text-sm text-slate-700">{message}</div> : null}
          </form>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
            <h2 className="font-semibold">Privacy note</h2>
            <p className="mt-2">The public GitHub Pages site does not contain the private guest list. It only asks Firebase for records that match your account permission.</p>
            <p className="mt-2">If your record cannot be linked automatically, ask the RTD team to add your account in the secure access table.</p>
          </div>
        </div>
      )}
    </AppShell>
  );
}


