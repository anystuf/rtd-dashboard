"use client";

import { AppShell } from "@/components/layout/AppShell";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { BarDistribution, PieDistribution } from "@/components/dashboard/SimpleCharts";
import { qDashboardMetrics, qIssues, qPeople, qSyncLogs } from "@/lib/queries";
import { useCollectionSource, useDashboardDistributionsSource, useDashboardMetricsSource } from "@/lib/useDataSource";
import type { DataQualityIssue, Person } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

const sourceLinks: Record<string, string> = {
  checklist_vip: "https://docs.google.com/spreadsheets/d/1vrpQ-KKuT2Qf01C8lXJLkVExHUgz7R9t__D3DNMHgu4/edit#gid=167014734",
  checklist_hotel: "https://docs.google.com/spreadsheets/d/1vrpQ-KKuT2Qf01C8lXJLkVExHUgz7R9t__D3DNMHgu4/edit#gid=1985155730",
  form_confirmation: "https://docs.google.com/spreadsheets/d/1KRN68GZpi-jVMtbDOq3_JBhxGBW9iJin-Q-Q0hCj-oI/edit#gid=965101690",
  form_responses: "https://docs.google.com/spreadsheets/d/1KRN68GZpi-jVMtbDOq3_JBhxGBW9iJin-Q-Q0hCj-oI/edit#gid=779978401",
  master_agenda: "https://docs.google.com/spreadsheets/d/1WrtspXZmBELnlwppFB6VImkjvGjGu4QaUCL0IY40Wvo/edit#gid=876983529",
  agenda_logistics_support: "https://docs.google.com/spreadsheets/d/1WrtspXZmBELnlwppFB6VImkjvGjGu4QaUCL0IY40Wvo/edit#gid=1165886607",
  hcm_hotel: "https://docs.google.com/spreadsheets/d/1ek07p5w9xwGpajfvg4jvh-ioHdFPLMbVIHCltqkoFLo/edit#gid=2020929252",
  logistics_reference: "https://docs.google.com/spreadsheets/d/1XG5tHUu5X9EaMqgupCseAjYi5O-b9QhttK6DDvaU4MU/edit"
};

function countBy<T>(rows: T[], getter: (row: T) => string | undefined) {
  const map = new Map<string, number>();
  for (const row of rows) {
    const key = getter(row) || "Unknown";
    map.set(key, (map.get(key) || 0) + 1);
  }
  return [...map.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);
}

function RiskPanel({ issues }: { issues: DataQualityIssue[] }) {
  const open = issues.filter((i) => i.status !== "Resolved");
  const count = (issue: DataQualityIssue) => Number((issue as DataQualityIssue & { count?: number }).count || 1);
  const privacy = open.filter((i) => i.category === "Privacy/Security").reduce((sum, issue) => sum + count(issue), 0);
  const high = open.filter((i) => i.severity === "Critical" || i.severity === "High").reduce((sum, issue) => sum + count(issue), 0);
  const missing = open.filter((i) => /Completeness|missing|blank/i.test(`${i.category} ${i.issueDescription}`)).reduce((sum, issue) => sum + count(issue), 0);
  const riskRows = [
    { label: "Privacy exposure", value: privacy, tone: privacy ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800", how: "Sensitive-field validator found PII in a displayable/raw row." },
    { label: "High priority issues", value: high, tone: high ? "border-orange-200 bg-orange-50 text-orange-800" : "border-emerald-200 bg-emerald-50 text-emerald-800", how: "Severity is Critical or High in data_quality_issues." },
    { label: "Completeness gaps", value: missing, tone: missing ? "border-amber-200 bg-amber-50 text-amber-800" : "border-emerald-200 bg-emerald-50 text-emerald-800", how: "Rows mention required flight/hotel/support data but key details are missing." }
  ];
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {riskRows.map((risk) => (
        <div key={risk.label} className={`rounded-lg border p-4 ${risk.tone}`}>
          <div className="text-sm font-semibold">{risk.label}</div>
          <div className="mt-2 text-3xl font-bold">{risk.value}</div>
          <div className="mt-2 text-xs opacity-80">{risk.how}</div>
        </div>
      ))}
    </div>
  );
}

