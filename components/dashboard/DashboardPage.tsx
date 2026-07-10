"use client";

import { AppShell } from "@/components/layout/AppShell";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { BarDistribution, PieDistribution } from "@/components/dashboard/SimpleCharts";
import { useCollection, useDoc } from "@/lib/useFirestore";
import { qDashboardMetrics, qIssues, qPeople } from "@/lib/queries";
import type { DashboardMetrics, DataQualityIssue, Person } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

function countBy<T>(rows: T[], getter: (row: T) => string | undefined) {
  const map = new Map<string, number>();
  for (const row of rows) {
    const key = getter(row) || "Unknown";
    map.set(key, (map.get(key) || 0) + 1);
  }
  return [...map.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);
}

export function DashboardPage() {
  const metrics = useDoc<DashboardMetrics>(qDashboardMetrics());
  const people = useCollection<Person>(qPeople());
  const issues = useCollection<DataQualityIssue>(qIssues());
  const m = metrics.data;

  return (
    <AppShell>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">Realtime event operations overview.</p>
        </div>
        <div className="text-xs text-slate-500">Last synced: {formatDateTime(m?.lastSyncAt)}</div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total participants" value={m?.totalParticipants ?? people.data.length} />
        <MetricCard label="Total VIPs" value={m?.totalVIPs ?? 0} />
        <MetricCard label="UEH participants" value={m?.totalUEH ?? 0} />
        <MetricCard label="International guests" value={m?.internationalGuests ?? 0} />
        <MetricCard label="Confirmed attendance" value={m?.confirmedAttendance ?? 0} />
        <MetricCard label="Pending confirmation" value={m?.pendingConfirmation ?? 0} />
        <MetricCard label="Flight support required" value={m?.flightSupportRequired ?? 0} />
        <MetricCard label="Hotel support required" value={m?.hotelSupportRequired ?? 0} />
        <MetricCard label="Pickup pending" value={m?.pickupPending ?? 0} />
        <MetricCard label="Open issues" value={m?.openIssues ?? issues.data.filter(i => i.status !== "Resolved").length} />
        <MetricCard label="Critical issues" value={m?.criticalIssues ?? issues.data.filter(i => i.severity === "Critical").length} />
        <MetricCard label="Sync status" value={metrics.loading ? "Loading" : "Live"} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <BarDistribution title="Participants by country" data={countBy(people.data, (p) => p.country)} />
        <PieDistribution title="Participants by role" data={countBy(people.data, (p) => p.role)} />
        <BarDistribution title="Data issues by severity" data={countBy(issues.data, (i) => i.severity)} />
        <BarDistribution title="Organizations" data={countBy(people.data, (p) => p.organization)} />
      </div>
    </AppShell>
  );
}
