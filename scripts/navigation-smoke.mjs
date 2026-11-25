import assert from "node:assert/strict";
import { chromium } from "playwright-core";

const base = new URL(process.env.SITE_URL || "http://127.0.0.1:3118");
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true
});
const cases = [
  { path: "/travelers", menu: ".mobile-menu", link: "For Travelers", onward: "Trust", destination: "/trust" },
  { path: "/journeys", menu: ".discovery-menu", link: "Compare routes", onward: "Traveling with us", destination: "/travelers" }
];

async function context(options = {}) {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 }, serviceWorkers: "block", ...options
  });
  await ctx.addInitScript(() => { navigator.sendBeacon = () => true; });
  await ctx.route("**/*", (route) => {
    const request = route.request();
    const url = new URL(request.url());
    return url.origin === base.origin && request.method() === "GET" &&
      url.pathname !== "/api/analytics" && !url.pathname.startsWith("/_vercel/")
      ? route.continue() : route.abort();
  });
  return ctx;
}

async function visit(page, path) {
  const response = await page.goto(new URL(path, base).href);
  assert.equal(response.status(), 200, path);
}

async function checkFirstReview(page, withDraft = false) {
  await visit(page, "/inquiry?route=shaolin");
  const draft = page.locator("#inquiry-short-note");
  if (withDraft) await draft.fill("Local draft for the sample review check");
  const link = page.getByRole("link", { name: /^See an illustrative first review/ });
  const [sample] = await Promise.all([page.waitForEvent("popup"), link.press("Enter")]);
  try {
    await sample.waitForLoadState("load");
    assert.equal(sample.url(), new URL("/trust#sample-review", base).href);
    const section = sample.getByRole("region", { name: "What a useful first reply can make clear." });
    assert.equal(await section.evaluate((node) => document.activeElement === node), true);
    assert.equal(new URL(page.url()).searchParams.get("route"), "shaolin");
    if (withDraft) assert.equal(await draft.inputValue(), "Local draft for the sample review check");
  } finally {
    await sample.close();
  }
}

