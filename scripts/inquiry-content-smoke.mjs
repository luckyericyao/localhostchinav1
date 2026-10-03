import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright-core";
import axe from "axe-core";

const baseUrl = process.env.SITE_URL || "http://127.0.0.1:3118";
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true
});

async function isolatedPage(viewport) {
  const context = await browser.newContext({ viewport });
  await context.addInitScript(() => { navigator.sendBeacon = () => true; });
  const page = await context.newPage();
  const submissions = [];
  await page.route("**/api/analytics", (route) => route.fulfill({ status: 200, body: "{}" }));
  await page.route("**/_vercel/insights/**", (route) => route.fulfill({ status: 200, body: "" }));
  await page.route("**/inquiry**", (route) => {
    if (route.request().method() !== "POST") return route.continue();
    assert.ok(route.request().headers()["next-action"]);
    submissions.push(JSON.parse(route.request().postData())[0]);
    return route.fulfill({ status: 200, contentType: "text/x-component",
      body: `0:${JSON.stringify({ a: { ok: true, delivery: "email", inquiryId: "LH-TEST-CONTENT", message: "Synthetic inquiry received." }, f: "" })}\n`
    });
  });
  const response = await page.goto(`${baseUrl}/inquiry`, { waitUntil: "load" });
  assert.equal(response.status(), 200);
  await page.locator("#inquiry-name").fill("PRIVATE CONTENT TEST");
  await page.locator("#inquiry-email").fill("private-content@example.test");
  await page.locator("#inquiry-short-note").fill("PRIVATE CONTENT INTENT");
  return { context, page, submissions };
}

async function expectFieldError(page, field, value, message) {
  await page.locator('button[type="submit"]').click();
  await page.getByRole("alert").filter({ hasText: message }).waitFor();
  assert.equal(await field.inputValue(), value, "Original text was shortened");
  assert.equal(await field.getAttribute("aria-invalid"), "true");
  await page.waitForFunction((name) => document.activeElement?.getAttribute("name") === name,
    await field.getAttribute("name"), { timeout: 1500 });
  assert.equal(await field.evaluate((element) => document.activeElement === element), true);
  assert.equal(await field.evaluate((element) => element.parentElement.contains(document.getElementById("inquiry-error"))), true,
    "Error must appear next to the field");
  assert.equal(await page.locator("#inquiry-error").count(), 1);
}

