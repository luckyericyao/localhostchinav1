import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright-core";
import axe from "axe-core";

const baseUrl = new URL(process.env.SITE_URL || "http://127.0.0.1:3118");
assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(baseUrl.hostname),
  "Discovery checks run against a local checkout only");
const auditDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai" }).format(new Date());
const runName = process.env.DISCOVERY_CHECK_RUN || "";
assert.match(runName, /^[a-z0-9-]{0,40}$/, "Use a short audit run name");
const artifacts = new URL(`../.codex-audit/discovery-pass-${auditDate}${runName ? `-${runName}` : ""}/`, import.meta.url);
mkdirSync(artifacts, { recursive: true });
const chapters = ["shanxi", "shaolin", "huizhou", "shanghai"];
const observations = [];
const pageErrors = [];
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true
});

async function protect(context) {
  context.setDefaultTimeout(12_000);
  context.setDefaultNavigationTimeout(20_000);
  await context.addInitScript(() => { navigator.sendBeacon = () => true; });
  await context.route("**/*", (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.pathname === "/api/analytics" || url.pathname.startsWith("/_vercel/insights/")) {
      return route.fulfill({ status: 200, body: "{}" });
    }
    if (url.origin !== baseUrl.origin || !["GET", "HEAD"].includes(request.method())) {
      return route.abort();
    }
    return route.continue();
  });
  context.on("page", (page) => page.on("pageerror", (error) => pageErrors.push(error.message)));
}

async function visit(page, path) {
  const response = await page.goto(new URL(path, baseUrl).href, { waitUntil: "load" });
  assert.equal(response.status(), 200, path);
  await page.locator("main#main-content").waitFor();
  await page.evaluate(() => document.fonts.ready);
}

