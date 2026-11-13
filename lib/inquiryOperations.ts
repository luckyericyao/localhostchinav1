export type ReceiptChannel = "provider" | "manual";

export type ReviewEvent = {
  at: string;
  event: "provider_accepted" | "email_draft" | "delivery_unconfigured" | "assigned" | "inbox_received" | "replied" | "closed";
  inquiryId: string;
  owner?: string;
  receiptChannel?: ReceiptChannel;
};

export function reviewOwner(value: unknown): string | undefined {
  return typeof value === "string" && /^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,63}$/.test(value)
    ? value : undefined;
}

export function reviewTime(value: unknown): string | undefined {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return undefined;
  const date = new Date(value);
  const localDay = value.slice(0, 10);
  const calendarDay = new Date(`${localDay}T00:00:00Z`);
  if (!Number.isFinite(date.getTime()) || !Number.isFinite(calendarDay.getTime()) ||
      calendarDay.toISOString().slice(0, 10) !== localDay) return undefined;
  const canonical = date.toISOString();
  return canonical.length === 24 ? canonical : undefined;
}

export function replyDueAt(receivedAt: string, holidays: readonly string[] = []): string {
  const date = new Date(receivedAt);
  if (!Number.isFinite(date.getTime())) throw new Error("Invalid review timestamp.");
  let remaining = 2;
  while (remaining > 0) {
    date.setUTCDate(date.getUTCDate() + 1);
    const chinaDate = new Date(date.getTime() + 8 * 60 * 60 * 1000);
    const weekday = chinaDate.getUTCDay();
    if (weekday !== 0 && weekday !== 6 && !holidays.includes(chinaDate.toISOString().slice(0, 10))) remaining -= 1;
  }
  return date.toISOString();
}

export function readReviewEvent(value: unknown): ReviewEvent | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const events = ["provider_accepted", "email_draft", "delivery_unconfigured", "assigned", "inbox_received", "replied", "closed"];
  if (typeof row.inquiryId !== "string" || !/^LH-\d{4}-\d{2}-\d{2}-[A-F0-9]{8}$/.test(row.inquiryId)) return null;
  const at = reviewTime(row.at);
  if (!at || typeof row.event !== "string" || !events.includes(row.event)) return null;
  const owner = reviewOwner(row.owner);
  if (row.event === "assigned" && !owner) return null;
  const receiptChannel = row.event === "inbox_received" ? row.receiptChannel : undefined;
  if (receiptChannel !== undefined && receiptChannel !== "provider" && receiptChannel !== "manual") return null;
  return {
    at,
    event: row.event as ReviewEvent["event"],
    inquiryId: row.inquiryId,
    ...(owner ? { owner } : {}),
    ...(receiptChannel ? { receiptChannel } : {})
  };
}

export function importReviewLog(value: unknown): ReviewEvent | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (typeof row.message === "string") {
    try { return importReviewLog(JSON.parse(row.message)); } catch { return null; }
  }
  if (row.kind !== "localhost_inquiry") return null;
  const event = { delivery_success: "provider_accepted", delivery_fallback: "email_draft", delivery_unconfigured: "delivery_unconfigured" }[String(row.event)] as ReviewEvent["event"] | undefined;
  return event ? readReviewEvent({ event, at: row.recordedAt, inquiryId: row.inquiryId, owner: row.reviewOwner }) : null;
}

type ReviewRow = {
  inquiryId: string;
  owner?: string;
  providerAccepted: boolean;
  fallback: boolean;
  receivedAt?: string;
  receiptChannel?: ReceiptChannel;
  repliedAt?: string;
  closed: boolean;
};

