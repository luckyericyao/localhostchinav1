import assert from "node:assert/strict";
import { chromium } from "playwright-core";
import axe from "axe-core";

const baseUrl = process.env.SITE_URL || "http://127.0.0.1:3118";
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true
});

async function checkBeforeHydration(javaScriptEnabled) {
  const url = new URL("/inquiry?route=shanxi&type=traveler", baseUrl);
  const context = await browser.newContext({
    javaScriptEnabled,
    serviceWorkers: "block",
    viewport: { width: 390, height: 844 }
  });
  let releaseScripts;
  let opening = true;
  const scriptsReady = new Promise((resolve) => { releaseScripts = resolve; });
  const unexpectedRequests = [];
  try {
    await context.route("**/*", async (route) => {
      const request = route.request();
      const target = new URL(request.url());
      if (target.origin !== url.origin) return route.abort();
      if (target.pathname === "/api/analytics" || target.pathname.startsWith("/_vercel/")) {
        return route.fulfill({ status: 200, body: "{}" });
      }
      if (request.isNavigationRequest() || request.method() !== "GET") {
        if (opening && request.method() === "GET" && target.href === url.href) {
          opening = false;
        } else {
          unexpectedRequests.push(request.method());
          return route.abort();
        }
      }
      if (request.resourceType() === "script") await scriptsReady;
      return route.continue();
    });

    const page = await context.newPage();
    assert.equal((await page.goto(url.href, { waitUntil: "commit" })).status(), 200);
    const form = page.locator("main form");
    const submit = form.locator('button[type="submit"]');
    await form.waitFor();
    assert.equal(await form.evaluate((element) => element.inert), true);
    assert.equal(await form.getAttribute("method"), "post", "Never serialize a native form into a URL");
    assert.equal(await submit.isDisabled(), true);
    await submit.scrollIntoViewIfNeeded();
    const button = await submit.boundingBox();
    assert.ok(button);
    await page.mouse.click(button.x + button.width / 2, button.y + button.height / 2);
    await page.keyboard.press("Enter");
    assert.deepEqual(unexpectedRequests, []);
    assert.equal(page.url(), url.href);

    const contact = page.getByRole("link", { name: "write to Localhost directly" });
    if (javaScriptEnabled) {
      assert.equal(await contact.isVisible(), false);
      releaseScripts();
      await page.waitForFunction(() => {
        const intake = document.querySelector("main form");
        return intake && !intake.inert && !intake.querySelector('button[type="submit"]').disabled;
      });
      assert.equal(await page.locator("#inquiry-email").isEditable(), true);
      console.log("PASS delayed scripts: form starts inert, then enables without navigation");
    } else {
      assert.equal(await contact.isVisible(), true);
      assert.match(await contact.getAttribute("href"), /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/);
      console.log("PASS no JavaScript: no native submission, direct email contact available");
    }
  } finally {
    releaseScripts();
    await context.close();
  }
}

try {
  await checkBeforeHydration(false);
  await checkBeforeHydration(true);
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 375, height: 812 },
    { width: 1280, height: 720 },
    { width: 1440, height: 900 }
  ]) {
    const page = await browser.newPage({ viewport });
    // Audit interactions must not inflate the real inquiry funnel.
    await page.route("**/api/analytics", (route) =>
      route.fulfill({ status: 200, body: "{}" })
    );
    await page.route("**/_vercel/insights/**", (route) =>
      route.fulfill({ status: 200, body: "" })
    );

    for (const path of ["/inquiry", "/inquiry?route=shanxi&type=traveler"]) {
      const response = await page.goto(`${baseUrl}${path}`, { waitUntil: "load" });
      assert.equal(response.status(), 200, path);
      await page.locator("#inquiry-name").waitFor();
      await page.evaluate(() => document.fonts.ready);
      const layout = await page.evaluate(() => ({
        submitBottom: document.querySelector("button[type=submit]")
          .getBoundingClientRect().bottom + window.scrollY,
        limit: window.innerHeight * 1.5,
        overflow: document.documentElement.scrollWidth > window.innerWidth,
        representativeTarget: document.querySelector(".representative-toggle")
          .getBoundingClientRect().height
      }));
      assert.equal(layout.overflow, false, `${path}: horizontal overflow`);
      assert.ok(layout.representativeTarget >= 44, "Representative target below 44px");
      assert.ok(layout.submitBottom <= layout.limit,
        `${path} at ${viewport.width}px: submit ${layout.submitBottom} > ${layout.limit}`);
      const privacy = page.locator(".privacy-boundary--standalone");
      assert.equal(await privacy.isVisible(), true, "Privacy reminder hidden");
      assert.equal(await page.locator(".privacy-boundary").count(), 1, "Duplicate privacy reminders");

      const representative = page.getByRole("checkbox", {
        name: "I am arranging this on behalf of a traveler"
      });
      await representative.focus();
      await page.keyboard.press("Space");
      assert.equal(await representative.isChecked(), true);
      await page.locator('select[name="inquiryMadeBy"]').selectOption("Family office");
      await page.getByRole("button", { name: "Add route details — optional" }).click();
      assert.equal(await page.locator('select[name="inquiryMadeBy"]').count(), 1);
      assert.equal(await page.locator('input[name="travelerOrPrincipal"]').count(), 1);
      const submitButtons = page.locator('button[type="submit"]');
      assert.equal(await submitButtons.count(), 2, "One short-review action and one detail-review action");
      await submitButtons.first().focus();
      await page.keyboard.press("Tab");
      assert.equal(await page.getByRole("button", { name: "Hide route details" })
        .evaluate((element) => document.activeElement === element), true,
      "Short-review action must precede optional details in keyboard order");
      await page.locator('input[name="replyDetails"]').focus();
      await page.keyboard.press("Tab");
      assert.equal(await submitButtons.last().evaluate((element) => document.activeElement === element), true,
        "Last optional field must lead to the adjacent submit action");
      assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), "auto",
        "Keyboard focus in the inquiry must not start a smooth scroll");
      await page.waitForFunction(() => {
        const rect = document.activeElement.getBoundingClientRect();
        return rect.top >= -1 && rect.bottom <= window.innerHeight + 1;
      }, undefined, { timeout: 1500 });
      assert.ok(await submitButtons.last().evaluate((element) => element.getBoundingClientRect().height >= 44));
      assert.ok((await page.locator('select[name="routeInterest"]').innerText()).includes("Beijing — future route"));
      await page.addScriptTag({ content: axe.source });
      const violations = await page.evaluate(async () =>
        (await window.axe.run(document)).violations.map(({ id, impact, nodes }) => ({
          id, impact, nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary }))
        }))
      );
      assert.deepEqual(violations, [], `${path}: expanded form accessibility`);
      await representative.uncheck();
      assert.equal(await page.locator('select[name="inquiryMadeBy"]').inputValue(), "");
      console.log(`PASS ${viewport.width}px ${path}: submit ${Math.round(layout.submitBottom)}px, keyboard, single representative fields, axe 0`);
    }
    await page.close();
  }
} finally {
  await browser.close();
}
