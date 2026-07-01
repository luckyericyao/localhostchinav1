"use server";

import { headers } from "next/headers";

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

  return {
    message: payload.routeContext
      ? "Received. Your route context has been included automatically."
      : "Received. Localhost will review your intent, route fit, and timing before suggesting next steps.",
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
