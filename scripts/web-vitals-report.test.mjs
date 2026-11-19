import assert from "node:assert/strict";
import test from "node:test";
import { buildWebVitalsReport } from "./lib/web-vitals-report.mjs";

function sample(index, fields = {}) {
  return JSON.stringify({
    kind: "localhost_metric", version: 1,
    recordedAt: new Date(Date.UTC(2026, 9, 3, 12, 0, index)).toISOString(),
    origin: "client", event: "web_vital", source: "web_vitals_v2",
    sessionId: `00000000-0000-0000-0000-${String(index).padStart(12, "0")}`,
    path: "/", metricName: "LCP", value: index * 100, ...fields
  });
}

test("empty exports do not imply zero-valued performance", () => {
  const report = buildWebVitalsReport(["", "not-json", sample(1, { event: "page_view" })]);
  assert.equal(report.observedWindow, null);
  assert.deepEqual(report.pages, {});
  assert.equal(report.quality.inputLines, 2);
  assert.equal(report.quality.acceptedSamples, 0);
});

test("only valid current collector samples enter the report, with no repeated exports or private fields", () => {
  const current = sample(1, { path: "/inquiry?email=PRIVATE#PRIVATE", note: "PRIVATE", metricName: "CLS", value: 0 });
  const report = buildWebVitalsReport([
    current, JSON.stringify({ message: current }), sample(2, { source: "smoke" }),
    sample(3, { source: "web_vitals" }), sample(4, { sessionId: "PRIVATE" }),
    sample(5, { origin: "server" }), sample(6, { path: "/PRIVATE" }),
    sample(7, { metricName: "FCP" }), sample(8, { value: -1 }),
    sample(9, { value: "0" }), sample(10, { recordedAt: "PRIVATE" })
  ]);
  assert.deepEqual(report.quality, {
    inputLines: 11, ignoredLines: 1, excludedSources: 2, rejectedVitals: 5,
    missingSessions: 1, duplicateRecords: 1, acceptedSamples: 1
  });
  assert.deepEqual(report.pages["/inquiry"].CLS, {
    unit: "score", samples: 1, sessions: 1, p75: null, status: "insufficient_sample"
  });
  assert.equal(report.pages["/inquiry"].INP.samples, 0);
  assert.equal(report.pages["/inquiry"].INP.p75, null);
  assert.doesNotMatch(JSON.stringify(report), /PRIVATE|00000000-0000-0000-0000-000000000001/);
});

test("the internal floor is per page and metric, based on distinct sessions", () => {
  const sessionId = "00000000-0000-0000-0000-000000000001";
  const report = buildWebVitalsReport(Array.from({ length: 30 }, (_, i) => sample(i + 1, { sessionId })));
  assert.deepEqual(report.pages["/"].LCP, {
    unit: "ms", samples: 30, sessions: 1, p75: null, status: "insufficient_sample"
  });
});

test("above the floor, nearest-rank P75 is grouped by measured page and metric and requires review", () => {
  const samples = Array.from({ length: 25 }, (_, i) => i + 1);
  const report = buildWebVitalsReport(samples.flatMap((i) => [
    sample(i), sample(i, { metricName: "CLS", value: 0 }),
    sample(i, { path: "/china/shanxi", metricName: "INP", value: i })
  ]).reverse());
  assert.deepEqual(report.pages["/"].LCP, {
    unit: "ms", samples: 25, sessions: 25, p75: 1900, status: "requires_traffic_review"
  });
  assert.equal(report.pages["/"].CLS.p75, 0);
  assert.equal(report.pages["/china/shanxi"].INP.p75, 19);
  assert.equal(report.pages["/china/shanxi"].LCP.p75, null);
});
