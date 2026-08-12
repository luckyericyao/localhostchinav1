export const localhostMetricEvents = [
  "hero_cta",
  "inquiry_duplicate",
  "inquiry_error",
  "inquiry_honeypot_rejected",
  "inquiry_rate_limited",
  "inquiry_sent",
  "inquiry_start",
  "inquiry_submit_attempt",
  "inquiry_timing_rejected",
  "inquiry_delivery_fallback",
  "inquiry_delivery_success",
  "mailto_fallback",
  "optional_details",
  "request_route",
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

function cleanMetricString(value: string | undefined, maxLength: number) {
  return value?.trim().slice(0, maxLength) || "";
}

export async function persistLocalhostMetric(payload: LocalhostMetricPayload) {
  const apiKey = process.env.POSTHOG_API_KEY;
  if (!apiKey) return;

  const host = (process.env.POSTHOG_HOST || "https://app.posthog.com").replace(
    /\/$/,
    ""
  );
  const properties: Record<string, string | number> = {
    distinct_id: payload.sessionId
      ? cleanMetricString(payload.sessionId, 120)
      : "localhost-server",
    path: cleanMetricString(payload.path, 120),
    route: cleanMetricString(payload.route, 80),
    source: cleanMetricString(payload.source, 80)
  };

  const metricName = cleanMetricString(payload.metricName, 40);
  const inquiryId = cleanMetricString(payload.inquiryId, 48);

  if (metricName) properties.metric_name = metricName;
  if (inquiryId) properties.inquiry_id = inquiryId;
  if (typeof payload.value === "number" && Number.isFinite(payload.value)) {
    properties.value = Math.max(0, Math.min(payload.value, 120000));
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
