import assert from "node:assert/strict";
import test from "node:test";
import { buildInquiryHref, buildNavigationInquiryHref } from "../lib/inquiryLinks.ts";

const paramsFor = (href) => new URL(href, "https://example.test").searchParams;

test("shared navigation retains each active route and its source page", () => {
  for (const route of ["shanxi", "shaolin", "huizhou", "shanghai"]) {
    for (const source of ["header", "footer"]) {
      const params = paramsFor(buildNavigationInquiryHref(`/china/${route}`, source));
      assert.equal(params.get("route"), route);
      assert.equal(params.get("sourcePage"), `/china/${route}`);
      assert.equal(params.get("sourceLabel"), source === "header" ? "Header" : "Footer");
      assert.equal(params.get("type"), "traveler");
    }
  }
});

test("general pages retain their own source without inventing a route", () => {
  for (const path of ["/", "/china", "/journeys", "/travelers", "/trust", "/china/private-routes", "/china/beijing", "/inquiry"]) {
    const params = paramsFor(buildNavigationInquiryHref(path, "header"));
    assert.equal(params.get("sourcePage"), path);
    assert.equal(params.has("route"), false);
  }
  assert.equal(paramsFor(buildNavigationInquiryHref(null, "footer")).get("sourcePage"), "/");
});

test("navigation links do not capture query or hash values", () => {
  const href = buildNavigationInquiryHref("/china/shanxi?email=private@example.test#private-note", "header");
  const params = paramsFor(href);
  assert.equal(params.get("sourcePage"), "/china/shanxi");
  assert.equal(params.get("route"), "shanxi");
  assert.equal(href.includes("private"), false);
});

test("the shared builder preserves explicitly supplied intake context", () => {
  const params = paramsFor(buildInquiryHref({
    intentType: "partner", routeContext: "huizhou",
    sourceLabel: "Private review & local context", sourcePage: "/trust"
  }));
  assert.equal(params.get("type"), "partner");
  assert.equal(params.get("route"), "huizhou");
  assert.equal(params.get("sourceLabel"), "Private review & local context");
  assert.equal(params.get("sourcePage"), "/trust");
  assert.equal(paramsFor(buildInquiryHref({ intentType: "host" })).size, 1);
});
