import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright-core";
import axe from "axe-core";

const base = new URL(process.env.SITE_URL || "http://127.0.0.1:3000");
assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(base.hostname), "Use a local preview only");
const auditDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai" }).format(new Date());
const artifacts = new URL(`../.codex-audit/editorial-pass-${auditDate}/`, import.meta.url);
mkdirSync(artifacts, { recursive: true });
const routes = ["shanxi", "shaolin", "huizhou", "shanghai"];
const observations = [];
const continuations = [];
const errors = [];
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true
});

async function context(options = {}) {
  const ctx = await browser.newContext(options);
  ctx.setDefaultTimeout(12_000);
  await ctx.addInitScript(() => { navigator.sendBeacon = () => true; });
  await ctx.route("**/*", (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.pathname === "/api/analytics" || url.pathname.startsWith("/_vercel/insights/")) {
      return route.fulfill({ status: 200, body: "{}" });
    }
    if (url.origin !== base.origin || !["GET", "HEAD"].includes(request.method())) return route.abort();
    return route.continue();
  });
  ctx.on("page", (page) => page.on("pageerror", (error) => errors.push(error.message)));
  return ctx;
}

async function visit(page, path) {
  const response = await page.goto(new URL(path, base).href, { waitUntil: "load" });
  assert.equal(response.status(), 200, path);
  await page.locator("main#main-content").waitFor();
  await page.evaluate(() => document.fonts.ready);
}

async function inspect(page, path) {
  assert.equal(await page.locator("main form").count(), 0, "An index must not repeat the intake form");
  assert.equal(await page.locator("header .nav-cta").count(), 0, "Discovery navigation should remain quiet");
  assert.equal(await page.locator("main > .discovery-conversation").count(), 1);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, path);
  if (path === "/china") {
    assert.deepEqual(await page.locator("[data-china-place]").evaluateAll((items) => items.map((item) => item.dataset.chinaPlace)), routes);
    assert.equal(await page.locator(".china-atlas .discovery-photo-credit").count(), 4);
    assert.ok(await page.locator(".china-atlas-place").first().innerText().then((text) => /flagship chapter/i.test(text)));
    assert.equal(await page.locator("main .localhost-intake-form").count(), 0);
    assert.ok(await page.evaluate(() => document.querySelector(".discovery-orientation").getBoundingClientRect().top >=
      document.querySelector(".china-atlas").getBoundingClientRect().bottom));
    for (const slug of routes) {
      assert.equal(await page.locator(`[data-china-place="${slug}"] a.text-link`).getAttribute("href"), `/china/${slug}`);
    }
    const inquiry = new URL(await page.locator('[data-track-source="china_final"]').getAttribute("href"), base);
    assert.equal(inquiry.searchParams.get("sourcePage"), "/china");
    assert.equal(inquiry.searchParams.get("route"), "china-general");
  } else {
    const cards = page.locator(".journey-comparison-card");
    assert.equal(await cards.count(), 4);
    assert.deepEqual(await cards.evaluateAll((items) => items.map((item) => item.getAttribute("href").split("/").at(-1))), routes);
    assert.deepEqual(await cards.evaluateAll((items) => items.map((item) => item.getAttribute("aria-label"))),
      ["View Shanxi", "View Shaolin", "View Huizhou", "View Shanghai"]);
    assert.equal(await cards.locator("dt").count(), 12, "Best for, length/entry, pace on each route");
    const layout = await cards.evaluateAll((items) => ({
      allInView: items.every((item) => item.getBoundingClientRect().bottom <= innerHeight),
      firstVisible: items[0].getBoundingClientRect().top < innerHeight,
      usableFacts: items.every((item) => {
        const box = item.getBoundingClientRect();
        return box.height >= 44 && item.scrollWidth <= item.clientWidth &&
          [...item.querySelectorAll(".journey-comparison-meta dd")].every((fact) => {
            const bounds = fact.getBoundingClientRect();
            return bounds.width > 0 && bounds.height > 0 && bounds.right <= box.right + 1 &&
              bounds.bottom <= box.bottom + 1 && parseFloat(getComputedStyle(fact).fontSize) >= 13;
          });
      }),
      readable: items.every((item) => {
        for (let node = item; node; node = node.parentElement) {
          const style = getComputedStyle(node);
          if (Number(style.opacity) < 1 || style.filter !== "none") return false;
        }
        return true;
      })
    }));
    assert.equal(layout.readable, true, "Core comparison must never wait for a reveal effect");
    assert.equal(layout.usableFacts, true, "Every route must show complete, readable facts and a usable link");
    const { width, height } = page.viewportSize();
    if (width >= 1280 || (width >= 375 && width <= 430 && height >= 812)) {
      assert.equal(layout.allInView, true, `Four routes must fit the opening ${width}x${height} viewport`);
    }
    assert.equal(layout.firstVisible, true);
    assert.deepEqual(await page.locator(".journeys-future-list li").allTextContents(), ["Beijing", "Chengdu"]);
    assert.equal(await page.locator(".journeys-future-section a").count(), 0, "Future chapters must not compete as active routes");
  }
}

