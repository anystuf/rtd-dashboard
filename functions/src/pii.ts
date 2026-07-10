export const SENSITIVE_FIELD_PATTERNS = [
  /passport/i,
  /date\s*of\s*birth/i,
  /day\s*of\s*birth/i,
  /dob/i,
  /hình\s*passport/i,
  /passport\s*image/i,
  /phone/i,
  /mobile/i,
  /sđt/i,
  /điện\s*thoại/i
];

export function isSensitiveField(fieldName: string) {
  return SENSITIVE_FIELD_PATTERNS.some((pattern) => pattern.test(fieldName));
}

export function extractSensitiveFields(raw: Record<string, unknown>) {
  const sensitive: Record<string, unknown> = {};
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (isSensitiveField(key)) sensitive[key] = value;
    else sanitized[key] = value;
  }
  return { sensitive, sanitized };
}

export function maskEvidence(fieldName: string, value: unknown) {
  if (isSensitiveField(fieldName)) return "[MASKED_SENSITIVE_VALUE]";
  const text = String(value ?? "").trim();
  if (text.length > 160) return text.slice(0, 157) + "...";
  return text;
}

export function containsPotentialPII(raw: Record<string, unknown>) {
  return Object.keys(raw).some(isSensitiveField);
}
