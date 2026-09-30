import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { normalizeMetricSessionId } from "../lib/metricSession.ts";

function load(path, dependencies, extra = {}) {
  const source = readFileSync(new URL(path, import.meta.url), "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS }
  }).outputText;
  const exports = {};
  vm.runInNewContext(output, {
    exports,
    require: (name) => {
      assert.ok(name in dependencies, `Unexpected dependency: ${name}`);
      return dependencies[name];
    },
    ...extra
  });
  return exports;
}

function harness() {
  const captured = [];
  const logged = [];
  const metrics = load("../lib/metrics.ts", {
    "@/lib/metricSession": { normalizeMetricSessionId }
  });
  const route = load("../app/api/analytics/route.ts", {
    "next/server": { NextResponse: { json: Response.json } },
    "@/lib/metricSession": { normalizeMetricSessionId },
    "@/lib/metrics": {
      ...metrics,
      persistLocalhostMetric: async (metric) => { captured.push(metric); }
    }
  }, { console: { info: (_label, metric) => logged.push(metric) } });
  return { post: route.POST, captured, logged };
}

function request(payload) {
  return new Request("https://example.test/api/analytics", {
    method: "POST", body: JSON.stringify(payload)
  });
}

test("page views retain opaque sessions and drop personal fields", async () => {
  const h = harness();
  const sessionId = "04f3afbb-2097-48b1-832e-7e15eea08c03";
  const response = await h.post(request({
    event: "page_view", path: "/", sessionId,
    name: "PRIVATE NAME", email: "private@example.test", shortNote: "PRIVATE NOTE"
  }));
  assert.equal(response.status, 200);
  assert.equal(h.captured[0].sessionId, sessionId);
  assert.equal(h.logged[0].sessionId, sessionId);
  for (const value of ["PRIVATE NAME", "private@example.test", "PRIVATE NOTE"]) {
    assert.equal(JSON.stringify([h.captured, h.logged]).includes(value), false);
  }
});

test("browser endpoint cannot claim authoritative delivery outcomes", async () => {
  const h = harness();
  for (const event of [
    "inquiry_delivery_success", "inquiry_delivery_fallback",
    "inquiry_delivery_unconfigured", "inquiry_honeypot_rejected", "inquiry_timing_rejected"
  ]) {
    assert.equal((await h.post(request({ event }))).status, 400);
  }
  assert.equal(h.captured.length, 0);
  assert.equal(h.logged.length, 0);
});

test("invalid session identity is discarded and unknown events are rejected", async () => {
  const h = harness();
  assert.equal((await h.post(request({ event: "inquiry_start", sessionId: "private@example.test" }))).status, 200);
  assert.equal(h.captured[0].sessionId, "");
  assert.equal(JSON.stringify(h.logged).includes("private@example.test"), false);
  assert.equal((await h.post(request({ event: "unknown" }))).status, 400);
});