export function reviewQueue(events: readonly ReviewEvent[], holidays: readonly string[] = []) {
  const rows = new Map<string, ReviewRow>();
  for (const event of [...events].sort((a, b) => Date.parse(a.at) - Date.parse(b.at))) {
    const row: ReviewRow = rows.get(event.inquiryId) || { inquiryId: event.inquiryId, providerAccepted: false, fallback: false, closed: false };
    if (event.event === "provider_accepted") row.providerAccepted = true;
    if (event.event === "email_draft") row.fallback = true;
    if (!row.closed) {
      const isDelivery = ["provider_accepted", "email_draft", "delivery_unconfigured"].includes(event.event);
      if (event.owner && (event.event === "assigned" || (isDelivery && !row.owner))) row.owner = event.owner;
      if (event.event === "inbox_received") {
        if (!row.receivedAt) row.receivedAt = event.at;
        if (row.receivedAt === event.at && !row.receiptChannel && event.receiptChannel) {
          row.receiptChannel = event.receiptChannel;
        }
      }
      if (event.event === "replied" && row.receivedAt && row.owner && !row.repliedAt) row.repliedAt = event.at;
      if (event.event === "closed") row.closed = true;
    }
    rows.set(event.inquiryId, row);
  }
  return [...rows.values()].map((row) => {
    const status = row.closed ? "closed" : !row.receivedAt ? (!row.providerAccepted && !row.fallback ? "delivery_unconfigured" : "awaiting_inbox") : !row.owner ? "needs_assignment" : row.repliedAt ? "replied" : "awaiting_reply";
    const nextAction = { closed: "No open action", delivery_unconfigured: "Restore delivery configuration; receipt has not been confirmed", awaiting_inbox: row.providerAccepted ? "Confirm actual inbox receipt" : "Confirm whether the visitor sent the prepared email", needs_assignment: "Assign a reviewer", replied: "Agree route scope or record closure", awaiting_reply: "Send a substantive human reply" }[status];
    return { ...row, status, nextAction, dueAt: row.receivedAt ? replyDueAt(row.receivedAt, holidays) : undefined };
  });
}

export function reviewReport(events: readonly ReviewEvent[], now = new Date().toISOString(), holidays: readonly string[] = []) {
  const asOf = reviewTime(now);
  if (!asOf) throw new Error("Invalid report timestamp.");
  const cutoff = Date.parse(asOf);
  const rows = reviewQueue(events.filter((event) => Date.parse(event.at) <= cutoff), holidays);
  const accepted = rows.filter((row) => row.providerAccepted);
  const received = rows.filter((row) => row.receivedAt);
  const direct = received.filter((row) => row.providerAccepted && row.receiptChannel === "provider").length;
  const manual = received.filter((row) => row.receiptChannel === "manual").length;
  const eligible = received.filter((row) => row.repliedAt || Date.parse(row.dueAt!) <= cutoff);
  const onTime = eligible.filter((row) => row.repliedAt && Date.parse(row.repliedAt) <= Date.parse(row.dueAt!));
  return {
    asOf,
    validReferences: rows.length,
    providerAccepted: accepted.length,
    inboxConfirmed: received.length,
    directInboxConfirmed: direct,
    manualInboxConfirmed: manual,
    inboxChannelUnverified: received.length - direct - manual,
    preparedEmailOnly: rows.filter((row) => row.fallback && !row.providerAccepted && !row.receivedAt).length,
    unassigned: rows.filter((row) => !row.owner && !row.closed).length,
    overdue: received.filter((row) => !row.repliedAt && !row.closed && Date.parse(row.dueAt!) <= cutoff).length,
    providerAcceptanceRate: rows.length ? accepted.length / rows.length : null,
    confirmedDirectDeliveryRate: rows.length ? direct / rows.length : null,
    fallbackRate: rows.length ? rows.filter((row) => row.fallback && !row.providerAccepted).length / rows.length : null,
    substantiveReplyWithinTargetRate: eligible.length ? onTime.length / eligible.length : null,
    replySampleSize: eligible.length,
    awaitingReplyWithinWindow: received.filter((row) => !row.repliedAt && !row.closed && Date.parse(row.dueAt!) > cutoff).length
  };
}
