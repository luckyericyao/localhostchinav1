import { normalizeMetricName, normalizeMetricPath } from "../../lib/metricDimensions.ts";
import { normalizeMetricSessionId } from "../../lib/metricSession.ts";
import { parseMetricRecord } from "./metric-log.mjs";

const source = "web_vitals_v2";
const minimumSessions = 25;
const names = ["LCP", "CLS", "INP"];

function summarize(group, metricName) {
  const values = group?.values || [];
  const sessions = group?.sessions.size || 0;
  const enough = sessions >= minimumSessions;
  values.sort((a, b) => a - b);
  return {
    unit: metricName === "CLS" ? "score" : "ms",
    samples: values.length,
    sessions,
    p75: enough ? values[Math.ceil(values.length * 0.75) - 1] : null,
    status: enough ? "requires_traffic_review" : "insufficient_sample"
  };
}

export function buildWebVitalsReport(lines) {
  const groups = new Map();
  const seen = new Set();
  const quality = {
    inputLines: 0, ignoredLines: 0, excludedSources: 0, rejectedVitals: 0,
    missingSessions: 0, duplicateRecords: 0, acceptedSamples: 0
  };
  let earliest = Infinity, latest = -Infinity;
  for (const line of lines) {
    if (!line.trim()) continue;
    quality.inputLines += 1;
    const parsed = parseMetricRecord(line);
    if (parsed?.record.event !== "web_vital") { quality.ignoredLines += 1; continue; }
    const { record, time } = parsed;
    if (record.source !== source) { quality.excludedSources += 1; continue; }
    const path = normalizeMetricPath(record.path);
    const name = normalizeMetricName(record.metricName);
    const { value } = record;
    if (record.origin !== "client" || !path || !name || !Number.isFinite(value) || value < 0) {
      quality.rejectedVitals += 1;
      continue;
    }
    const session = normalizeMetricSessionId(record.sessionId);
    if (!session) { quality.missingSessions += 1; continue; }
    const key = JSON.stringify([time, path, name, session, value]);
    if (seen.has(key)) { quality.duplicateRecords += 1; continue; }
    seen.add(key);
    quality.acceptedSamples += 1;
    earliest = Math.min(earliest, time);
    latest = Math.max(latest, time);
    if (!groups.has(path)) groups.set(path, new Map());
    const page = groups.get(path);
    if (!page.has(name)) page.set(name, { values: [], sessions: new Set() });
    page.get(name).values.push(value);
    page.get(name).sessions.add(session);
  }
  return {
    kind: "localhost_web_vitals_report", version: 1, source, minimumSessions,
    observedWindow: Number.isFinite(earliest)
      ? { from: new Date(earliest).toISOString(), to: new Date(latest).toISOString() }
      : null,
    quality,
    pages: Object.fromEntries([...groups.keys()].sort().map((path) => [path, Object.fromEntries(
      names.map((name) => [name, summarize(groups.get(path).get(name), name)])
    )])),
    limits: [
      "The minimum is an internal reporting floor, not a field performance standard.",
      "These are observed log samples, not verified human traffic or a mobile-only distribution.",
      "Export limits, missing browser measurements, and blocked or unavailable telemetry can affect coverage."
    ]
  };
}
