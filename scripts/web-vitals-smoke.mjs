import assert from "node:assert/strict";
import { chromium } from "playwright-core";

const base = new URL(process.env.SITE_URL || "http://127.0.0.1:3118");
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true
});

try {
  const context = await browser.newContext({
    serviceWorkers: "block",
    viewport: { width: 390, height: 844 }
  });
  await context.addInitScript(() => {
    navigator.sendBeacon = () => true;
    new PerformanceObserver((list, observer) => {
      if (!list.getEntries().length) return;
      window.lcpPaintObserved = true;
      observer.disconnect();
    }).observe({ type: "largest-contentful-paint", buffered: true });
  });
  await context.route("**/*", (route) => {
    const request = route.request();
    const url = new URL(request.url());
    return url.origin === base.origin && request.method() === "GET" &&
      url.pathname !== "/api/analytics" && !url.pathname.startsWith("/_vercel/")
      ? route.continue() : route.abort();
  });
  let page = await context.newPage();
  const readVitals = () => page.evaluate(() =>
    window.localhostDataLayer?.filter((item) => item.event === "web_vital") || []);
  const waitForPaint = () => page.waitForFunction(() => window.lcpPaintObserved,
    undefined, { timeout: 12000 });
  const waitForLcp = () => page.waitForFunction(
    () => window.localhostDataLayer?.some((item) => item.event === "web_vital" && item.metricName === "LCP"),
    undefined, { timeout: 12000 });

  assert.equal((await page.goto(new URL("/?audit=browser-only", base).href)).status(), 200);
  await page.waitForFunction(() => window.localhostDataLayer?.some((item) =>
    item.event === "page_view" && item.path === "/"));
  await waitForPaint();
  await page.locator('main a[href="/china/shanxi"]').first().click();
  await page.waitForURL("**/china/shanxi");
  await waitForLcp();
  assert.equal(await page.evaluate(() => new URL(performance.getEntriesByType("navigation")[0].name).pathname), "/");
  const vitals = await readVitals();
  assert.ok(vitals.some(({ metricName, path, source }) =>
    metricName === "LCP" && path === "/" && source === "web_vitals_v2"));
  assert.ok(vitals.every(({ source }) => source === "web_vitals_v2"), "Old collector must not emit");
  console.log("PASS home to Shanxi: real navigation LCP is attributed to its document, not the destination");

  await page.close();
  page = await context.newPage();
  // Initial fragment scrolling can suppress the browser's LCP entry.
  const inquiry = new URL("/inquiry?route=shanxi&audit=browser-only", base);
  assert.equal((await page.goto(inquiry.href)).status(), 200);
  await waitForPaint();
  await page.locator("form:not([inert]) #inquiry-name").click();
  await waitForLcp();
  const inquiryVitals = await readVitals();
  assert.ok(inquiryVitals.every(({ path, source, value }) =>
    path === "/inquiry" && source === "web_vitals_v2" && Number.isFinite(value)));
  assert.doesNotMatch(JSON.stringify(inquiryVitals), /browser-only|private-route|route=shanxi/);
  console.log("PASS inquiry deep link: normalized path only, no analytics posts or submissions");
} finally {
  await browser.close();
}
