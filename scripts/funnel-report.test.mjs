import assert from "node:assert/strict";
import test from "node:test";
import { buildFunnelReport } from "./lib/funnel-report.mjs";

function event(session, seconds, name, path = "/", extra = {}) {
  return JSON.stringify({ kind: "localhost_metric", version: 1,
    recordedAt: new Date(Date.UTC(2026, 9, 3, 12, 0, seconds)).toISOString(),
    origin: "client", event: name, path, sessionId: `00000000-0000-0000-0000-${String(session).padStart(12, "0")}`,
    source: "", ...extra });
}
const receipt = { origin: "server", inquiryId: "LH-2026-10-03-ABCDEF01" };

test("empty and unsupported exports show insufficient evidence, not zero-percent performance", () => {
  const report = buildFunnelReport(["not JSON", JSON.stringify({ message: "Legacy Localhost metric" })]);
  assert.equal(report.sample.status, "insufficient_sample");
  assert.equal(report.sample.size, 0);
  assert.equal(report.funnel.homepageToRoute.rate, null);
  assert.equal(report.delivery.providerAcceptanceRate.rate, null);
  assert.equal(report.quality.ignoredLines, 2);
});

test("ordered session funnels count acceptance, never prepared email or browser success", () => {
  const lines = [
    event(1, 0, "page_view"), event(1, 1, "route_view", "/china/shanxi"), event(1, 2, "inquiry_start", "/inquiry"),
    event(1, 3, "inquiry_delivery_success", "/inquiry", receipt),
    event(2, 0, "page_view"), event(2, 1, "route_view", "/china/shaolin"), event(2, 2, "inquiry_start", "/inquiry"),
    event(2, 3, "inquiry_delivery_fallback", "/inquiry", { ...receipt, inquiryId: "LH-2026-10-03-ABCDEF02" }),
    event(2, 4, "inquiry_delivery_success", "/inquiry", { inquiryId: "LH-2026-10-03-ABCDEF02" }),
    event(2, 5, "inquiry_sent", "/inquiry"),
    event(3, 0, "page_view"), event(3, 1, "inquiry_start", "/inquiry"), event(3, 2, "route_view", "/china/huizhou")
  ];
  const report = buildFunnelReport(lines.reverse());
  assert.deepEqual(report.funnel.homepageToRoute, { numerator: 3, denominator: 3, rate: 1, target: 0.25 });
  assert.equal(report.funnel.routeToInquiryStart.numerator, 2);
  assert.equal(report.funnel.inquiryStartToProviderAcceptance.numerator, 1);
  assert.equal(report.funnel.inquiryStartToProviderAcceptance.denominator, 3);
  assert.equal(report.delivery.accepted, 1);
  assert.equal(report.delivery.recoveryPrepared, 1);
  assert.equal(report.delivery.providerAcceptanceRate.rate, 0.5);
});

test("delivery reporting counts each reference once and retains unconfigured outcomes in the denominator", () => {
  const fallbackOnly = { ...receipt, inquiryId: "LH-2026-10-03-ABCDEF02" };
  const unconfiguredOnly = { ...receipt, inquiryId: "LH-2026-10-03-ABCDEF03" };
  const report = buildFunnelReport([
    event(1, 0, "inquiry_delivery_unconfigured", "/inquiry", receipt),
    event(1, 1, "inquiry_delivery_fallback", "/inquiry", receipt),
    event(1, 2, "inquiry_delivery_success", "/inquiry", receipt),
    event(1, 3, "inquiry_delivery_success", "/inquiry", receipt),
    event(2, 1, "inquiry_delivery_fallback", "/inquiry", fallbackOnly),
    event(3, 1, "inquiry_delivery_unconfigured", "/inquiry", unconfiguredOnly),
    event(4, 1, "inquiry_delivery_success", "/inquiry", { origin: "server", inquiryId: "" })
  ].reverse());
  assert.equal(report.version, 2);
  assert.deepEqual(report.delivery, {
    validReferences: 3, accepted: 1, recoveryPrepared: 1, unconfigured: 1, referencesWithMultipleOutcomes: 1,
    providerAcceptanceRate: { numerator: 1, denominator: 3, rate: 1 / 3, target: null }
  });
  assert.equal(report.quality.outcomesWithoutReference, 1);
});

test("Vercel JSON wrappers, repeated exports, missing IDs, and synthetic records stay distinct", () => {
  const page = event(1, 0, "page_view");
  const report = buildFunnelReport([page, JSON.stringify({ message: page }),
    event(2, 1, "page_view", "/", { source: "smoke" }),
    event(3, 1, "page_view", "/", { sessionId: "private@example.test" }),
    event(3, 2, "inquiry_delivery_success", "/inquiry", { ...receipt, sessionId: "" }),
    event(4, 2, "route_view", "/china/shanxi")]);
  assert.equal(report.observedSessions, 1);
  assert.equal(report.quality.duplicateRecords, 1);
  assert.equal(report.quality.syntheticRecords, 1);
  assert.equal(report.quality.recordsWithoutSession, 2);
  assert.equal(report.delivery.accepted, 1);
  assert.equal(report.funnel.inquiryStartToProviderAcceptance.rate, null);
  assert.equal(JSON.stringify(report).includes("private@example.test"), false);
});

test("only first 100 observed sessions are sampled, future routes do not compete", () => {
  const lines = [];
  for (let i = 1; i <= 101; i += 1) lines.push(event(i, i, "page_view"));
  lines.push(event(1, 2, "route_view", "/china/beijing"));
  lines.push(event(101, 102, "route_view", "/china/shanghai"));
  const report = buildFunnelReport(lines);
  assert.equal(report.observedSessions, 101);
  assert.equal(report.sample.size, 100);
  assert.equal(report.sample.status, "requires_traffic_review");
  assert.equal(report.funnel.homepageToRoute.numerator, 0);
  assert.equal(report.routeViews.shanghai, 0);
});

test("report output never copies private fields, identifiers, or malformed timestamps", () => {
  const report = buildFunnelReport([
    event(1, 0, "page_view", "/inquiry?name=PRIVATE NAME", { source: "PRIVATE SOURCE", note: "PRIVATE NOTE", email: "private@example.test" }),
    event(1, 1, "inquiry_start", "/inquiry", { recordedAt: "PRIVATE TIME" })
  ]);
  const output = JSON.stringify(report);
  for (const value of ["PRIVATE NAME", "PRIVATE SOURCE", "PRIVATE NOTE", "private@example.test", "PRIVATE TIME", "00000000-0000-0000-0000-000000000001"]) {
    assert.equal(output.includes(value), false);
  }
  assert.equal(report.observedSessions, 1);
});
