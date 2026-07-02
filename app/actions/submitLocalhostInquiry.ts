"use server";

import { headers } from "next/headers";
import { localhostContactEmail } from "@/lib/contact";

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
  mailtoHref?: string;
  message: string;
  ok: boolean;
  summary?: {
    email: string;
    intentType: LocalhostIntentType;
    routeContext?: LocalhostRouteContext;
    shortNote?: string;
    sourceLabel?: string;
    sourcePage?: string;
  };
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const minimumSubmitDelayMs = 900;

function cleanText(value?: string) {
  return value?.trim() || "";
}

function hasRouteContext(routeContext?: LocalhostRouteContext) {
  return Boolean(routeContext);
}

function formatLabel(value: string) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase());
}

function buildInquiryEmail(payload: {
  createdAt: string;
  email: string;
  intentType: LocalhostIntentType;
  locale: string;
  optionalDetails: Record<string, string>;
  routeContext?: LocalhostRouteContext;
  shortNote: string;
  sourceLabel: string;
  sourcePage: string;
}) {
  const detailLines = Object.entries(payload.optionalDetails)
    .filter(([, value]) => cleanText(value))
    .map(([key, value]) => `${formatLabel(key)}: ${cleanText(value)}`);

  const body = [
    "Localhost private route review",
    "",
    `Role: ${payload.intentType}`,
    `Traveler email: ${payload.email}`,
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

  const subject = `Localhost inquiry — ${payload.intentType}${
    payload.routeContext ? ` / ${payload.routeContext}` : ""
  }`;

  return `mailto:${localhostContactEmail}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body.join("\n"))}`;
}

export async function submitLocalhostInquiry(
  payload: LocalhostInquiryPayload
): Promise<LocalhostInquiryResult> {
  if (cleanText(payload.honeypot)) {
    return {
      message: "Received. Localhost will review your intent before suggesting next steps.",
      ok: true
    };
  }

  if (
    typeof payload.startedAt === "number" &&
    Date.now() - payload.startedAt < minimumSubmitDelayMs
  ) {
    return {
      message: "Please wait a moment before submitting.",
      ok: false
    };
  }

  const email = cleanText(payload.email).toLowerCase();
  const shortNote = cleanText(payload.shortNote);

  if (!payload.intentType) {
    return {
      message: "Please choose Traveler, Host, or Partner.",
      ok: false
    };
  }

  if (!email || !emailPattern.test(email)) {
    return {
      message: "Please enter a valid email.",
      ok: false
    };
  }

  if (!hasRouteContext(payload.routeContext) && !shortNote) {
    return {
      message: "Please add one sentence about what you are looking for.",
      ok: false
    };
  }

  const headerList = await headers();
  const userAgent = payload.userAgent || headerList.get("user-agent") || "";
  const locale = payload.locale || headerList.get("accept-language") || "";
  const createdAt = payload.createdAt || new Date().toISOString();

  const normalizedPayload = {
    createdAt,
    email,
    intentType: payload.intentType,
    locale,
    optionalDetails: payload.optionalDetails || {},
    routeContext: payload.routeContext,
    shortNote,
    sourceLabel: cleanText(payload.sourceLabel),
    sourcePage: cleanText(payload.sourcePage),
    userAgent
  };

  console.info("Localhost inquiry received", normalizedPayload);

  const mailtoHref = buildInquiryEmail(normalizedPayload);

  return {
    contactEmail: localhostContactEmail,
    mailtoHref,
    message:
      payload.intentType === "traveler"
        ? "Your private route review has been prepared. If your email client does not open, please contact us directly."
        : "Your private inquiry has been prepared. If your email client does not open, please contact us directly.",
    ok: true,
    summary: {
      email,
      intentType: payload.intentType,
      routeContext: payload.routeContext,
      shortNote,
      sourceLabel: normalizedPayload.sourceLabel,
      sourcePage: normalizedPayload.sourcePage
    }
  };
}
