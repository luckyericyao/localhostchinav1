import { NextResponse } from "next/server";

const allowedEvents = new Set([
  "hero_cta",
  "inquiry_sent",
  "inquiry_start",
  "mailto_fallback",
  "optional_details",
  "request_route",
  "route_view",
  "validation_error"
]);

function cleanValue(value: unknown, maxLength = 80) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

async function persistMetric(payload: {
  event: string;
  path: string;
  route: string;
  source: string;
}) {
  const apiKey = process.env.POSTHOG_API_KEY;
  if (!apiKey) return;

  const host = (process.env.POSTHOG_HOST || "https://app.posthog.com").replace(
    /\/$/,
    ""
  );

  try {
    await fetch(`${host}/capture/`, {
      body: JSON.stringify({
        api_key: apiKey,
        event: payload.event,
        properties: {
          distinct_id: "localhost-anonymous",
          path: payload.path,
          route: payload.route,
          source: payload.source
        }
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
      signal: AbortSignal.timeout(2000)
    });
  } catch {
    // Analytics must never block an inquiry or page interaction.
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const event = cleanValue(payload?.event);

    if (!allowedEvents.has(event)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    // Keep the first measurement layer privacy-safe: no email, notes, or user agent.
    const metric = {
      event,
      path: cleanValue(payload?.path, 120),
      route: cleanValue(payload?.route),
      source: cleanValue(payload?.source)
    };

    console.info("Localhost metric", metric);
    await persistMetric(metric);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
