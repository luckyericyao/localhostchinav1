import { NextResponse } from "next/server";
import { normalizeMetricSessionId } from "@/lib/metricSession";
import {
  isAllowedClientMetricEvent,
  persistLocalhostMetric,
  type LocalhostMetricEvent
} from "@/lib/metrics";

function cleanValue(value: unknown, maxLength = 80) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function cleanMetricName(value: unknown) {
  const metricName = cleanValue(value, 40);
  return /^[A-Za-z0-9_.-]+$/.test(metricName) ? metricName : "";
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const eventValue = cleanValue(payload?.event);

    if (!isAllowedClientMetricEvent(eventValue)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const event = eventValue as LocalhostMetricEvent;
    const value =
      typeof payload?.value === "number" && Number.isFinite(payload.value)
        ? Math.max(0, Math.min(payload.value, 120000))
        : undefined;
    const metric = {
      event,
      inquiryId: cleanValue(payload?.inquiryId, 48),
      metricName: cleanMetricName(payload?.metricName),
      path: cleanValue(payload?.path, 120),
      route: cleanValue(payload?.route),
      sessionId: normalizeMetricSessionId(payload?.sessionId),
      source: cleanValue(payload?.source),
      value
    };

    // Keep the first measurement layer privacy-safe: no email, notes, or user agent.
    console.info("Localhost metric", {
      event: metric.event,
      metricName: metric.metricName,
      path: metric.path,
      route: metric.route,
      sessionId: metric.sessionId,
      source: metric.source,
      value: metric.value
    });
    await persistLocalhostMetric(metric);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