try {
  const ctx = await context();
  const page = await ctx.newPage();
  const missingPage = await page.goto(new URL("/page-not-found-check", base).href);
  assert.equal(missingPage.status(), 404);
  await page.waitForFunction(() => window.vaq?.some(([setting]) => setting === "beforeSend"));
  assert.equal(await page.evaluate(() =>
    (window.localhostDataLayer || []).some((event) => event.event === "page_view")), false);
  await page.getByRole("main").getByRole("link", { name: "Explore China Routes" }).click();
  await page.waitForURL(new URL("/journeys", base).href);
  await page.waitForFunction(() => window.localhostDataLayer?.some((event) =>
    event.event === "page_view" && event.path === "/journeys"));
  console.log("PASS missing page is not counted as a visit; the recovered route index is counted");

  for (const { path, menu: selector, link, onward, destination } of cases) {
    await visit(page, path);
    await page.waitForFunction((pathname) => window.localhostDataLayer?.some((item) =>
      item.event === "page_view" && item.path === pathname), path);
    const menu = page.locator(selector);
    const toggle = menu.locator("summary");
    const nav = menu.locator("nav");
    const current = nav.getByRole("link", { name: link, exact: true });
    const opened = () => menu.evaluate((element) => element.open);
    const isFocused = (locator) => locator.evaluate((element) => element === document.activeElement);
    const openWithKeyboard = async () => {
      await toggle.press("Enter");
      assert.equal(await opened(), true);
    };
    assert.equal(await toggle.getAttribute("aria-controls"), await nav.getAttribute("id"));
    await openWithKeyboard();
    await current.focus();
    await page.keyboard.press("Escape");
    assert.equal(await opened(), false);
    assert.equal(await isFocused(toggle), true);

    await openWithKeyboard();
    await page.locator(".brand-link").focus();
    assert.equal(await opened(), false);
    assert.equal(await isFocused(page.locator(".brand-link")), true);

    await toggle.click();
    assert.equal(await opened(), true);
    assert.equal(await page.evaluate(() => !document.elementFromPoint(5, 420)?.closest("details")), true);
    await page.mouse.click(5, 420);
    assert.equal(await opened(), false);

    await openWithKeyboard();
    await current.press("Enter");
    assert.equal(await opened(), false);
    assert.equal(await isFocused(toggle), true);
    assert.equal(new URL(page.url()).pathname, path);

    await openWithKeyboard();
    await nav.getByRole("link", { name: onward, exact: true }).press("Enter");
    await page.waitForURL(new URL(destination, base).href);
    await page.waitForFunction(() => document.activeElement?.id === "main-content");
    assert.equal(await page.locator("header details[open]").count(), 0);
    await page.keyboard.press("Tab");
    assert.equal(await page.evaluate(() => Boolean(document.activeElement?.closest("main"))), true);

    await page.goBack();
    await page.waitForURL(new URL(path, base).href);
    assert.equal(await isFocused(page.locator("main#main-content")), false);

    const seenDestination = await page.evaluate((pathname) => (window.localhostDataLayer || [])
      .filter((item) => item.event === "page_view" && item.path === pathname).length, destination);
    await toggle.click();
    await nav.getByRole("link", { name: onward, exact: true }).click();
    await page.waitForURL(new URL(destination, base).href);
    await page.waitForFunction(({ pathname, count }) => (window.localhostDataLayer || [])
      .filter((item) => item.event === "page_view" && item.path === pathname).length > count,
    { pathname: destination, count: seenDestination });
    assert.equal(await isFocused(page.locator("main#main-content")), false);
    console.log(`PASS ${path}: dismissal, same-page selection, keyboard destination focus, history and pointer unchanged`);
  }
  await page.setViewportSize({ width: 1280, height: 800 });
  await visit(page, "/travelers");
  assert.equal(await page.locator(".mobile-menu").isVisible(), false);
  const desktop = page.getByRole("navigation", { name: "Primary navigation" });
  assert.equal(await desktop.isVisible(), true);
  assert.equal(await desktop.getByRole("link").count(), 5);
  console.log("PASS desktop support links are unchanged");

  for (const path of ["/travelers", "/inquiry", "/journeys"]) {
    await visit(page, path);
    for (const width of [390, 720, 721, 768, 820, 920, 921, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      const geometry = await page.locator(".site-footer").evaluate((footer) => {
        const visible = [...footer.querySelectorAll("a")].map((link) => link.getBoundingClientRect());
        const nav = footer.querySelector("nav").getBoundingClientRect();
        const action = footer.querySelector(".footer-actions").getBoundingClientRect();
        return {
          overflow: document.documentElement.scrollWidth > innerWidth,
          linksFit: visible.length > 0 && visible.every(({ left, right, width }) =>
            width > 0 && left >= 0 && right <= innerWidth + 1),
          overlap: nav.left < action.right && action.left < nav.right &&
            nav.top < action.bottom && action.top < nav.bottom
        };
      });
      assert.deepEqual(geometry, { overflow: false, linksFit: true, overlap: false }, `${path} at ${width}px`);
    }
    console.log(`PASS ${path}: footer navigation and contact fit phone, tablet, and desktop widths`);
  }
  await checkFirstReview(page, true);
  console.log("PASS inquiry sample: named section focused in a new tab, original inquiry draft intact");
  await ctx.close();

  const native = await context({ javaScriptEnabled: false });
  const nativePage = await native.newPage();
  const notFound = await nativePage.goto(new URL("/china/beijing", base).href);
  assert.equal(notFound.status(), 404);
  const recovery = nativePage.getByRole("main");
  assert.equal(await recovery.getByRole("heading", { level: 1 }).innerText(), "Page not found.");
  assert.equal(await nativePage.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await nativePage.locator(".skip-link").press("Enter");
  assert.equal(await recovery.evaluate((main) => document.activeElement === main), true);
  await nativePage.keyboard.press("Tab");
  const explore = recovery.getByRole("link", { name: "Explore China Routes" });
  assert.equal(await explore.evaluate((link) => document.activeElement === link), true);
  await nativePage.keyboard.press("Enter");
  await nativePage.waitForURL(new URL("/journeys", base).href);
  console.log("PASS missing route: keyboard recovery to the route index without JavaScript");
  await visit(nativePage, "/china#journeys");
  const chapterIndex = nativePage.locator("#china-places");
  assert.equal(await chapterIndex.locator("[data-china-place]").count(), 4);
  assert.equal(await chapterIndex.locator("#journeys").evaluate((target) => document.activeElement === target), true);
  await visit(nativePage, "/china");
  await nativePage.getByRole("link", { name: "Explore the places" }).press("Enter");
  await nativePage.waitForURL(new URL("/china#china-places", base).href);
  assert.equal(await chapterIndex.evaluate((section) => document.activeElement === section), true);
  console.log("PASS China bookmarks and current chapter link: native scroll and focus without JavaScript");
  await checkFirstReview(nativePage);
  console.log("PASS inquiry sample: named section focused in a new tab without JavaScript");
  for (const path of ["/", "/china/shanxi", "/china/shaolin", "/china/huizhou", "/china/shanghai"]) {
    await visit(nativePage, path);
    const fragment = path === "/" ? "shanxi-chapter" : "chapter-places";
    await nativePage.locator(`a[href="#${fragment}"]`).press("Enter");
    await nativePage.waitForURL(new URL(`${path}#${fragment}`, base).href);
    const target = nativePage.locator(`#${fragment}`);
    assert.equal(await target.evaluate((node) => document.activeElement === node), true, path);
    assert.equal(await target.getByRole("heading", { level: 2 }).getAttribute("id"),
      await target.getAttribute("aria-labelledby"), path);
    console.log(`PASS ${path}: discovery link focuses its named section without JavaScript`);
  }
  for (const path of ["/", "/china", "/journeys", "/china/shanxi", "/china/real-access", "/travelers", "/inquiry"]) {
    await visit(nativePage, path);
    await nativePage.keyboard.press("Tab");
    assert.equal(await nativePage.locator(".skip-link").evaluate((link) => document.activeElement === link), true, path);
    await nativePage.keyboard.press("Enter");
    await nativePage.waitForURL(new URL(`${path}#main-content`, base).href);
    assert.equal(await nativePage.locator("main#main-content").evaluate((main) => document.activeElement === main), true, path);
    await nativePage.keyboard.press("Tab");
    assert.equal(await nativePage.evaluate(() => Boolean(document.activeElement?.closest("main"))), true, path);
    console.log(`PASS ${path}: skip link focuses the main landmark without JavaScript`);
  }
  for (const { path, menu, onward, destination } of cases) {
    await visit(nativePage, path);
    await nativePage.locator(`${menu} summary`).press("Enter");
    assert.equal(await nativePage.locator(menu).evaluate((element) => element.open), true);
    await nativePage.locator(menu).getByRole("link", { name: onward, exact: true }).press("Enter");
    await nativePage.waitForURL(new URL(destination, base).href);
    console.log(`PASS ${path}: native menu and links without JavaScript`);
  }
} finally {
  await browser.close();
}
