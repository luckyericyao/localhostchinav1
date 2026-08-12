"use server";

import { createHash, randomUUID } from "node:crypto";
import { headers } from "next/headers";
import {
  localhostDeliveryEmail,
  localhostResponseWindow
} from "@/lib/contact";
import { persistLocalhostMetric } from "@/lib/metrics";

export type LocalhostIntentType = "traveler" | "host" | "partner";

export type LocalhostRouteContext =
  | "shanxi"
  | "shaolin"
  | "huizhou"
  | "shanghai"
  | "beijing"
  | "chengdu"
  | "china-general";

export type LocalhostInquiryPayload = {
  createdAt?: string;
  email: string;
  honeypot?: string;
  intentType: LocalhostIntentType;
  locale?: string;
  name: string;
  optionalDetails?: Record<string, string>;
  routeContext?: LocalhostRouteContext;
  shortNote?: string;
  sourceLabel?: string;
  sourcePage?: string;
  startedAt?: number;
  userAgent?: string;
};

export type LocalhostInquiryResult = {
  contactEmail?: string;
  delivery?: "duplicate" | "email" | "mailto";
  inquiryId?: string;
  mailtoHref?: string;
  message: string;
  ok: boolean;
  responseWindow?: string;
  summary?: {
    email: string;
    intentType: LocalhostIntentType;
    name: string;
    routeContext?: LocalhostRouteContext;
    shortNote?: string;
    sourceLabel?: string;
    sourcePage?: string;
  };
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const minimumSubmitDelayMs = 900;
const inquiryWindowMs = 60 * 60 * 1000;
const duplicateWindowMs = 15 * 60 * 1000;
const maxInquiriesPerWindow = 8;

type InquiryWindow = {
  count: number;
  startedAt: number;
};

type InquiryEmailDelivery = {
  ok: boolean;
  providerMessageId?: string;
};

// These maps are intentionally small, best-effort protection for warm server
// instances. Delivery remains the source of truth; logs make the outcome auditable.
const inquiryWindows = new Map<string, InquiryWindow>();
const recentInquiryHashes = new Map<string, number>();

function cleanText(value: unknown, maxLength = 1200) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function isIntentType(value: string): value is LocalhostIntentType {
  return value === "traveler" || value === "host" || value === "partner";
}

function isRouteContext(value: unknown): value is LocalhostRouteContext {
  return [
    "shanxi",
    "shaolin",
    "huizhou",
    "shanghai",
    "beijing",
    "chengdu",
    "china-general"
  ].includes(value as LocalhostRouteContext);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeOptionalDetails(value: unknown) {
  if (!isRecord(value)) return {};

  return Object.fromEntries(
    Object.entries(value)
      .slice(0, 32)
      .map(([key, detail]) => [cleanText(key, 80), cleanText(detail, 800)])
      .filter(([key, detail]) => Boolean(key && detail))
  );
}

function getRequestKey(requestHeaders: Headers) {
  const forwardedFor = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwardedFor || requestHeaders.get("x-real-ip") || "unknown-request";
}

function pruneInquiryGuards(now: number) {
  for (const [key, window] of inquiryWindows) {
    if (now - window.startedAt > inquiryWindowMs) inquiryWindows.delete(key);
  }

  for (const [key, createdAt] of recentInquiryHashes) {
    if (now - createdAt > duplicateWindowMs) recentInquiryHashes.delete(key);
  }
}

function logInquiryEvent(
  event: string,
  details: {
    durationMs?: number;
    inquiryId?: string;
    intentType?: LocalhostIntentType;
    providerMessageId?: string;
    routeContext?: LocalhostRouteContext;
    sourcePage?: string;
  } = {}
) {
  console.info("Localhost inquiry event", {
    event,
    inquiryId: details.inquiryId || "",
    intentType: details.intentType || "",
    providerMessageId: details.providerMessageId || "",
    routeContext: details.routeContext || "",
    sourcePage: details.sourcePage || "",
    durationMs: details.durationMs || 0
  });

  const metricEvent = {
    delivery_fallback: "inquiry_delivery_fallback",
    delivery_success: "inquiry_delivery_success",
    duplicate: "inquiry_duplicate",
    honeypot_rejected: "inquiry_honeypot_rejected",
    rate_limited: "inquiry_rate_limited",
    timing_rejected: "inquiry_timing_rejected"
  }[event] as
    | "inquiry_delivery_fallback"
    | "inquiry_delivery_success"
    | "inquiry_duplicate"
    | "inquiry_honeypot_rejected"
    | "inquiry_rate_limited"
    | "inquiry_timing_rejected"
    | undefined;

  if (metricEvent) {
    void persistLocalhostMetric({
      event: metricEvent,
      inquiryId: details.inquiryId,
      path: details.sourcePage || "/inquiry",
      route: details.routeContext,
      source: "server_action"
    });
  }
}

function inquiryFingerprint(payload: {
  email: string;
  intentType: LocalhostIntentType;
  name: string;
  optionalDetails: Record<string, string>;
  routeContext?: LocalhostRouteContext;
  shortNote: string;
}) {
  const details = Object.entries(payload.optionalDetails)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${cleanText(value)}`)
    .join("&");

  return createHash("sha256")
    .update(
      [
        payload.email,
        payload.intentType,
        payload.name,
        payload.routeContext || "",
        payload.shortNote,
        details
      ].join("\n")
    )
    .digest("hex");
}

function isRateLimited(requestKey: string, now: number) {
  const current = inquiryWindows.get(requestKey);

  if (!current || now - current.startedAt > inquiryWindowMs) {
    inquiryWindows.set(requestKey, { count: 1, startedAt: now });
    return false;
  }

  current.count += 1;
  return current.count > maxInquiriesPerWindow;
}

function createInquiryId(createdAt: string) {
  const dateLabel =
    createdAt.match(/^\d{4}-\d{2}-\d{2}/)?.[0] ||
    new Date().toISOString().slice(0, 10);

  return `LH-${dateLabel}-${randomUUID().slice(0, 8).toUpperCase()}`;
}

function formatLabel(value: string) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase());
}

function buildInquiryEmailContent(payload: {
  createdAt: string;
  email: string;
  intentType: LocalhostIntentType;
  inquiryId: string;
  locale: string;
  name: string;
  optionalDetails: Record<string, string>;
  routeContext?: LocalhostRouteContext;
  responseWindow: string;
  shortNote: string;
  sourceLabel: string;
  sourcePage: string;
}) {
  const detailLines = Object.entries(payload.optionalDetails)
    .filter(([, value]) => cleanText(value))
    .map(([key, value]) => `${formatLabel(key)}: ${cleanText(value)}`);

  const bodyLines = [
    "Localhost private route review",
    "",
    `Role: ${payload.intentType}`,
    `Inquiry ID: ${payload.inquiryId}`,
    `Reply expectation: ${payload.responseWindow}`,
    `Name: ${payload.name}`,
    `Reply email: ${payload.email}`,
    payload.routeContext ? `Route context: ${payload.routeContext}` : "",
    payload.shortNote ? `One-sentence intent: ${payload.shortNote}` : "",
    payload.sourcePage ? `Source page: ${payload.sourcePage}` : "",
    payload.sourceLabel ? `Source label: ${payload.sourceLabel}` : "",
    payload.locale ? `Browser language: ${payload.locale}` : "",
    `Prepared at: ${payload.createdAt}`,
    "",
    detailLines.length ? "Optional details:" : "",
    ...detailLines
  ].filter(Boolean);

  const internalBody = [
    ...bodyLines,
    "",
    "First-response standard (internal):",
    `- Reply ${payload.responseWindow} and keep ${payload.inquiryId} in the thread.`,
    "- Acknowledge one specific detail before proposing a direction.",
    "- Offer one concrete next direction and explain why it fits.",
    "- Ask no more than three next questions.",
    "- State what remains unconfirmed and share only the minimum necessary detail.",
    "- Keep the initiating contact in control; do not approach a traveler, host, or principal directly unless invited."
  ];

  const subject = `Localhost inquiry — ${payload.inquiryId} — ${payload.intentType}${
    payload.routeContext ? ` / ${payload.routeContext}` : ""
  }`;

  return {
    body: bodyLines.join("\n"),
    internalBody: internalBody.join("\n"),
    subject
  };
}

function buildMailtoHref({ body, subject }: { body: string; subject: string }) {
  return `mailto:${localhostDeliveryEmail}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
}

async function sendInquiryEmail({
  body,
  email,
  inquiryId,
  subject
}: {
  body: string;
  email: string;
  inquiryId: string;
  subject: string;
}): Promise<InquiryEmailDelivery> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) return { ok: false };

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        body: JSON.stringify({
          from,
          reply_to: email,
          subject,
          text: body,
          to: [localhostDeliveryEmail]
        }),
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Idempotency-Key": `private-route-review/${inquiryId}`
        },
        method: "POST",
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        const providerResponse: unknown = await response.json().catch(() => null);
        const providerMessageId = isRecord(providerResponse)
          ? cleanText(providerResponse.id, 120)
          : "";

        return {
          ok: true,
          providerMessageId: providerMessageId || undefined
        };
      }

      if (response.status === 409 && attempt === 0) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        continue;
      }

      if (response.status < 500) return { ok: false };
    } catch {
      // A single retry covers transient network and provider failures.
    }
  }

  return { ok: false };
}

