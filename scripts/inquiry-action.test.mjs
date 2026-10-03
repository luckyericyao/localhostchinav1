import assert from "node:assert/strict";
import * as crypto from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { normalizeMetricSessionId } from "../lib/metricSession.ts";

const source = readFileSync(new URL("../app/actions/submitLocalhostInquiry.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
}).outputText;

function harness(send, contactEmail = "owner@example.test") {
  const exports = {};
  const events = [];
  const metrics = [];
  let clock = Date.now();
  const dependencies = {
    "node:crypto": crypto,
    "next/headers": { headers: async () => new Headers({ "x-real-ip": "192.0.2.1" }) },
    "@/lib/contact": {
      localhostDeliveryEmail: contactEmail,
      localhostResponseWindow: "within two working days"
    },
    "@/lib/metrics": { persistLocalhostMetric: async (metric) => { metrics.push(metric); } },
    "@/lib/inquiryEmail": { sendInquiryEmail: send },
    "@/lib/metricSession": { normalizeMetricSessionId }
  };
  // Execute the real server action with isolated state and no network capability.
  vm.runInNewContext(compiled, {
    exports,
    require: (name) => {
      assert.ok(name in dependencies, `Unexpected dependency: ${name}`);
      return dependencies[name];
    },
    console: { info: (_label, event) => events.push(event) },
    process: { env: {} },
    Date: class extends Date { static now() { return clock; } }
  });
  return {
    submit: exports.submitLocalhostInquiry, events, metrics,
    advance: (milliseconds) => { clock += milliseconds; }
  };
}

const payload = {
  name: "Test Traveler", email: "traveler@example.test",
  intentType: "traveler", routeContext: "shanxi", shortNote: "Timber temples with moderate walking."
};
const accepted = { ok: true, providerMessageId: "test-provider-id" };

test("concurrent identical inquiries share one delivery and reference", async () => {
  let release;
  let announce;
  const entered = new Promise((resolve) => { announce = resolve; });
  let calls = 0;
  const h = harness(() => {
    calls += 1;
    announce();
    return new Promise((resolve) => { release = resolve; });
  });
  const first = h.submit(payload);
  await entered;
  const second = h.submit({ ...payload });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(calls, 1);
  release(accepted);
  const results = await Promise.all([first, second]);
  assert.equal(results[0].delivery, "email");
  assert.equal(results[1].inquiryId, results[0].inquiryId);
  assert.equal(h.events.filter((event) => event.event === "delivery_success").length, 1);
  assert.equal(h.metrics.filter((metric) => metric.event === "inquiry_delivery_success").length, 1);
  const repeat = await h.submit(payload);
  assert.equal(repeat.delivery, "duplicate");
  assert.equal(repeat.inquiryId, results[0].inquiryId);
  assert.equal(calls, 1);
});

test("structured fingerprints distinguish delimiter-containing details", async () => {
  let calls = 0;
  const h = harness(async () => { calls += 1; return accepted; });
  const first = await h.submit({ ...payload, optionalDetails: { a: "x&b=y" } });
  const second = await h.submit({ ...payload, optionalDetails: { a: "x", b: "y" } });
  assert.equal(second.delivery, "email");
  assert.notEqual(first.inquiryId, second.inquiryId);
  assert.equal(calls, 2);
});

test("equivalent detail ordering deduplicates, expired receipts allow another review", async () => {
  let calls = 0;
  const h = harness(async () => { calls += 1; return accepted; });
  await h.submit({ ...payload, optionalDetails: { a: "one", b: "two" } });
  const repeat = await h.submit({ ...payload, optionalDetails: { b: "two", a: "one" } });
  assert.equal(repeat.delivery, "duplicate");
  h.advance(16 * 60 * 1000);
  assert.equal((await h.submit({ ...payload, optionalDetails: { a: "one", b: "two" } })).delivery, "email");
  assert.equal(calls, 2);
});

