import assert from "node:assert/strict";
import * as crypto from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { normalizeMetricSessionId } from "../lib/metricSession.ts";
import { readInquiryFields } from "../lib/inquiryValidation.ts";
import { normalizeMetricPath, normalizeMetricSource } from "../lib/metricDimensions.ts";
import { replyDueAt, reviewOwner } from "../lib/inquiryOperations.ts";

const source = readFileSync(new URL("../app/actions/submitLocalhostInquiry.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
}).outputText;

function harness(send, contactEmail = "owner@example.test", publicEmail = contactEmail) {
  const exports = {};
  const events = [];
  const metrics = [];
  let clock = Date.now();
  const dependencies = {
    "node:crypto": crypto,
    "next/headers": { headers: async () => new Headers({ "x-real-ip": "192.0.2.1" }) },
    "@/lib/contact": {
      localhostContactEmail: publicEmail,
      localhostDeliveryEmail: contactEmail,
      localhostResponseWindow: "within two working days"
    },
    "@/lib/metrics": { persistLocalhostMetric: async (metric) => { metrics.push(metric); } },
    "@/lib/inquiryEmail": { sendInquiryEmail: send },
    "@/lib/metricSession": { normalizeMetricSessionId },
    "@/lib/metricDimensions": { normalizeMetricPath, normalizeMetricSource },
    "@/lib/inquiryValidation": { readInquiryFields },
    "@/lib/inquiryOperations": { replyDueAt, reviewOwner }
  };
  // Execute the real server action with isolated state and no network capability.
  vm.runInNewContext(compiled, {
    exports,
    require: (name) => {
      assert.ok(name in dependencies, `Unexpected dependency: ${name}`);
      return dependencies[name];
    },
    console: { info: (record) => events.push(JSON.parse(record)) },
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

test("inquiry analytics retain only a known source path, not private URL parameters", async () => {
  let body;
  const h = harness(async (mail) => { body = mail.body; return accepted; });
  await h.submit({ ...payload, sourcePage: "/china/shanxi?principal=PRIVATE PRINCIPAL#PRIVATE NOTE",
    sourceLabel: "PRIVATE SOURCE", locale: "PRIVATE LOCALE", userAgent: "PRIVATE AGENT" });
  assert.equal(h.events[0].sourcePage, "/china/shanxi");
  assert.equal(h.metrics[0].path, "/china/shanxi");
  assert.equal(JSON.stringify([h.events, h.metrics]).includes("PRIVATE PRINCIPAL"), false);
  assert.equal(JSON.stringify([h.events, h.metrics]).includes("PRIVATE NOTE"), false);
  assert.match(body, /Source page: \/china\/shanxi/);
  assert.doesNotMatch(body, /PRIVATE PRINCIPAL|PRIVATE NOTE|PRIVATE SOURCE|PRIVATE LOCALE|PRIVATE AGENT/);
});

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
  assert.match(results[0].message, /submitted for private review/);
  assert.doesNotMatch(results[0].message, /received|inbox/i);
  assert.equal(results[1].inquiryId, results[0].inquiryId);
  assert.equal(h.events.filter((event) => event.event === "delivery_success").length, 1);
  assert.equal(h.metrics.filter((metric) => metric.event === "inquiry_delivery_success").length, 1);
  const repeat = await h.submit(payload);
  assert.equal(repeat.delivery, "duplicate");
  assert.match(repeat.message, /already submitted for private review/);
  assert.doesNotMatch(repeat.message, /received|already have/i);
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

test("a retry after email preparation keeps the reference and provider envelope", async () => {
  const attempts = [];
  const h = harness(async (mail) => {
    attempts.push(mail);
    return attempts.length === 1 ? { ok: false } : accepted;
  });
  const fallback = await h.submit({ ...payload, sourcePage: "/china/shanxi", sourceLabel: "Footer",
    optionalDetails: { timing: "Late autumn", avoidances: "Long stair climbs" } });
  assert.equal(fallback.delivery, "mailto");
  assert.match(fallback.mailtoHref, /^mailto:owner@example.test\?/);
  assert.match(fallback.message, /could not confirm direct receipt/);
  assert.equal(fallback.preparedEmail.body.includes(payload.shortNote), true);
  assert.equal(fallback.preparedEmail.subject.includes(fallback.inquiryId), true);
  h.advance(5000);
  const delivered = await h.submit({ ...payload, sourcePage: "/inquiry", sourceLabel: "Header",
    optionalDetails: { avoidances: "Long stair climbs", timing: "Late autumn" } });
  assert.equal(delivered.delivery, "email");
  assert.equal(delivered.preparedEmail, undefined);
  assert.equal(delivered.inquiryId, fallback.inquiryId);
  assert.equal(attempts.length, 2);
  assert.deepEqual(attempts[1], attempts[0]);
  assert.deepEqual(h.events.map(({ event, inquiryId }) => ({ event, inquiryId })), [
    { event: "delivery_fallback", inquiryId: fallback.inquiryId },
    { event: "delivery_success", inquiryId: fallback.inquiryId }
  ]);
  assert.equal(h.events[0].sourcePage, "/china/shanxi");
  assert.equal(h.events[1].sourcePage, "/inquiry");
});

test("a failed attempt keeps its reference for a fixed window without suppressing retries", async () => {
  const attempts = [];
  const h = harness(async (mail) => { attempts.push(mail); return { ok: false }; });
  const first = await h.submit(payload);
  h.advance(14 * 60 * 1000);
  const retry = await h.submit(payload);
  assert.equal(retry.delivery, "mailto");
  assert.equal(retry.inquiryId, first.inquiryId);
  assert.deepEqual(retry.preparedEmail, first.preparedEmail);
  h.advance(2 * 60 * 1000);
  const later = await h.submit(payload);
  assert.equal(later.delivery, "mailto");
  assert.notEqual(later.inquiryId, first.inquiryId);
  assert.equal(attempts.length, 3);
});

test("different valid content is not attached to a previous fallback reference", async () => {
  const h = harness(async () => ({ ok: false }));
  const first = await h.submit(payload);
  const changed = await h.submit({ ...payload, shortNote: "Prefer one day near Datong." });
  assert.notEqual(first.inquiryId, changed.inquiryId);
  assert.ok(changed.preparedEmail.body.includes("Prefer one day near Datong."));
});

test("concurrent unconfigured results log once and keep one reference for later retries", async () => {
  let calls = 0;
  const h = harness(async () => { calls++; await new Promise(setImmediate); return { ok: false }; }, "");
  const concurrent = await Promise.all([h.submit(payload), h.submit(payload)]);
  assert.ok(concurrent.every(({ errorCode }) => errorCode === "delivery_unconfigured"));
  assert.equal(calls, 1);
  assert.equal(h.events.filter(({ event }) => event === "delivery_unconfigured").length, 1);
  await h.submit(payload);
  assert.equal(calls, 2);
  assert.equal(new Set(h.events.map(({ inquiryId }) => inquiryId)).size, 1);
});

test("public email recovery never reveals a private delivery inbox", async () => {
  const h = harness(async () => ({ ok: false }), "private-inbox@example.test", "public-contact@example.test");
  const result = await h.submit(payload);
  assert.equal(result.contactEmail, "public-contact@example.test");
  assert.match(result.mailtoHref, /^mailto:public-contact@example.test\?/);
  assert.equal(JSON.stringify(result).includes("private-inbox@example.test"), false);
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

test("overlong traveler content is rejected rather than silently shortened", async () => {
  let calls = 0;
  const h = harness(async () => { calls += 1; return accepted; });
  for (const change of [
    { name: "N".repeat(121) },
    { shortNote: "N".repeat(1201) },
    { optionalDetails: { foodPreferences: "N".repeat(801) } }
  ]) {
    const result = await h.submit({ ...payload, ...change });
    assert.equal(result.ok, false, "Oversized content must not be accepted partially");
    assert.ok(result.fieldError);
  }
  assert.equal(calls, 0);
});

test("content at supported limits retains its last character", async () => {
  let sent;
  const h = harness(async (inquiry) => { sent = inquiry; return accepted; });
  const shortNote = "N".repeat(1199) + "Z";
  const detail = "D".repeat(799) + "Z";
  const result = await h.submit({ ...payload, shortNote, optionalDetails: { foodPreferences: detail } });
  assert.equal(result.delivery, "email");
  assert.ok(sent.body.includes(shortNote));
  assert.ok(sent.body.includes(detail));
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
