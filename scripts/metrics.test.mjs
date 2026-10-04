import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { normalizeMetricSessionId } from "../lib/metricSession.ts";
import * as dimensions from "../lib/metricDimensions.ts";

const output = ts.transpileModule(readFileSync(new URL("../lib/metrics.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS }
}).outputText;

function harness(env = {}, fail = false) {
  const exports = {}, logged = [], requests = [];
  const dependencies = { "@/lib/metricSession": { normalizeMetricSessionId }, "@/lib/metricDimensions": dimensions };
  vm.runInNewContext(output, {
    exports, require: (name) => { assert.ok(name in dependencies); return dependencies[name]; },
    process: { env }, AbortSignal,
    console: { info: (line) => logged.push(JSON.parse(line)) },
    fetch: async (url, options) => {
      requests.push({ url, payload: JSON.parse(options.body) });
      if (fail) throw new Error("PRIVATE PROVIDER ERROR");
      return { ok: true };
    }
  });
  return { persist: exports.persistLocalhostMetric, logged, requests };
}

test("unconfigured destination still produces timestamped, privacy-safe JSON evidence", async () => {
  const h = harness();
  await h.persist({ event: "page_view", path: "/inquiry?principal=PRIVATE PRINCIPAL",
    source: "private@example.test", route: "PRIVATE ROUTE", inquiryId: "PRIVATE REFERENCE", origin: "server" });
  assert.equal(h.requests.length, 0);
  assert.equal(h.logged.length, 1);
  assert.equal(h.logged[0].kind, "localhost_metric");
  assert.equal(h.logged[0].origin, "client");
  assert.equal(h.logged[0].path, "/inquiry");
  assert.ok(Number.isFinite(Date.parse(h.logged[0].recordedAt)));
  assert.equal(JSON.stringify(h.logged).includes("PRIVATE"), false);
  assert.equal(JSON.stringify(h.logged).includes("private@example.test"), false);
});

test("server acceptance has its own authority and normalized reference", async () => {
  const h = harness({ POSTHOG_API_KEY: "TEST KEY", POSTHOG_HOST: "https://example.test" });
  const sessionId = "04f3afbb-2097-48b1-832e-7e15eea08c03";
  await h.persist({ event: "inquiry_delivery_success", sessionId, path: "/china/shanxi",
    route: "shanxi", source: "server_action", inquiryId: "LH-2026-10-03-ABCDEF01" }, { origin: "server" });
  assert.equal(h.logged[0].origin, "server");
  assert.equal(h.logged[0].route, "Shanxi");
  assert.equal(h.requests[0].payload.properties.inquiry_id, "LH-2026-10-03-ABCDEF01");
  assert.equal(h.requests[0].payload.properties.distinct_id, sessionId);
  assert.equal(JSON.stringify(h.logged).includes("TEST KEY"), false);
});

test("only bounded metric values and known dimensions reach an existing destination", async () => {
  const h = harness({ POSTHOG_API_KEY: "TEST KEY", POSTHOG_HOST: "https://example.test/" });
  await h.persist({ event: "web_vital", path: "/private-person", route: "PRIVATE ROUTE",
    source: "PRIVATE SOURCE", metricName: "PRIVATE NAME", value: 9999999 });
  assert.equal(h.requests[0].url, "https://example.test/capture/");
  assert.equal(h.requests[0].payload.properties.value, 120000);
  assert.equal(JSON.stringify([h.logged, h.requests]).includes("PRIVATE"), false);
  assert.equal(JSON.stringify([h.logged, h.requests]).includes("private-person"), false);
});

test("destination failure never blocks interaction or copies exception text into evidence", async () => {
  const h = harness({ POSTHOG_API_KEY: "TEST KEY" }, true);
  await h.persist({ event: "inquiry_start", path: "/inquiry" });
  assert.equal(h.logged.length, 1);
  assert.equal(JSON.stringify(h.logged).includes("PRIVATE PROVIDER ERROR"), false);
});
