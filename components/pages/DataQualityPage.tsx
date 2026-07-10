"use client";

import { AppShell } from "@/components/layout/AppShell";
import { RealtimeTable } from "@/components/tables/RealtimeTable";
import { qIssues } from "@/lib/queries";
import { useCollectionSource } from "@/lib/useDataSource";
import type { DataQualityIssue } from "@/lib/types";

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

const columns = [
  { key: "severity", label: "Severity" },
  { key: "category", label: "Category" },
  { key: "sourceKey", label: "Source", render: (row: DataQualityIssue) => sourceLinks[row.sourceKey || ""] ? <a className="font-medium text-blue-700 hover:underline" href={sourceLinks[row.sourceKey || ""]} target="_blank">{row.sourceKey}</a> : row.sourceKey },
  { key: "sourceSheet", label: "Sheet" },
  { key: "sourceRow", label: "Row" },
  { key: "sourceField", label: "Field" },
  { key: "issueDescription", label: "Issue" },
  { key: "evidenceType", label: "How identified" },
  { key: "evidence", label: "Evidence" },
  { key: "recommendedFix", label: "Recommended fix" },
  { key: "status", label: "Status" }
];

export function DataQualityPage() {
  const { data } = useCollectionSource<DataQualityIssue>("data_quality_issues", qIssues());
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Data Quality</h1>
        <p className="text-sm text-slate-500">Each row explains the issue, the rule that detected it, the evidence, and a direct source link.</p>
      </div>
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-4">
          <div className="text-xs font-semibold uppercase text-slate-400">Rule basis</div>
          <div className="mt-1 text-sm text-slate-700">Header checks, missing required values, PII isolation, and row pattern checks.</div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-xs font-semibold uppercase text-slate-400">Source trace</div>
          <div className="mt-1 text-sm text-slate-700">sourceKey + sheet + row + field identify exactly where the warning came from.</div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-xs font-semibold uppercase text-slate-400">Privacy</div>
          <div className="mt-1 text-sm text-slate-700">Sensitive evidence is masked; raw sensitive fields are kept behind admin/guest-owned rules.</div>
        </div>
      </div>
      <RealtimeTable rows={data} columns={columns} />
    </AppShell>
  );
}
