import { NextResponse } from "next/server";
import { normalizeMetricSessionId } from "@/lib/metricSession";
import { normalizeMetricName, normalizeMetricPath, normalizeMetricRoute, normalizeMetricSource } from "@/lib/metricDimensions";
import {
  isAllowedClientMetricEvent,
  persistLocalhostMetric,
  type LocalhostMetricEvent
} from "@/lib/metrics";

function cleanValue(value: unknown, maxLength = 80) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
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
      metricName: event === "web_vital" ? normalizeMetricName(payload?.metricName) : "",
      path: normalizeMetricPath(payload?.path),
      route: normalizeMetricRoute(payload?.route),
      sessionId: normalizeMetricSessionId(payload?.sessionId),
      source: normalizeMetricSource(payload?.source),
      value
    };

    await persistLocalhostMetric(metric);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
