import { NextResponse } from "next/server";

const allowedEvents = new Set([
  "hero_cta",
  "inquiry_start",
  "mailto_fallback",
  "optional_details",
  "request_route",
  "route_view"
]);

function cleanValue(value: unknown, maxLength = 80) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const event = cleanValue(payload?.event);

    if (!allowedEvents.has(event)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    // Keep the first measurement layer privacy-safe: no email, notes, or user agent.
    console.info("Localhost metric", {
      event,
      path: cleanValue(payload?.path, 120),
      route: cleanValue(payload?.route),
      source: cleanValue(payload?.source)
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
