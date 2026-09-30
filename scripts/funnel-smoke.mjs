import assert from "node:assert/strict";
import { chromium } from "playwright-core";

const baseUrl = process.env.SITE_URL || "http://127.0.0.1:3118";
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true
});

try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const metrics = [];
  await page.route("**/api/analytics", (route) => {
    metrics.push(route.request().postDataJSON());
    return route.fulfill({ status: 200, body: "{}" });
  });
  await page.route("**/_vercel/insights/**", (route) =>
    route.fulfill({ status: 200, body: "" })
  );
  // Block inquiry submission entirely; this check only exercises entry behavior.
  await page.route("**/inquiry**", (route) =>
    route.request().method() === "POST" ? route.abort() : route.continue()
  );

  await page.goto(baseUrl, { waitUntil: "load" });
  await page.waitForFunction(() => window.localhostDataLayer?.some(
    (event) => event.event === "page_view" && event.path === "/"
  ));
  await page.locator('[data-track-event="route_select"][href="/china/shanxi"]').first().click();
  await page.waitForURL("**/china/shanxi");
  await page.waitForFunction(() => window.localhostDataLayer?.some(
    (event) => event.event === "route_view" && event.path === "/china/shanxi"
  ));
  await page.locator('[data-track-source="route_hero"]').click();
  await page.waitForURL("**/inquiry?**");
  await page.locator("#inquiry-name").fill("PRIVATE TEST NAME");
  await page.locator("#inquiry-email").fill("private-test@example.test");
  await page.locator("#inquiry-short-note").fill("PRIVATE TEST INTENT");
  await page.waitForFunction(() => window.localhostDataLayer?.some(
    (event) => event.event === "inquiry_start"
  ));
  const events = await page.evaluate(() => window.localhostDataLayer);
  const session = events.find((event) => event.event === "page_view" && event.path === "/").sessionId;
  assert.match(session, /^[a-f0-9-]{36}$/i);
  for (const event of ["page_view", "route_select", "route_view", "request_route", "inquiry_start"]) {
    const matches = events.filter((item) => item.event === event);
    assert.ok(matches.length, `Missing ${event}`);
    assert.ok(matches.every((item) => item.sessionId === session), `${event}: session changed`);
  }
  assert.equal(events.filter((item) => item.event === "inquiry_start").length, 1);
  assert.equal(events.some((item) => item.event === "inquiry_submit_attempt"), false);
  for (const privateValue of ["PRIVATE TEST NAME", "private-test@example.test", "PRIVATE TEST INTENT"]) {
    assert.equal(JSON.stringify([events, metrics]).includes(privateValue), false);
  }
  console.log("PASS homepage → Shanxi → inquiry: one anonymous session, one inquiry start, no personal data or submission");
} finally {
  await browser.close();
}
