import assert from "node:assert/strict";
import { chromium } from "playwright-core";

const site = new URL(process.env.SITE_URL || "http://127.0.0.1:3118");
assert.ok(site.protocol === "http:" && ["127.0.0.1", "localhost"].includes(site.hostname), "Use an isolated local production build");
const profile = {
  viewport: { width: 390, height: 844 }, deviceScaleFactor: 3,
  cpuThrottle: 4, latency: 150, downloadThroughput: 200000, uploadThroughput: 93750
};
const paths = ["/", "/china/shanxi", "/china/shaolin", "/china/huizhou", "/china/shanghai"];
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true
});

async function measure(path) {
  const context = await browser.newContext({
    viewport: profile.viewport, deviceScaleFactor: profile.deviceScaleFactor,
    isMobile: true, hasTouch: true, serviceWorkers: "block"
  });
  try {
    await context.route("**/*", (route) => {
      const request = route.request();
      return request.method() === "GET" && new URL(request.url()).origin === site.origin
        ? route.continue() : route.abort();
    });
    await context.addInitScript(() => {
      navigator.sendBeacon = () => true;
      window.__localhostLoad = { lcp: null, shifts: [] };
      new PerformanceObserver((list) => {
        const last = list.getEntries().at(-1);
        if (last) window.__localhostLoad.lcp = {
          ms: Math.round(last.startTime), tag: last.element?.tagName ?? null, url: last.url || null
        };
      }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) window.__localhostLoad.shifts.push([entry.startTime, entry.value]);
        }
      }).observe({ type: "layout-shift", buffered: true });
    });
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
    await cdp.send("Network.emulateNetworkConditions", {
      offline: false, latency: profile.latency,
      downloadThroughput: profile.downloadThroughput, uploadThroughput: profile.uploadThroughput
    });
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: profile.cpuThrottle });
    const response = await page.goto(new URL(path, site).href, { waitUntil: "load", timeout: 25000 });
    assert.equal(response?.status(), 200, path);
    // Measure an untouched initial viewport, including late image or font shifts.
    await page.waitForTimeout(1000);
    const result = await page.evaluate(() => {
      const { lcp, shifts } = window.__localhostLoad;
      let cls = 0, sum = 0, first = -Infinity, previous = -Infinity;
      for (const [time, value] of shifts) {
        if (time - previous >= 1000 || time - first >= 5000) { first = time; sum = 0; }
        previous = time;
        sum += value;
        cls = Math.max(cls, sum);
      }
      const resources = performance.getEntriesByType("resource").filter((entry) => entry.transferSize > 0);
      const hero = document.querySelector(".discovery-hero-image, .chapter-opening-image");
      return {
        lcpMs: lcp?.ms ?? null,
        lcpElement: lcp?.tag ?? null,
        cls: Math.round(cls * 10000) / 10000,
        heroDecoded: hero?.complete && hero.naturalWidth > 0,
        lcpImageBytes: resources.find((entry) => entry.name === lcp?.url)?.transferSize ?? null,
        imageBytes: resources.filter((entry) => entry.initiatorType === "img" ||
          /\/_next\/image\?|\/images\//.test(entry.name)
        ).reduce((total, entry) => total + entry.transferSize, 0)
      };
    });
    assert.ok(result.heroDecoded, `${path}: hero did not decode`);
    assert.ok(Number.isFinite(result.lcpMs), `${path}: LCP unavailable`);
    return result;
  } finally {
    await context.close();
  }
}

try {
  console.log(JSON.stringify({ measurement: "local lab, cold browser, not field Core Web Vitals", browser: browser.version(), profile }));
  for (const path of paths) {
    const trials = [];
    for (let run = 0; run < 3; run += 1) trials.push(await measure(path));
    const medianLcpMs = trials.map(({ lcpMs }) => lcpMs).sort((a, b) => a - b)[1];
    const maxCls = Math.max(...trials.map(({ cls }) => cls));
    const pass = medianLcpMs < 2500 && maxCls < 0.1;
    if (!pass) process.exitCode = 1;
    console.log(JSON.stringify({ path, medianLcpMs, maxCls, pass, trials }));
  }
} finally {
  await browser.close();
}