export async function submitLocalhostInquiry(
  payload: LocalhostInquiryPayload
): Promise<LocalhostInquiryResult> {
  const requestHeaders = await headers();
  const requestKey = getRequestKey(requestHeaders);
  const startedAt = Date.now();

  if (cleanText(payload.honeypot)) {
    logInquiryEvent("honeypot_rejected", {
      intentType: isIntentType(payload.intentType) ? payload.intentType : undefined,
      routeContext: isRouteContext(payload.routeContext)
        ? payload.routeContext
        : undefined,
      sourcePage: cleanText(payload.sourcePage, 120)
    });
    return {
      message: "Received. Localhost will review your intent before suggesting next steps.",
      ok: true
    };
  }

  if (
    typeof payload.startedAt === "number" &&
    Date.now() - payload.startedAt < minimumSubmitDelayMs
  ) {
    logInquiryEvent("timing_rejected", {
      intentType: isIntentType(payload.intentType) ? payload.intentType : undefined,
      routeContext: isRouteContext(payload.routeContext)
        ? payload.routeContext
        : undefined,
      sourcePage: cleanText(payload.sourcePage, 120)
    });
    return {
      message: "Please wait a moment before submitting.",
      ok: false
    };
  }

  const email = cleanText(payload.email, 254).toLowerCase();
  const name = cleanText(payload.name, 120);
  const shortNote = cleanText(payload.shortNote);

  if (!isIntentType(payload.intentType)) {
    return {
      message: "Please choose Traveler, Host, or Partner.",
      ok: false
    };
  }

  if (!name) {
    return {
      message: "Please enter your name.",
      ok: false
    };
  }

  if (!email || !emailPattern.test(email)) {
    return {
      message: "Please enter a valid email.",
      ok: false
    };
  }

  if (!shortNote) {
    return {
      message: "Please add one sentence about what you are looking for.",
      ok: false
    };
  }

  const routeContext = isRouteContext(payload.routeContext)
    ? payload.routeContext
    : undefined;
  const sourcePage = cleanText(payload.sourcePage, 120);
  const sourceLabel = cleanText(payload.sourceLabel, 120);

  const now = Date.now();
  pruneInquiryGuards(now);

  if (isRateLimited(requestKey, now)) {
    logInquiryEvent("rate_limited", {
      intentType: payload.intentType,
      routeContext,
      sourcePage
    });
    return {
      message: "Please wait before sending another inquiry.",
      ok: false
    };
  }

  const optionalDetails = normalizeOptionalDetails(payload.optionalDetails);
  const fingerprint = inquiryFingerprint({
    email,
    intentType: payload.intentType,
    name,
    optionalDetails,
    routeContext,
    shortNote
  });

  if (recentInquiryHashes.has(fingerprint)) {
    logInquiryEvent("duplicate", {
      intentType: payload.intentType,
      routeContext,
      sourcePage
    });
    return {
      delivery: "duplicate",
      message: "We already have this private route review. We will continue with the first submission.",
      ok: true,
      responseWindow: localhostResponseWindow,
      summary: {
        email,
        intentType: payload.intentType,
        name,
        routeContext,
        shortNote,
        sourceLabel,
        sourcePage
      }
    };
  }

  const userAgent = cleanText(
    payload.userAgent || requestHeaders.get("user-agent"),
    240
  );
  const locale = cleanText(
    payload.locale || requestHeaders.get("accept-language"),
    120
  );
  // Use server time for the operational receipt and SLA reference.
  const createdAt = new Date().toISOString();
  const inquiryId = createInquiryId(createdAt);

  const normalizedPayload = {
    createdAt,
    email,
    inquiryId,
    intentType: payload.intentType,
    locale,
    name,
    optionalDetails,
    routeContext,
    responseWindow: localhostResponseWindow,
    shortNote,
    sourceLabel,
    sourcePage,
    userAgent
  };

  const emailContent = buildInquiryEmailContent(normalizedPayload);
  const emailDelivery = await sendInquiryEmail({
    body: emailContent.internalBody,
    email,
    inquiryId,
    subject: emailContent.subject
  });
  const mailtoHref = emailDelivery.ok ? undefined : buildMailtoHref(emailContent);

  if (emailDelivery.ok) recentInquiryHashes.set(fingerprint, now);

  logInquiryEvent(emailDelivery.ok ? "delivery_success" : "delivery_fallback", {
    durationMs: Date.now() - startedAt,
    inquiryId,
    intentType: payload.intentType,
    providerMessageId: emailDelivery.providerMessageId,
    routeContext,
    sourcePage: normalizedPayload.sourcePage
  });

  return {
    contactEmail: emailDelivery.ok ? undefined : localhostDeliveryEmail,
    delivery: emailDelivery.ok ? "email" : "mailto",
    inquiryId,
    mailtoHref,
    message:
      emailDelivery.ok
        ? `Thank you, ${name}. Your private route review has been received. Reference ${inquiryId}. A named Localhost reviewer will review fit, timing, and local feasibility before replying.`
        : `Thank you, ${name}. Your private route review has been prepared. If your email client does not open, please contact us directly.`,
    ok: true,
    responseWindow: localhostResponseWindow,
    summary: {
      email,
      intentType: payload.intentType,
      name,
      routeContext,
      shortNote,
      sourceLabel: normalizedPayload.sourceLabel,
      sourcePage: normalizedPayload.sourcePage
    }
  };
}