async function checkImages(page) {
  for (const image of await page.locator("main img").all()) {
    await image.evaluate((element) => element.scrollIntoView({ block: "center", behavior: "instant" }));
    const handle = await image.elementHandle();
    try {
      await page.waitForFunction((element) => element.complete && element.naturalWidth > 0,
        handle, { timeout: 12_000 });
    } catch (error) {
      const state = await image.evaluate((element) => ({
        src: element.currentSrc,
        complete: element.complete,
        width: element.naturalWidth,
        bounds: element.getBoundingClientRect().toJSON(),
        scrollY: window.scrollY
      }));
      throw new Error(`Image did not load: ${JSON.stringify(state)}`, { cause: error });
    } finally {
      await handle.dispose();
    }
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
}

async function checkAxe(page, label) {
  await page.addScriptTag({ content: axe.source });
  const violations = await page.evaluate(async () =>
    (await window.axe.run(document)).violations.map(({ id, impact, nodes }) => ({
      id, impact, targets: nodes.map(({ target }) => target)
    }))
  );
  assert.deepEqual(violations, [], `${label}: axe violations`);
}

async function screenshot(page, name, fullPage = false) {
  await page.screenshot({ path: new URL(`${name}.png`, artifacts).pathname, fullPage });
}

try {
  const context = await browser.newContext();
  await protect(context);
  let page = await context.newPage();
  for (const viewport of [
    { width: 320, height: 568 },
    { width: 375, height: 812 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 900, height: 768 },
    { width: 1280, height: 720 },
    { width: 1440, height: 900 },
    { width: 1920, height: 1080 },
    { width: 844, height: 390 }
  ]) {
    // Each device starts with a fresh document, not an in-flight responsive resize.
    await page.close();
    page = await context.newPage();
    await page.setViewportSize(viewport);
    await visit(page, "/");
    await page.waitForFunction(() => document.querySelector(".discovery-hero-image").complete);
    const arrival = await page.evaluate(() => {
      const hero = document.querySelector(".discovery-hero");
      const image = hero.querySelector("img");
      const style = getComputedStyle(image);
      const next = document.querySelector("#shanxi-chapter").getBoundingClientRect();
      const visibleInquiries = [...document.querySelectorAll('a[href^="/inquiry"]')].filter((link) => {
        const bounds = link.getBoundingClientRect();
        return link.checkVisibility() && bounds.top < innerHeight && bounds.bottom > 0;
      });
      return {
        title: hero.querySelector("h1").textContent,
        copy: hero.textContent,
        actionCount: hero.querySelectorAll("a, button").length,
        forms: hero.querySelectorAll("form, input, textarea, select").length,
        visibleInquiries: visibleInquiries.length,
        nextTop: next.top,
        height: innerHeight,
        overflow: document.documentElement.scrollWidth > innerWidth,
        fit: style.objectFit,
        position: style.objectPosition,
        image: image.getAttribute("src")
      };
    });
    assert.equal(arrival.title, "China.");
    assert.equal(arrival.actionCount, 1);
    assert.equal(arrival.forms, 0);
    assert.equal(arrival.visibleInquiries, 0, "Inquiry is visible in the opening viewport");
    assert.doesNotMatch(arrival.copy, /inquiry|request|pricing|booking|working days|support level/i);
    assert.equal(arrival.overflow, false, `${viewport.width}px: horizontal overflow`);
    assert.ok(arrival.nextTop < arrival.height - 20, `${viewport.width}px: no next-chapter hint`);
    assert.equal(arrival.fit, "cover");
    assert.equal(arrival.position, "50% 50%");
    assert.equal(arrival.image, "/images/temple-of-heaven-centered-hero.avif");
    await screenshot(page, `home-${viewport.width}x${viewport.height}`);
    await page.locator(".discovery-explore").click();
    await page.waitForFunction(() => Math.abs(document.querySelector("#shanxi-chapter").getBoundingClientRect().top) < 3);
    assert.equal(new URL(page.url()).hash, "#shanxi-chapter");
    await checkImages(page);
    await page.evaluate(() => document.activeElement?.blur());
    const scenes = await page.locator("[data-discovery-scene]").evaluateAll((elements) =>
      elements.map((element) => {
        const link = element.querySelector(".discovery-chapter-image");
        const image = link.querySelector("img");
        const bounds = link.getBoundingClientRect();
        const url = new URL(image.currentSrc, location.origin);
        const heading = element.querySelector("h3");
        const headingRange = document.createRange();
        headingRange.selectNodeContents(heading);
        const headingText = headingRange.getBoundingClientRect();
        const headingColumn = heading.parentElement.getBoundingClientRect();
        return {
          chapter: element.dataset.discoveryScene,
          source: url.searchParams.get("url") || url.pathname,
          fullBleed: Math.abs(bounds.left) < 1 && Math.abs(bounds.right - innerWidth) < 1,
          height: bounds.height,
          loaded: image.complete && image.naturalWidth > 0,
          requestedWidth: Number(url.searchParams.get("w")) || image.naturalWidth,
          coverWidth: Math.ceil(Math.max(bounds.width, bounds.height * image.naturalWidth / image.naturalHeight)),
          headingFits: headingText.left >= headingColumn.left - 1 && headingText.right <= headingColumn.right + 1,
          credit: element.querySelector(".discovery-photo-credit").textContent
        };
      })
    );
    assert.deepEqual(scenes.map(({ chapter }) => chapter), ["shaolin", "huizhou", "shanghai"]);
    for (const scene of scenes) {
      const filename = {
        shaolin: "shaolin-pagoda-forest.webp",
        huizhou: "huizhou-waterfront.webp",
        shanghai: "shanghai-at-dusk.webp"
      }[scene.chapter];
      assert.equal(scene.source, `/images/chapters/${filename}`);
      assert.equal(scene.fullBleed, true, `${scene.chapter}: chapter image should fill the viewport width`);
      assert.ok(scene.height >= 360, `${scene.chapter}: chapter image is too shallow`);
      assert.equal(scene.loaded, true, `${scene.chapter}: image is missing or undersized`);
      assert.ok(scene.requestedWidth >= Math.min(scene.coverWidth, 3200),
        `${scene.chapter}: requested width ${scene.requestedWidth}px is too low for a ${scene.coverWidth}px cover crop`);
      assert.equal(scene.headingFits, true, `${scene.chapter}: heading intrudes into the next column`);
      assert.match(scene.credit, /Photo: .+ \/ .+ \/ Cropped and toned for display/);
      if ([390, 1440].includes(viewport.width)) {
        await page.locator(`[data-discovery-scene="${scene.chapter}"]`).screenshot({
          path: new URL(`${scene.chapter}-home-${viewport.width}.png`, artifacts).pathname
        });
      }
    }
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    const summary = page.locator(".discovery-menu summary");
    await summary.focus();
    await page.keyboard.press("Enter");
    assert.notEqual(await page.locator(".discovery-menu").getAttribute("open"), null);
    assert.deepEqual(await page.locator("[data-discovery-chapter]").evaluateAll((links) =>
      links.map((link) => link.dataset.discoveryChapter)), chapters);
    assert.equal(await page.locator('header [data-track-source="header"]').isVisible(), true);
    await page.keyboard.press("Tab");
    assert.equal(await page.locator('[data-discovery-chapter="shanxi"]').evaluate((link) => document.activeElement === link), true);
    await page.keyboard.press("Escape");
    assert.equal(await page.locator(".discovery-menu").getAttribute("open"), null);
    assert.equal(await summary.evaluate((element) => document.activeElement === element), true);
    await summary.click();
    if ([390, 1440].includes(viewport.width)) {
      await screenshot(page, `menu-${viewport.width}`);
      await checkAxe(page, `open menu ${viewport.width}px`);
    }
    await page.mouse.click(8, 80);
    assert.equal(await page.locator(".discovery-menu").getAttribute("open"), null,
      "An outside click must dismiss the menu");
    await summary.click();
    await page.locator('header [data-track-source="header"]').focus();
    await page.keyboard.press("Tab");
    assert.equal(await page.locator(".discovery-menu").getAttribute("open"), null,
      "Tabbing beyond the menu must dismiss it without trapping focus");
    if ([390, 1440].includes(viewport.width)) {
      await checkAxe(page, `homepage ${viewport.width}px`);
      await screenshot(page, `home-full-${viewport.width}`, true);
    }
    observations.push({ viewport, arrival, scenes, result: "pass" });
    console.log(`PASS ${viewport.width}x${viewport.height}: quiet opening, centered hero, next-chapter hint, loaded images, menu keyboard and dismissal`);
  }

  for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
    await page.setViewportSize(viewport);
    for (const chapter of chapters) {
      await visit(page, "/");
      await page.locator(".discovery-menu summary").click();
      await page.locator(`[data-discovery-chapter="${chapter}"]`).click();
      await page.waitForURL(new URL(`/china/${chapter}`, baseUrl).href);
      await page.locator(".chapter-opening h1").waitFor();
      assert.equal(await page.locator(".discovery-menu").getAttribute("open"), null,
        "Navigation must not leave the next chapter's menu open");
      const chapterState = await page.evaluate(() => {
        const sections = [...document.querySelectorAll("main > section")];
        const conversation = document.querySelector(".final-section").getBoundingClientRect();
        return {
          count: sections.length,
          gallery: sections.findIndex((section) => section.id === "chapter-places"),
          rhythm: sections.findIndex((section) => section.classList.contains("route-read-section")),
          fit: sections.findIndex((section) => section.classList.contains("route-decision-section")),
          examples: [...document.querySelectorAll(".eyebrow")].filter((node) => node.textContent === "Example Rhythm").length,
          sampleParts: document.querySelectorAll(".route-read-section .support-detail-card").length,
          overflowingRhythmLabels: [...document.querySelectorAll(".chapter-rhythm h3")]
            .filter((label) => label.scrollWidth > label.clientWidth).length,
          photographs: document.querySelectorAll(".route-photo-credit").length,
          openingInquiry: document.querySelectorAll('.chapter-opening a[href^="/inquiry"]').length,
          fullWidthConversation: conversation.left === 0 && Math.abs(conversation.width - innerWidth) < 1,
          quietContact: document.querySelector('[data-track-source="route_final"]').classList.contains("text-link"),
          overflow: document.documentElement.scrollWidth > innerWidth
        };
      });
      assert.equal(chapterState.count, 6);
      assert.ok(chapterState.gallery > 0 && chapterState.gallery < chapterState.rhythm && chapterState.rhythm < chapterState.fit);
      assert.equal(chapterState.examples, 1);
      assert.equal(chapterState.sampleParts, 4);
      assert.equal(chapterState.overflowingRhythmLabels, 0, "Example rhythm labels must fit their columns");
      assert.equal(chapterState.photographs, 3);
      assert.equal(chapterState.openingInquiry, 0);
      assert.equal(chapterState.fullWidthConversation, true, "Contact should close the page, not float as a card");
      assert.equal(chapterState.quietContact, true, "Contact should remain a quiet text link");
      assert.equal(chapterState.overflow, false);
      await page.waitForFunction(() => document.querySelector(".chapter-opening-image").complete);
      await screenshot(page, `${chapter}-${viewport.width}`);
      await checkImages(page);
      await checkAxe(page, `${chapter} ${viewport.width}px`);
      if (chapter === "shanxi") {
        await screenshot(page, `shanxi-full-${viewport.width}`, true);
        await page.locator(".final-section").screenshot({
          path: new URL(`shanxi-conversation-${viewport.width}.png`, artifacts).pathname
        });
      }
      await page.locator('[data-track-source="route_final"]').click();
      await page.waitForURL("**/inquiry?**");
      assert.equal(new URL(page.url()).searchParams.get("route"), chapter);
      assert.equal(new URL(page.url()).searchParams.get("sourcePage"), `/china/${chapter}`);
      console.log(`PASS ${chapter} ${viewport.width}px: two-action chapter access, places before fit, one example day, credited images, axe 0, inquiry context`);
    }
  }
  await context.close();

  const reduced = await browser.newContext({ reducedMotion: "reduce" });
  await protect(reduced);
  const reducedPage = await reduced.newPage();
  await visit(reducedPage, "/");
  assert.equal(await reducedPage.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), "auto");
  await reducedPage.locator(".discovery-explore").click();
  assert.equal(new URL(reducedPage.url()).hash, "#shanxi-chapter");
  await reduced.close();

  const staticContext = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  await protect(staticContext);
  const staticPage = await staticContext.newPage();
  await visit(staticPage, "/");
  await staticPage.locator(".discovery-menu summary").click();
  assert.equal(await staticPage.locator('[data-discovery-chapter="shanxi"]').isVisible(), true);
  await staticPage.locator('[data-discovery-chapter="shanxi"]').click();
  await staticPage.waitForURL(new URL("/china/shanxi", baseUrl).href);
  assert.equal(await staticPage.locator("h1").innerText(), "Shanxi");
  await checkImages(staticPage);
  const contact = staticPage.locator('[data-track-source="route_final"]');
  assert.equal(new URL(await contact.getAttribute("href"), baseUrl).searchParams.get("route"), "shanxi");
  await staticContext.close();
  assert.deepEqual(pageErrors, [], "Uncaught browser errors");
  writeFileSync(new URL("discovery-results.json", artifacts), JSON.stringify({
    baseUrl: baseUrl.origin,
    testedAt: new Date().toISOString(),
    scope: "local only; no messages sent or production changes",
    observations,
    chapterChecks: "4 chapters at 390px and 1440px; axe 0; route context retained",
    reducedMotion: "pass",
    noJavaScript: "native menu, chapter links, and scrolled route images pass",
    pageErrors
  }, null, 2));
  console.log("PASS reduced motion, no-JavaScript navigation and gallery images, and no browser errors; no real submissions or external requests");
} finally {
  await browser.close();
}
