import assert from "node:assert/strict";
import test from "node:test";
import * as dimensions from "../lib/metricDimensions.ts";

test("known page paths retain attribution without query or fragment data", () => {
  assert.equal(dimensions.normalizeMetricPath("/inquiry?name=PRIVATE#PRIVATE"), "/inquiry");
  assert.equal(dimensions.normalizeMetricPath("/china/shanxi/"), "/china/shanxi");
  for (const input of ["", undefined, {}, "private@example.test", "/private-person", "https://example.test/inquiry", "#PRIVATE"]) {
    assert.equal(dimensions.normalizeMetricPath(input), "");
  }
});

test("routes and sources use finite dimensions, not arbitrary visitor text", () => {
  assert.equal(dimensions.normalizeMetricRoute("shanxi"), "Shanxi");
  assert.equal(dimensions.normalizeMetricRoute("China general"), "China general");
  for (const input of ["PRIVATE", "constructor", "__proto__", "toString", {}, undefined]) {
    assert.equal(dimensions.normalizeMetricRoute(input), "");
    assert.equal(dimensions.normalizeMetricSource(input), "");
  }
  assert.equal(dimensions.normalizeMetricSource("Shanxi route page"), "Shanxi route page");
  assert.equal(dimensions.normalizeMetricSource("homepage_featured_routes"), "homepage_featured_routes");
  assert.equal(dimensions.normalizeMetricSource("/inquiry?principal=PRIVATE"), "/inquiry");
});

test("performance names and server references cannot accept private identifiers", () => {
  for (const value of ["LCP", "CLS", "INP"]) assert.equal(dimensions.normalizeMetricName(value), value);
  assert.equal(dimensions.normalizeMetricName("PRIVATE_NAME"), "");
  const reference = "LH-2026-10-03-ABCDEF01";
  assert.equal(dimensions.normalizeMetricInquiryId(reference), reference);
  assert.equal(dimensions.normalizeMetricInquiryId("PRIVATE_REFERENCE"), "");
});

test("web vitals use only the measured navigation's allowlisted pathname", () => {
  const origin = "https://example.test";
  assert.deepEqual(dimensions.normalizeWebVital({
    name: "LCP", navigationURL: `${origin}/?audit=browser#entry`, value: 1221.5
  }, origin), { metricName: "LCP", path: "/", value: 1222 });
  assert.deepEqual(dimensions.normalizeWebVital({
    name: "CLS", navigationURL: `${origin}/inquiry?type=traveler`, value: 0.03456
  }, origin), { metricName: "CLS", path: "/inquiry", value: 0.0346 });
  assert.equal(dimensions.normalizeMetricSource("web_vitals_v2"), "web_vitals_v2");
  const valid = { name: "INP", navigationURL: `${origin}/china/shanxi`, value: 44 };
  for (const attributes of [
    { navigationURL: undefined }, { navigationURL: "/china/shanxi" },
    { navigationURL: "https://other.example.test/china/shanxi" },
    { navigationURL: `${origin}/unknown` }, { name: "FCP" },
    { value: NaN }, { value: Infinity }, { value: -1 }, { value: "44" }
  ]) assert.equal(dimensions.normalizeWebVital({ ...valid, ...attributes }, origin), null);
});

test("automatic analytics drops unknown paths and strips query, fragment, and credentials", () => {
  assert.equal(dimensions.normalizeAnalyticsUrl("https://example.test/inquiry?email=private@example.test#PRIVATE"), "https://example.test/inquiry");
  assert.equal(dimensions.normalizeAnalyticsUrl("https://user:password@example.test/china/shanxi"), "https://example.test/china/shanxi");
  for (const value of ["https://example.test/private-person", "not a URL", "javascript:/inquiry"]) {
    assert.equal(dimensions.normalizeAnalyticsUrl(value), null);
  }
});
