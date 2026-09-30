import assert from "node:assert/strict";
import { chromium } from "playwright-core";
import axe from "axe-core";

const baseUrl = process.env.SITE_URL || "http://127.0.0.1:3118";
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true
});

try {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 375, height: 812 },
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
      if (viewport.width < 720) {
        assert.ok(layout.submitBottom <= layout.limit,
          `${path} at ${viewport.width}px: submit ${layout.submitBottom} > ${layout.limit}`);
      }

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