export function DashboardPage() {
  const metrics = useDashboardMetricsSource(qDashboardMetrics());
  const distributions = useDashboardDistributionsSource();
  const people = useCollectionSource<Person>("people", qPeople());
  const issues = useCollectionSource<DataQualityIssue>("data_quality_issues", qIssues());
  const syncLogs = useCollectionSource<Record<string, unknown>>("sync_logs", qSyncLogs());
  const m = metrics.data;

  return (
    <AppShell>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">RTD Data Risk Dashboard</h1>
          <p className="text-sm text-slate-500">Realtime issues, warnings, gaps, and sync health from the source sheets.</p>
        </div>
        <div className="text-xs text-slate-500">Last synced: {formatDateTime(m?.lastSyncAt)}</div>
      </div>

      <RiskPanel issues={issues.data} />

      <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        Public dashboard mode: charts contain aggregate counts only. Names, emails, passport details, and individual travel records are not sent to this website.
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total participants" value={m?.totalParticipants ?? people.data.length} />
        <MetricCard label="Total VIPs" value={m?.totalVIPs ?? 0} />
        <MetricCard label="UEH participants" value={m?.totalUEH ?? 0} />
        <MetricCard label="International guests" value={m?.internationalGuests ?? 0} />
        <MetricCard label="Confirmed attendance" value={m?.confirmedAttendance ?? 0} />
        <MetricCard label="Pending confirmation" value={m?.pendingConfirmation ?? 0} />
        <MetricCard label="Flight support required" value={m?.flightSupportRequired ?? 0} />
        <MetricCard label="Hotel support required" value={m?.hotelSupportRequired ?? 0} />
        <MetricCard label="Airport - Hotel required" value={m?.airportHotelPickupRequired ?? 0} />
        <MetricCard label="Airport - Hotel ready" value={m?.airportHotelPickupReady ?? 0} />
        <MetricCard label="Hotel - Airport required" value={m?.hotelAirportPickupRequired ?? 0} />
        <MetricCard label="Hotel - Airport ready" value={m?.hotelAirportPickupReady ?? 0} />
        <MetricCard label="Pickup pending" value={m?.pickupPending ?? 0} />
        <MetricCard label="Open issues" value={m?.openIssues ?? issues.data.filter(i => i.status !== "Resolved").length} />
        <MetricCard label="Critical issues" value={m?.criticalIssues ?? issues.data.filter(i => i.severity === "Critical").length} />
        <MetricCard label="Sync cadence" value="2 min" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <BarDistribution title="Participants by country" data={(distributions.data?.participantsByCountry ?? countBy(people.data, (p) => p.country)).slice(0, 8)} />
        <PieDistribution title="Participants by role" data={(distributions.data?.participantsByRole ?? countBy(people.data, (p) => p.role)).slice(0, 8)} />
        <BarDistribution title="Data issues by severity" data={(distributions.data?.issuesBySeverity ?? countBy(issues.data, (i) => i.severity)).slice(0, 8)} />
        <BarDistribution title="Issues by source" data={(distributions.data?.issuesBySource ?? countBy(issues.data, (i) => i.sourceKey)).slice(0, 8)} />
        <BarDistribution title="Transfer requests by direction" data={(distributions.data?.transferByDirection ?? []).slice(0, 8)} />
        <BarDistribution title="Transfer readiness" data={(distributions.data?.transferReadiness ?? []).slice(0, 8)} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-lg border bg-white p-5">
          <h2 className="text-base font-semibold text-slate-900">Source links</h2>
          <p className="mt-1 text-sm text-slate-500">Warnings are grouped by source and field. Row-level identities remain in the protected Google Sheets.</p>
          <div className="mt-4 grid gap-2 text-sm">
            {Object.entries(sourceLinks).map(([key, href]) => (
              <a key={key} href={href} target="_blank" className="flex items-center justify-between rounded-lg border px-3 py-2 text-blue-700 hover:bg-blue-50">
                <span>{key}</span>
                <span className="text-xs text-slate-400">open source</span>
              </a>
            ))}
          </div>
        </section>
        <section className="rounded-lg border bg-white p-5">
          <h2 className="text-base font-semibold text-slate-900">Latest sync</h2>
          <div className="mt-4 space-y-3">
            {syncLogs.data.slice(0, 6).map((log, idx) => (
              <div key={String(log.id || idx)} className="rounded-lg border px-3 py-2 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="font-medium text-slate-800">{String(log.sourceKey || "unknown")}</span>
                  <span className={String(log.status) === "Failed" ? "text-red-600" : "text-emerald-600"}>{String(log.status || "")}</span>
                </div>
                <div className="mt-1 text-xs text-slate-500">Rows: {String(log.rowsRead || 0)} | Issues: {String(log.issuesCreated || 0)}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
