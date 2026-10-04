import { normalizeMetricSessionId } from "@/lib/metricSession";
import {
  normalizeMetricInquiryId, normalizeMetricName, normalizeMetricPath,
  normalizeMetricRoute, normalizeMetricSource
} from "@/lib/metricDimensions";

export const localhostMetricEvents = [
  "hero_cta",
  "inquiry_duplicate",
  "inquiry_error",
  "inquiry_honeypot_rejected",
  "inquiry_rate_limited",
  "representative_path_start",
  "inquiry_sent",
  "inquiry_start",
  "inquiry_submit_attempt",
  "inquiry_timing_rejected",
  "inquiry_delivery_fallback",
  "inquiry_delivery_success",
  "inquiry_delivery_unconfigured",
  "mailto_fallback",
  "optional_details",
  "page_view",
  "request_route",
  "review_sample",
  "route_select",
  "route_view",
  "validation_error",
  "web_vital"
] as const;

export type LocalhostMetricEvent = (typeof localhostMetricEvents)[number];

export type LocalhostMetricPayload = {
  event: LocalhostMetricEvent;
  inquiryId?: string;
  metricName?: string;
  path?: string;
  route?: string;
  sessionId?: string;
  source?: string;
  value?: number;
};

export function isAllowedMetricEvent(
  value: string
): value is LocalhostMetricEvent {
  return (localhostMetricEvents as readonly string[]).includes(value);
}

export function isAllowedClientMetricEvent(value: string): value is LocalhostMetricEvent {
  return isAllowedMetricEvent(value) && ![
    "inquiry_delivery_success",
    "inquiry_delivery_fallback",
    "inquiry_delivery_unconfigured",
    "inquiry_honeypot_rejected",
    "inquiry_timing_rejected"
  ].includes(value);
}

export async function persistLocalhostMetric(
  payload: LocalhostMetricPayload,
  options: { origin?: "client" | "server" } = {}
) {
  const origin = options.origin || "client";
  const record = {
    kind: "localhost_metric", version: 1,
    recordedAt: new Date().toISOString(), origin,
    event: payload.event,
    sessionId: normalizeMetricSessionId(payload.sessionId),
    path: normalizeMetricPath(payload.path),
    route: normalizeMetricRoute(payload.route),
    source: normalizeMetricSource(payload.source),
    metricName: payload.event === "web_vital" ? normalizeMetricName(payload.metricName) : "",
    inquiryId: origin === "server" ? normalizeMetricInquiryId(payload.inquiryId) : "",
    value: typeof payload.value === "number" && Number.isFinite(payload.value)
      ? Math.max(0, Math.min(payload.value, 120000)) : undefined
  };
  console.info(JSON.stringify(record));
  const apiKey = process.env.POSTHOG_API_KEY;
  if (!apiKey) return;

  const host = (process.env.POSTHOG_HOST || "https://app.posthog.com").replace(
    /\/$/,
    ""
  );
  const properties: Record<string, string | number> = {
    distinct_id: record.sessionId || "localhost-server",
    path: record.path,
    route: record.route,
    source: record.source
  };

  const metricName = record.metricName;
  const inquiryId = record.inquiryId;

  if (metricName) properties.metric_name = metricName;
  if (inquiryId) properties.inquiry_id = inquiryId;
  if (record.value !== undefined) {
    properties.value = record.value;
  }

  try {
    await fetch(`${host}/capture/`, {
      body: JSON.stringify({
        api_key: apiKey,
        event: payload.event,
        properties
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
      signal: AbortSignal.timeout(2000)
    });
  } catch {
    // Analytics must never block an inquiry or page interaction.
  }
}
