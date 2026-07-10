import { google } from "googleapis";
import crypto from "crypto";
import type { SourceSheetConfig } from "./sourceSheets.js";
import { validateHeaders } from "./validators.js";

function getAuth() {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    return new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
    });
  }

  // Optional OAuth mode. Use only if you intentionally want to read as a Gmail user.
  if (process.env.GOOGLE_OAUTH_CLIENT_ID && process.env.GOOGLE_OAUTH_CLIENT_SECRET && process.env.GOOGLE_OAUTH_REFRESH_TOKEN) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_OAUTH_CLIENT_ID,
      process.env.GOOGLE_OAUTH_CLIENT_SECRET
    );
    oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN });
    return oauth2Client;
  }

  return new google.auth.GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
  });
}

export interface RawSheetRow {
  rowIndex: number;
  rawJson: Record<string, unknown>;
  rowHash: string;
}

export interface ReadSheetResult {
  sourceKey: string;
  spreadsheetId: string;
  gid?: string;
  sheetName: string;
  headers: string[];
  rows: RawSheetRow[];
  headerIssues: ReturnType<typeof validateHeaders>;
}

export async function resolveSheetName(source: SourceSheetConfig) {
  if (source.sheetName) return source.sheetName;
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });
  const metadata = await sheets.spreadsheets.get({ spreadsheetId: source.spreadsheetId });
  const target = metadata.data.sheets?.find((s) => String(s.properties?.sheetId) === String(source.gid));
  if (!target?.properties?.title) {
    const available = metadata.data.sheets?.map((s) => `${s.properties?.title} (${s.properties?.sheetId})`).join(", ");
    throw new Error(`Cannot resolve sheet gid ${source.gid} in ${source.spreadsheetId}. Available: ${available}`);
  }
  return target.properties.title;
}

function dedupeHeaders(headers: string[]) {
  const seen = new Map<string, number>();
  return headers.map((header, idx) => {
    const clean = String(header ?? "").trim();
    const base = clean || `blank_header_${idx + 1}`;
    const count = seen.get(base.toLowerCase()) || 0;
    seen.set(base.toLowerCase(), count + 1);
    return count === 0 ? base : `${base}__dup_${count + 1}`;
  });
}

export function hashRow(rawJson: unknown) {
  return crypto.createHash("sha256").update(JSON.stringify(rawJson)).digest("hex");
}

export async function readSheet(source: SourceSheetConfig): Promise<ReadSheetResult> {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });
  const sheetName = await resolveSheetName(source);
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: source.spreadsheetId,
    range: `'${sheetName.replace(/'/g, "''")}'!A:ZZ`,
    valueRenderOption: "UNFORMATTED_VALUE",
    dateTimeRenderOption: "FORMATTED_STRING"
  });
  const values = response.data.values || [];
  const headers = (values[0] || []).map((x) => String(x ?? ""));
  const internalHeaders = dedupeHeaders(headers);
  const dataRows = values.slice(1);
  const rows = dataRows.map((row, index) => {
    const rawJson: Record<string, unknown> = {};
    internalHeaders.forEach((header, colIndex) => {
      rawJson[header] = row[colIndex] ?? "";
    });
    return { rowIndex: index + 2, rawJson, rowHash: hashRow(rawJson) };
  }).filter((row) => Object.values(row.rawJson).some((v) => String(v ?? "").trim() !== ""));
  return {
    sourceKey: source.sourceKey,
    spreadsheetId: source.spreadsheetId,
    gid: source.gid,
    sheetName,
    headers,
    rows,
    headerIssues: validateHeaders(source.sourceKey, sheetName, headers)
  };
}