async function boundaryCase(viewport) {
  const { context, page, submissions } = await isolatedPage(viewport);
  try {
    const note = page.locator("#inquiry-short-note");
    const longNote = "I would like timber temples, regional food, and time to ask questions. ".repeat(18);
    assert.ok(longNote.trim().length > 1200);
    await note.fill(longNote);
    await expectFieldError(page, note, longNote, "1,200 characters");
    assert.equal(submissions.length, 0);
    if (process.env.SCREENSHOT_DIR) {
      const directory = resolve(process.env.SCREENSHOT_DIR);
      await mkdir(directory, { recursive: true });
      await page.locator("#inquiry-error").scrollIntoViewIfNeeded();
      await page.screenshot({ path: resolve(directory, `inquiry-validation-${viewport.width}.png`) });
    }
    const exactNote = "N".repeat(1199) + "Z";
    await note.fill(exactNote);
    const name = page.locator("#inquiry-name");
    const longName = "N".repeat(121);
    await name.fill(longName);
    await expectFieldError(page, name, longName, "120 characters");
    assert.equal(submissions.length, 0);
    await name.fill("PRIVATE CONTENT TEST");
    const email = page.locator("#inquiry-email");
    const longEmail = `${"e".repeat(242)}@example.test`;
    assert.equal(longEmail.length, 255);
    await email.fill(longEmail);
    await expectFieldError(page, email, longEmail, "254 characters");
    assert.equal(submissions.length, 0);
    await email.fill("private-content@example.test");

    await page.getByRole("button", { name: "Add route details — optional" }).click();
    const food = page.locator('textarea[name="foodPreferences"]');
    const longFood = "D".repeat(801);
    await food.fill(longFood);
    await page.getByRole("button", { name: "Hide route details" }).click();
    await expectFieldError(page, food, longFood, "800 characters");
    assert.equal(submissions.length, 0);
    assert.equal(await page.getByRole("button", { name: "Hide route details" }).getAttribute("aria-expanded"), "true");
    await page.getByRole("button", { name: "Hide route details" }).click();
    assert.equal(await page.locator("#inquiry-error").isVisible(), true, "Folded error must remain visible");
    assert.equal(await page.locator("#inquiry-error").count(), 1);
    await expectFieldError(page, food, longFood, "800 characters");
    assert.equal(submissions.length, 0);
    await page.addScriptTag({ content: axe.source });
    assert.deepEqual(await page.evaluate(async () =>
      (await window.axe.run(document)).violations.map(({ id, nodes }) => ({
        id, nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary }))
      }))
    ), []);
    const exactFood = "D".repeat(799) + "Z";
    await food.fill(exactFood);
    assert.equal(await page.locator("#inquiry-error").count(), 0);
    assert.equal(await food.getAttribute("aria-invalid"), "false");
    await page.locator('button[type="submit"]').click();
    await page.getByText("Synthetic inquiry received.", { exact: true }).waitFor();
    assert.equal(submissions.length, 1);
    assert.equal(submissions[0].shortNote, exactNote);
    assert.equal(submissions[0].optionalDetails.foodPreferences, exactFood);
    const events = await page.evaluate(() => window.localhostDataLayer || []);
    assert.equal(JSON.stringify(events).includes("PRIVATE CONTENT TEST"), false);
    assert.equal(JSON.stringify(events).includes("private-content@example.test"), false);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false);
    console.log(`PASS ${viewport.width}px content limits: original text, inline errors, focus, folded-detail recovery, exact-limit payload, axe 0`);
  } finally {
    await context.close();
  }
}

async function roleCase(viewport, role) {
  const { context, page, submissions } = await isolatedPage(viewport);
  try {
    await page.getByRole("button", { name: "Add route details — optional" }).click();
    const food = "PRIVATE TRAVELER FOOD " + "D".repeat(801);
    await page.locator('textarea[name="foodPreferences"]').fill(food);
    await page.locator('textarea[name="sensitiveNotes"]').fill("PRIVATE TRAVELER CONSTRAINT");
    await page.getByRole("button", { name: role === "host" ? "Host" : "Partner", exact: true }).click();
    if (role === "host") {
      await page.locator('textarea[name="knowledgeAreas"]').fill("Timber architecture");
    } else {
      await page.locator('input[name="organization"]').fill("Synthetic partner");
    }
    await page.locator('button[type="submit"]').click();
    await page.getByText("Synthetic inquiry received.", { exact: true }).waitFor();
    assert.equal(submissions.length, 1);
    assert.equal(submissions[0].intentType, role);
    assert.equal(submissions[0].optionalDetails.foodPreferences, undefined);
    assert.equal(submissions[0].optionalDetails.sensitiveNotes, undefined);
    assert.equal(submissions[0].optionalDetails[role === "host" ? "knowledgeAreas" : "organization"],
      role === "host" ? "Timber architecture" : "Synthetic partner");
    await page.getByRole("button", { name: "Traveler", exact: true }).click();
    assert.equal(await page.locator('textarea[name="foodPreferences"]').inputValue(), food,
      "Switching roles must not erase cached text");
    assert.equal(await page.locator('textarea[name="sensitiveNotes"]').inputValue(), "PRIVATE TRAVELER CONSTRAINT");
    console.log(`PASS ${viewport.width}px ${role} handoff: hidden traveler details excluded, original text retained on return`);
  } finally {
    await context.close();
  }
}

try {
  for (const viewport of [{ width: 375, height: 812 }, { width: 390, height: 844 }, { width: 1280, height: 720 }]) {
    await boundaryCase(viewport);
    for (const role of ["host", "partner"]) await roleCase(viewport, role);
  }
} finally {
  await browser.close();
}