try {
  const narrow = await context({ viewport: { width: 320, height: 568 } });
  const narrowPage = await narrow.newPage();
  await visit(narrowPage, "/journeys");
  await inspect(narrowPage, "/journeys");
  await narrowPage.screenshot({ path: new URL("after-journeys-320.png", artifacts).pathname });
  await narrow.close();
  console.log("PASS /journeys 320px: readable route facts, no horizontal overflow");

  for (const viewport of [
    { width: 375, height: 812 }, { width: 390, height: 844 },
    { width: 768, height: 1024 }, { width: 1280, height: 720 },
    { width: 1440, height: 900 }
  ]) {
    const ctx = await context({ viewport });
    const page = await ctx.newPage();
    for (const path of ["/china", "/journeys"]) {
      await visit(page, path);
      await inspect(page, path);
      for (const image of await page.locator("main img").all()) {
        await image.evaluate((element) => element.scrollIntoView({ block: "center", behavior: "instant" }));
        const handle = await image.elementHandle();
        await page.waitForFunction((element) => element.complete && element.naturalWidth > 0, handle);
        await handle.dispose();
      }
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      await page.addScriptTag({ content: axe.source });
      const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map(({ id, nodes }) => ({ id, targets: nodes.map(({ target }) => target) })));
      assert.deepEqual(violations, [], `${path} ${viewport.width}: axe`);
      await page.screenshot({ path: new URL(`after-${path.slice(1)}-${viewport.width}.png`, artifacts).pathname });
      if ([390, 1440].includes(viewport.width)) await page.screenshot({ path: new URL(`after-${path.slice(1)}-full-${viewport.width}.png`, artifacts).pathname, fullPage: true });
      observations.push({ path, viewport, result: "pass" });
      console.log(`PASS ${path} ${viewport.width}px: clear page role, four chapters, no duplicate intake, loaded images, axe 0`);
    }
    await ctx.close();
  }

  for (const viewport of [{ width: 390, height: 844 }, { width: 1280, height: 720 }]) {
    const ctx = await context({ viewport });
    const page = await ctx.newPage();
    for (const [index, slug] of routes.entries()) {
      const path = `/china/${slug}`;
      const next = routes[(index + 1) % routes.length];
      const nextPath = `/china/${next}`;
      await visit(page, path);
      await page.waitForFunction((currentPath) => window.localhostDataLayer?.some((item) => item.event === "route_view" && item.path === currentPath), path);
      const links = page.locator(".chapter-continuation-link");
      assert.deepEqual(await links.evaluateAll((items) => items.map((item) => item.getAttribute("href").split("/").at(-1))), routes.filter((item) => item !== slug));
      assert.equal(await page.locator("main > section").count(), 6);
      assert.equal(await page.locator(".route-read-section").count(), 1);
      assert.equal(await links.evaluateAll((items) => items.every((item) =>
        item.getBoundingClientRect().height >= 44 && [...item.children].every((text) => text.scrollWidth <= text.clientWidth))), true, "Continuation link targets and labels must fit");
      if (slug === "shanxi") {
        await page.locator(".chapter-continuation").evaluate((element) => element.scrollIntoView({ block: "center", behavior: "instant" }));
        await page.screenshot({ path: new URL(`chapter-continuation-${viewport.width}.png`, artifacts).pathname });
      }
      const link = page.locator(`.chapter-continuation-link[href="${nextPath}"]`);
      await link.focus();
      await page.keyboard.press("Enter");
      await page.waitForURL(new URL(nextPath, base).href);
      await page.waitForFunction((currentPath) => window.localhostDataLayer?.some((item) => item.event === "route_view" && item.path === currentPath), nextPath);
      for (const source of ["header", "footer"]) {
        const href = await page.locator(`${source} [data-track-source="${source}"]`).getAttribute("href");
        const query = new URL(href, base).searchParams;
        assert.equal(query.get("route"), next);
        assert.equal(query.get("sourcePage"), nextPath);
      }
      await page.locator('[data-track-source="route_final"]').click();
      await page.waitForURL("**/inquiry?**");
      const query = new URL(page.url()).searchParams;
      assert.equal(query.get("route"), next);
      assert.equal(query.get("sourcePage"), nextPath);
      await page.waitForFunction(() => window.localhostDataLayer?.some((item) => item.event === "page_view" && item.path === "/inquiry"));
      const events = await page.evaluate(() => window.localhostDataLayer);
      const first = events.find((item) => item.event === "route_view" && item.path === path);
      const selected = events.find((item) => item.event === "route_select" && item.path === path);
      const opened = events.find((item) => item.event === "request_route" && item.path === nextPath);
      assert.match(first.sessionId, /^[a-f0-9-]{36}$/i);
      assert.equal(selected.route.toLowerCase(), next);
      assert.equal(selected.source, "route_page");
      assert.equal(selected.sessionId, first.sessionId);
      assert.equal(opened.sessionId, first.sessionId);
      assert.equal(events.some((item) => item.event === "inquiry_submit_attempt"), false);
      continuations.push({ from: slug, to: next, width: viewport.width, result: "pass" });
      console.log(`PASS ${viewport.width}px ${slug} -> ${next} -> inquiry: keyboard links, correct route context, anonymous session unchanged`);
    }
    await ctx.close();
  }

  for (const options of [{ javaScriptEnabled: false }, { reducedMotion: "reduce" }]) {
    const ctx = await context({ ...options, viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await visit(page, "/journeys");
    await inspect(page, "/journeys");
    await page.screenshot({ path: new URL(`after-routes-${options.javaScriptEnabled === false ? "nojs" : "reduced-motion"}.png`, artifacts).pathname });
    await page.locator('.journey-comparison-card[href="/china/shanxi"]').click();
    await page.waitForURL(new URL("/china/shanxi", base).href);
    assert.equal(await page.locator("h1").innerText(), "Shanxi");
    await page.locator('.chapter-continuation-link[href="/china/shaolin"]').click();
    await page.waitForURL(new URL("/china/shaolin", base).href);
    assert.equal(await page.locator("h1").innerText(), "Shaolin");
    await ctx.close();
    console.log(`PASS comparison and chapter continuation with ${options.javaScriptEnabled === false ? "JavaScript disabled" : "reduced motion"}: readable, navigable, no reveal dependency`);
  }
  assert.deepEqual(errors, []);
  writeFileSync(new URL("editorial-results.json", artifacts), JSON.stringify({ url: base.origin, testedAt: new Date().toISOString(), observations, continuations, browserErrors: errors }, null, 2));
} finally {
  await browser.close();
}