test("failed delivery does not suppress a later retry or claim receipt", async () => {
  let calls = 0;
  const h = harness(async () => (++calls === 1 ? { ok: false } : accepted));
  const fallback = await h.submit(payload);
  assert.equal(fallback.delivery, "mailto");
  assert.match(fallback.mailtoHref, /^mailto:owner@example.test\?/);
  assert.match(fallback.message, /could not confirm direct receipt/);
  assert.equal(fallback.preparedEmail.body.includes(payload.shortNote), true);
  assert.equal(fallback.preparedEmail.subject.includes(fallback.inquiryId), true);
  const delivered = await h.submit(payload);
  assert.equal(delivered.delivery, "email");
  assert.equal(delivered.preparedEmail, undefined);
  assert.equal(calls, 2);
});

test("manual recovery retains a long inquiry without exposing internal response instructions", async () => {
  const h = harness(async () => ({ ok: false }));
  const optionalDetails = Object.fromEntries(Array.from({ length: 32 }, (_, i) =>
    [`detail${i}`, `Optional detail ${i}: ${"test context ".repeat(59)}`]
  ));
  const result = await h.submit({ ...payload, optionalDetails });
  assert.equal(result.delivery, "mailto");
  assert.ok(result.mailtoHref.length > 30000, "Fixture must exercise a long email link");
  const draft = result.preparedEmail;
  const url = new URL(result.mailtoHref);
  assert.equal(draft.body, url.searchParams.get("body"));
  assert.equal(draft.subject, url.searchParams.get("subject"));
  for (const value of Object.values(optionalDetails)) assert.ok(draft.body.includes(value.trim()));
  assert.equal(draft.body.includes("First-response standard (internal)"), false);
  assert.equal(JSON.stringify([h.events, h.metrics]).includes(payload.shortNote), false);
});

test("missing contact configuration stays a failure, not a duplicate", async () => {
  const h = harness(async () => ({ ok: false }), "");
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const result = await h.submit(payload);
    assert.equal(result.ok, false);
    assert.equal(result.errorCode, "delivery_unconfigured");
    assert.equal(result.mailtoHref, undefined);
  }
});

test("validation prevents delivery and operational logs omit personal content", async () => {
  let calls = 0;
  const h = harness(async () => { calls += 1; return accepted; });
  for (const invalid of [{ name: "" }, { email: "invalid" }, { shortNote: "" }, { intentType: "other" }]) {
    assert.equal((await h.submit({ ...payload, ...invalid })).ok, false);
  }
  assert.equal(calls, 0);
  await h.submit(payload);
  const logs = JSON.stringify([h.events, h.metrics]);
  for (const privateValue of [payload.name, payload.email, payload.shortNote]) {
    assert.equal(logs.includes(privateValue), false);
  }
});

test("accepted delivery retains its anonymous funnel session", async () => {
  let delivered;
  const h = harness(async (inquiry) => { delivered = inquiry; return accepted; });
  const sessionId = "04f3afbb-2097-48b1-832e-7e15eea08c03";
  await h.submit({ ...payload, sessionId });
  assert.equal(h.metrics[0].sessionId, sessionId);
  assert.equal(h.events[0].sessionId, sessionId);
  assert.equal(delivered.body.includes(sessionId), false);
});

test("free-form identity cannot become an anonymous session ID", async () => {
  for (const sessionId of [payload.email, payload.name, "", null, 42, "session-email@example.test"]) {
    assert.equal(normalizeMetricSessionId(sessionId), "");
    const h = harness(async () => accepted);
    await h.submit({ ...payload, sessionId });
    assert.equal(h.metrics[0].sessionId, "");
    assert.equal(h.events[0].sessionId, "");
  }
  assert.equal(normalizeMetricSessionId("session-mgz30ym0-2jh8s7k"), "session-mgz30ym0-2jh8s7k");
});
