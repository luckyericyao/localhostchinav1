import { normalizeMetricSessionId } from "../../lib/metricSession.ts";
import { normalizeMetricInquiryId, normalizeMetricPath, normalizeMetricSource } from "../../lib/metricDimensions.ts";
import { parseMetricRecord } from "./metric-log.mjs";

const events = new Set(["page_view", "route_view", "inquiry_start", "inquiry_delivery_success", "inquiry_delivery_fallback", "inquiry_delivery_unconfigured"]);
const activeRoutes = new Map(["shanxi", "shaolin", "huizhou", "shanghai"].map((route) => [`/china/${route}`, route]));
const deliveryEvents = new Set(["inquiry_delivery_success", "inquiry_delivery_fallback", "inquiry_delivery_unconfigured"]);

function readRecord(line) {
  const parsed = parseMetricRecord(line);
  if (!parsed) return null;
  const { record, time } = parsed;
  if (!events.has(record.event) || (deliveryEvents.has(record.event) && record.origin !== "server")) return null;
  return {
    event: record.event, time, origin: record.origin,
    path: normalizeMetricPath(record.path), source: normalizeMetricSource(record.source),
    sessionId: normalizeMetricSessionId(record.sessionId),
    inquiryId: record.origin === "server" ? normalizeMetricInquiryId(record.inquiryId) : ""
  };
}

function rate(numerator, denominator, target) {
  return { numerator, denominator, rate: denominator ? numerator / denominator : null, target };
}

function firstTime(records, event, predicate = () => true, after = -Infinity) {
  return records.find((record) => record.event === event && record.time >= after && predicate(record))?.time;
}

export function buildFunnelReport(lines) {
  const sessions = new Map();
  const uniqueRecords = new Set();
  const outcomes = new Map();
  const quality = { inputLines: 0, supportedRecords: 0, ignoredLines: 0, duplicateRecords: 0, syntheticRecords: 0, recordsWithoutSession: 0, outcomesWithoutReference: 0 };
  let earliest = Infinity, latest = -Infinity;
  for (const line of lines) {
    if (!line.trim()) continue;
    quality.inputLines += 1;
    const record = readRecord(line);
    if (!record) { quality.ignoredLines += 1; continue; }
    if (record.source === "smoke") { quality.syntheticRecords += 1; continue; }
    const key = JSON.stringify(record);
    if (uniqueRecords.has(key)) { quality.duplicateRecords += 1; continue; }
    uniqueRecords.add(key);
    quality.supportedRecords += 1;
    earliest = Math.min(earliest, record.time);
    latest = Math.max(latest, record.time);
    if (deliveryEvents.has(record.event)) {
      if (record.inquiryId) {
        if (!outcomes.has(record.inquiryId)) outcomes.set(record.inquiryId, new Set());
        outcomes.get(record.inquiryId).add(record.event);
      } else quality.outcomesWithoutReference += 1;
    }
    if (!record.sessionId) { quality.recordsWithoutSession += 1; continue; }
    if (!sessions.has(record.sessionId)) sessions.set(record.sessionId, []);
    sessions.get(record.sessionId).push(record);
  }

  const observed = [...sessions.values()].map((records) => {
    records.sort((a, b) => a.time - b.time);
    return { records, enteredAt: firstTime(records, "page_view", (record) => Boolean(record.path)) };
  }).filter(({ enteredAt }) => enteredAt !== undefined).sort((a, b) => a.enteredAt - b.enteredAt);
  const sample = observed.slice(0, 100);
  let home = 0, homeToRoute = 0, routes = 0, routeToStart = 0, starts = 0, startToAcceptance = 0;
  const routeViews = Object.fromEntries([...activeRoutes.values()].map((route) => [route, 0]));
  for (const { records } of sample) {
    const homeAt = firstTime(records, "page_view", (record) => record.path === "/");
    const routeAt = firstTime(records, "route_view", (record) => activeRoutes.has(record.path));
    const startAt = firstTime(records, "inquiry_start");
    if (homeAt !== undefined) {
      home += 1;
      if (firstTime(records, "route_view", (record) => activeRoutes.has(record.path), homeAt) !== undefined) homeToRoute += 1;
    }
    if (routeAt !== undefined) {
      routes += 1;
      if (firstTime(records, "inquiry_start", () => true, routeAt) !== undefined) routeToStart += 1;
    }
    if (startAt !== undefined) {
      starts += 1;
      if (firstTime(records, "inquiry_delivery_success", (record) => Boolean(record.inquiryId), startAt) !== undefined) startToAcceptance += 1;
    }
    for (const path of new Set(records.filter((record) => record.event === "route_view" && activeRoutes.has(record.path)).map((record) => record.path))) {
      routeViews[activeRoutes.get(path)] += 1;
    }
  }
  const delivery = { validReferences: outcomes.size, accepted: 0, recoveryPrepared: 0, unconfigured: 0, referencesWithMultipleOutcomes: 0 };
  for (const observedOutcomes of outcomes.values()) {
    if (observedOutcomes.size > 1) delivery.referencesWithMultipleOutcomes += 1;
    if (observedOutcomes.has("inquiry_delivery_success")) delivery.accepted += 1;
    else if (observedOutcomes.has("inquiry_delivery_fallback")) delivery.recoveryPrepared += 1;
    else delivery.unconfigured += 1;
  }
  return {
    kind: "localhost_funnel_report", version: 2,
    observedWindow: Number.isFinite(earliest) ? { from: new Date(earliest).toISOString(), to: new Date(latest).toISOString() } : null,
    quality,
    observedSessions: observed.length,
    sample: { target: 100, size: sample.length, status: sample.length < 100 ? "insufficient_sample" : "requires_traffic_review" },
    funnel: {
      homepageToRoute: rate(homeToRoute, home, 0.25),
      routeToInquiryStart: rate(routeToStart, routes, 0.15),
      inquiryStartToProviderAcceptance: rate(startToAcceptance, starts, 0.4)
    },
    routeViews,
    delivery: { ...delivery, providerAcceptanceRate: rate(delivery.accepted, delivery.validReferences, null) },
    limits: [
      "This is an observed log sample, not proof of 100 valid human visitors or high-net-worth intent.",
      "Exports can omit earlier or later session steps because of log retention, query limits, and network arrival order.",
      "Provider acceptance does not prove inbox receipt or a human reply. Prepared email recovery is not a successful submission.",
      "Delivery counts summarize unique references across the export, not sessions in the 100-session sample.",
      "Historical unstructured logs are ignored rather than reconstructed into unsupported measurements."
    ]
  };
}
