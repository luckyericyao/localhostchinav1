export const inquiryTextLimits = {
  name: 120,
  email: 254,
  shortNote: 1200,
  detail: 800,
  detailLabel: 80,
  detailCount: 32
} as const;

export type InquiryFieldError = {
  field: "name" | "email" | "shortNote" | "details";
  detailKey?: string;
  message: string;
};

type InquiryFields = {
  email: string;
  name: string;
  shortNote: string;
  optionalDetails: Record<string, string>;
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function readInquiryFields(payload: {
  email?: unknown;
  name?: unknown;
  shortNote?: unknown;
  optionalDetails?: unknown;
}): { ok: true; value: InquiryFields } | { ok: false; error: InquiryFieldError } {
  const name = text(payload.name);
  const email = text(payload.email).toLowerCase();
  const shortNote = text(payload.shortNote);
  const fail = (field: InquiryFieldError["field"], message: string, detailKey?: string) =>
    ({ ok: false as const, error: { field, message, detailKey } });

  if (!name) return fail("name", "Please enter your name.");
  if (name.length > inquiryTextLimits.name) {
    return fail("name", "Please keep your name within 120 characters. Your text is still here.");
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return fail("email", "Please enter a valid email.");
  }
  if (email.length > inquiryTextLimits.email) {
    return fail("email", "Please use an email address of 254 characters or fewer.");
  }
  if (!shortNote) return fail("shortNote", "Please add one sentence about what you are looking for.");
  if (shortNote.length > inquiryTextLimits.shortNote) {
    return fail("shortNote", "Please keep your first note within 1,200 characters. Your text is still here.");
  }

  const details = payload.optionalDetails ?? {};
  if (typeof details !== "object" || Array.isArray(details)) {
    return fail("details", "Please use labeled text for additional details.");
  }
  const entries: Array<[string, string]> = [];
  const labels = new Set<string>();
  for (const [key, value] of Object.entries(details)) {
    if (typeof value !== "string") {
      return fail("details", "Please use text for additional details.");
    }
    const label = key.trim();
    const detail = value.trim();
    if (!label || !detail) continue;
    if (label.length > inquiryTextLimits.detailLabel || labels.has(label)) {
      return fail("details", "Please use distinct, short labels for additional details.");
    }
    if (detail.length > inquiryTextLimits.detail) {
      return fail("details", "Please keep this detail within 800 characters. Your text is still here.", label);
    }
    labels.add(label);
    entries.push([label, detail]);
  }
  if (entries.length > inquiryTextLimits.detailCount) {
    return fail("details", "Please include no more than 32 additional details.");
  }

  return { ok: true, value: { email, name, shortNote, optionalDetails: Object.fromEntries(entries) } };
}
