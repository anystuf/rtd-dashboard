import crypto from "crypto";

export function stableId(input: string) {
  return crypto.createHash("sha1").update(input).digest("hex").slice(0, 24);
}

export function normalizeName(value: unknown) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b(dr|prof|assoc|associate|mr|mrs|ms|miss)\b\.?/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function normalizeEmail(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

export function normalizeCountry(value: unknown) {
  const text = String(value ?? "").trim();
  const lower = text.toLowerCase();
  const map: Record<string, string> = {
    viet nam: "Vietnam",
    vietnam: "Vietnam",
    "việt nam": "Vietnam",
    korea: "South Korea",
    "south korea": "South Korea",
    usa: "United States",
    us: "United States",
    uk: "United Kingdom"
  };
  return map[lower] || text;
}

export function normalizeBoolean(value: unknown) {
  const text = String(value ?? "").trim().toLowerCase();
  return ["yes", "y", "true", "1", "x", "có", "co"].includes(text);
}

export function normalizeAttendanceStatus(value: unknown) {
  const text = String(value ?? "").trim();
  const lower = text.toLowerCase();
  if (!text) return "Unknown";
  if (/confirm|confirmed|xác nhận|xac nhan|yes|attend|tham dự|tham du/.test(lower)) return "Confirmed";
  if (/pending|waiting|chờ|cho/.test(lower)) return "Pending";
  if (/decline|cancel|not attend|không|khong/.test(lower)) return "Declined";
  return text;
}

export function normalizeSupportStatus(value: unknown) {
  const text = String(value ?? "").trim();
  if (!text) return "No/Unknown";
  if (/yes|support|có|co|x/i.test(text)) return "Required";
  if (/no|none|không|khong/i.test(text)) return "Not required";
  return text;
}

export function normalizeDate(value: unknown) {
  const text = String(value ?? "").trim();
  if (!text) return "";
  const date = new Date(text);
  if (!Number.isNaN(date.getTime())) return date.toISOString();
  return text;
}

export function normalizeFlightNo(value: unknown) {
  return String(value ?? "").trim().toUpperCase().replace(/\s+/g, "");
}

export function detectUEH(row: Record<string, unknown>) {
  const blob = Object.values(row).join(" ").toLowerCase();
  return blob.includes("@ueh.edu.vn")
    || blob.includes("ueh")
    || blob.includes("university of economics ho chi minh")
    || blob.includes("đại học kinh tế")
    || blob.includes("dai hoc kinh te")
    || blob.includes("khoa ")
    || blob.includes("viện ")
    || blob.includes("vien ");
}

export function firstField(row: Record<string, unknown>, patterns: RegExp[]) {
  for (const [key, value] of Object.entries(row)) {
    if (patterns.some((pattern) => pattern.test(key))) {
      const text = String(value ?? "").trim();
      if (text) return text;
    }
  }
  return "";
}

export function buildPersonCore(raw: Record<string, unknown>) {
  const fullName = firstField(raw, [/^full\s*name/i, /fullname/i, /họ\s*và\s*tên/i, /ho\s*va\s*ten/i, /name/i]);
  const email = normalizeEmail(firstField(raw, [/email/i, /e-mail/i]));
  const organization = firstField(raw, [/department\/organization/i, /organization/i, /organisation/i, /đơn\s*vị/i, /don\s*vi/i, /khoa/i, /viện/i]);
  const department = firstField(raw, [/department/i, /khoa/i, /viện/i, /institute/i, /faculty/i]);
  const country = normalizeCountry(firstField(raw, [/country/i, /from/i, /res\s*country/i, /quốc\s*tịch/i]));
  const nationality = normalizeCountry(firstField(raw, [/nationality/i, /quốc\s*tịch/i]));
  const role = firstField(raw, [/role/i, /vai\s*trò/i]);
  const academicTitle = firstField(raw, [/academic\s*title/i, /^title$/i, /hoc\s*ham/i, /học\s*hàm/i]);
  const positionTitle = firstField(raw, [/position\s*title/i, /position/i, /chức\s*vụ/i, /chuc\s*vu/i]);
  const normalizedName = normalizeName(fullName);
  const sourcePersonKey = email || `${normalizedName}|${country}|${organization}`;
  return { fullName, normalizedName, email, organization, department, positionTitle, academicTitle, country, nationality, role, sourcePersonKey };
}
