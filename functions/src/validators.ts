import { containsPotentialPII, isSensitiveField, maskEvidence } from "./pii.js";

export interface ValidationContext {
  sourceKey: string;
  sheetName: string;
  rowIndex: number;
  row: Record<string, unknown>;
  headers: string[];
  personId?: string;
}

export interface DataQualityIssueInput {
  severity: "Critical" | "High" | "Medium" | "Low";
  category: string;
  sourceKey: string;
  sourceSheet: string;
  sourceRow: number;
  sourceField: string;
  personId?: string;
  issueDescription: string;
  evidenceType: string;
  evidence: string;
  recommendedFix: string;
  status: "Open";
  createdAt: Date;
}

function issue(ctx: ValidationContext, patch: Omit<DataQualityIssueInput, "sourceKey" | "sourceSheet" | "sourceRow" | "status" | "createdAt">): DataQualityIssueInput {
  return {
    ...patch,
    sourceKey: ctx.sourceKey,
    sourceSheet: ctx.sheetName,
    sourceRow: ctx.rowIndex,
    status: "Open",
    createdAt: new Date()
  };
}

export function validateHeaders(sourceKey: string, sheetName: string, headers: string[]) {
  const issues: DataQualityIssueInput[] = [];
  const seen = new Map<string, number>();
  headers.forEach((h, idx) => {
    const clean = String(h ?? "").trim();
    const ctx: ValidationContext = { sourceKey, sheetName, rowIndex: 1, row: {}, headers };
    if (!clean) {
      issues.push(issue(ctx, {
        severity: "High",
        category: "Schema",
        sourceField: `Column ${idx + 1}`,
        issueDescription: "Blank header detected.",
        evidenceType: "Header",
        evidence: `Column ${idx + 1} has no header`,
        recommendedFix: "Add a stable machine-readable header."
      }));
    }
    const key = clean.toLowerCase();
    seen.set(key, (seen.get(key) || 0) + 1);
  });
  for (const [key, count] of seen) {
    if (key && count > 1) {
      const ctx: ValidationContext = { sourceKey, sheetName, rowIndex: 1, row: {}, headers };
      issues.push(issue(ctx, {
        severity: "High",
        category: "Schema",
        sourceField: key,
        issueDescription: "Duplicate header detected.",
        evidenceType: "Header",
        evidence: `${key} appears ${count} times`,
        recommendedFix: "Rename duplicate columns into unique canonical field names."
      }));
    }
  }
  return issues;
}

export function validateRow(ctx: ValidationContext) {
  const issues: DataQualityIssueInput[] = [];
  const row = ctx.row;
  const rowKeys = Object.keys(row);
  for (const key of rowKeys) {
    const value = row[key];
    const text = String(value ?? "").trim();
    if (!text) continue;
    if (isSensitiveField(key) && ctx.sourceKey !== "person_sensitive") {
      issues.push(issue(ctx, {
        severity: "Critical",
        category: "Privacy/Security",
        sourceField: key,
        personId: ctx.personId,
        issueDescription: "Sensitive PII field detected in raw source and must be isolated before dashboard display.",
        evidenceType: "PII field",
        evidence: maskEvidence(key, value),
        recommendedFix: "Write this field only to person_sensitive or raw snapshots; never expose it in dashboard collections."
      }));
    }
    if (/full\s*name|fullname|họ\s*và\s*tên|name/i.test(key) && /\s\/\s|;|\n/.test(text)) {
      issues.push(issue(ctx, {
        severity: "High",
        category: "Atomicity",
        sourceField: key,
        personId: ctx.personId,
        issueDescription: "Multiple people may appear inside one name cell.",
        evidenceType: "Cell value",
        evidence: maskEvidence(key, value),
        recommendedFix: "Split to one row per person and use shared group ID for shared hotel/pickup."
      }));
    }
  }
  const blob = JSON.stringify(row).toLowerCase();
  if (/support.*flight|flight.*support|rtd support flight/i.test(blob) && /yes|có|co|required|support/i.test(blob) && !/flight\s*(no|number)|arrival|departure|airport/i.test(blob)) {
    issues.push(issue(ctx, {
      severity: "High",
      category: "Completeness",
      sourceField: "Flight support",
      personId: ctx.personId,
      issueDescription: "RTD flight support appears required but flight details may be missing.",
      evidenceType: "Row pattern",
      evidence: "Flight support keyword detected without obvious flight details",
      recommendedFix: "Require arrival/departure flight number and datetime before pickup/ticketing."
    }));
  }
  return issues;
}
