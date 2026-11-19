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
  await page.locator('button[type="submit"]').first().click();
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
    await page.locator('button[type="submit"]').last().click();
    await page.getByText("Synthetic inquiry received.", { exact: true }).waitFor();
    assert.equal(submissions.length, 1);
    assert.ok(Number.isFinite(submissions[0].formElapsedMs) && submissions[0].formElapsedMs >= 0);
    assert.equal(submissions[0].startedAt, undefined, "Do not send the browser's absolute clock");
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
    const note = page.locator("#inquiry-short-note");
    assert.equal(await note.inputValue(), "", "A new role must not inherit a traveler note");
    const roleNote = `PRIVATE ${role.toUpperCase()} APPLICATION`;
    await note.fill(roleNote);
    if (role === "host") {
      await page.locator('textarea[name="knowledgeAreas"]').fill("Timber architecture");
    } else {
      await page.locator('input[name="organization"]').fill("Synthetic partner");
    }
    await page.locator('button[type="submit"]').first().click();
    await page.getByText("Synthetic inquiry received.", { exact: true }).waitFor();
    assert.equal(submissions.length, 1);
    assert.equal(submissions[0].intentType, role);
    assert.equal(submissions[0].shortNote, roleNote);
    assert.equal(submissions[0].optionalDetails.foodPreferences, undefined);
    assert.equal(submissions[0].optionalDetails.sensitiveNotes, undefined);
    assert.equal(submissions[0].optionalDetails[role === "host" ? "knowledgeAreas" : "organization"],
      role === "host" ? "Timber architecture" : "Synthetic partner");
    await page.getByRole("button", { name: "Traveler", exact: true }).click();
    assert.equal(await note.inputValue(), "PRIVATE CONTENT INTENT");
    assert.equal(await page.locator('textarea[name="foodPreferences"]').inputValue(), food,
      "Switching roles must not erase cached text");
    assert.equal(await page.locator('textarea[name="sensitiveNotes"]').inputValue(), "PRIVATE TRAVELER CONSTRAINT");
    console.log(`PASS ${viewport.width}px ${role} handoff: hidden traveler details excluded, original text retained on return`);
  } finally {
    await context.close();
  }
}

async function roleDraftCase(viewport) {
  const { context, page, submissions } = await isolatedPage(viewport);
  try {
    const note = page.locator("#inquiry-short-note");
    const hostStyle = page.locator('input[name="hostStyle"]');
    const city = page.locator('input[name="cityRegion"]');
    const reply = page.locator('select[name="preferredReply"]');
    const representative = page.getByRole("checkbox", { name: "I am arranging this on behalf of a traveler" });
    const choose = (role) => page.getByRole("button", { name: role, exact: true }).click();
    await representative.check();
    await page.locator('input[name="travelerOrPrincipal"]').fill("PRIVATE PRINCIPAL FIXTURE");
    await page.getByRole("button", { name: "Add route details — optional" }).click();
    await hostStyle.fill("PRIVATE TRAVELER PREFERENCE");
    await reply.selectOption("Signal");

    await choose("Host");
    assert.equal(await note.inputValue(), "", "A traveler note must not become a host application");
    assert.equal(await hostStyle.inputValue(), "", "Identical field keys must not share role-specific text");
    await note.fill("PRIVATE HOST INTENT");
    await hostStyle.fill("PRIVATE HOST STYLE");
    await city.fill("PRIVATE HOST CITY");
    await choose("Partner");
    assert.equal(await note.inputValue(), "");
    assert.equal(await city.inputValue(), "");
    await note.fill("PRIVATE PARTNER INTENT");
    await city.fill("PRIVATE PARTNER CITY");
    await page.locator('input[name="organization"]').fill("PRIVATE PARTNER ORGANIZATION");

    await choose("Traveler");
    assert.equal(await note.inputValue(), "PRIVATE CONTENT INTENT");
    assert.equal(await hostStyle.inputValue(), "PRIVATE TRAVELER PREFERENCE");
    assert.equal(await representative.isChecked(), true);
    assert.equal(await page.locator('input[name="travelerOrPrincipal"]').inputValue(), "PRIVATE PRINCIPAL FIXTURE");
    assert.equal(await reply.inputValue(), "Signal");
    await page.locator('button[type="submit"]').first().click();
    await page.getByText("Synthetic inquiry received.", { exact: true }).waitFor();

    await choose("Host");
    assert.equal(await note.inputValue(), "PRIVATE HOST INTENT");
    assert.equal(await hostStyle.inputValue(), "PRIVATE HOST STYLE");
    assert.equal(await city.inputValue(), "PRIVATE HOST CITY");
    assert.equal(await reply.inputValue(), "Signal");
    await page.locator('button[type="submit"]').first().click();
    await page.getByText("Synthetic inquiry received.", { exact: true }).waitFor();

    await choose("Partner");
    assert.equal(await note.inputValue(), "PRIVATE PARTNER INTENT");
    assert.equal(await city.inputValue(), "PRIVATE PARTNER CITY");
    assert.equal(await reply.inputValue(), "Signal");
    await page.locator('button[type="submit"]').first().click();
    await page.getByText("Synthetic inquiry received.", { exact: true }).waitFor();

    assert.deepEqual(submissions.map(({ intentType, shortNote, optionalDetails }) => ({ intentType, shortNote, optionalDetails })), [
      { intentType: "traveler", shortNote: "PRIVATE CONTENT INTENT", optionalDetails: {
        inquiryMadeBy: "Trusted representative", travelerOrPrincipal: "PRIVATE PRINCIPAL FIXTURE",
        hostStyle: "PRIVATE TRAVELER PREFERENCE", preferredReply: "Signal"
      } },
      { intentType: "host", shortNote: "PRIVATE HOST INTENT", optionalDetails: {
        hostStyle: "PRIVATE HOST STYLE", cityRegion: "PRIVATE HOST CITY", preferredReply: "Signal"
      } },
      { intentType: "partner", shortNote: "PRIVATE PARTNER INTENT", optionalDetails: {
        cityRegion: "PRIVATE PARTNER CITY", organization: "PRIVATE PARTNER ORGANIZATION", preferredReply: "Signal"
      } }
    ]);
    assert.ok(submissions.every(({ name, email }) => name === "PRIVATE CONTENT TEST" && email === "private-content@example.test"));
    const storageAndTelemetry = await page.evaluate(() => JSON.stringify({ local: localStorage, session: sessionStorage, events: window.localhostDataLayer }));
    for (const fixture of ["PRIVATE PRINCIPAL FIXTURE", "PRIVATE TRAVELER PREFERENCE", "PRIVATE HOST INTENT", "PRIVATE HOST CITY", "PRIVATE PARTNER INTENT", "PRIVATE PARTNER ORGANIZATION"]) {
      assert.ok(!storageAndTelemetry.includes(fixture));
    }
    console.log(`PASS ${viewport.width}px role drafts: notes, overlapping fields and representation isolated; contact shared; exact payloads`);
  } finally {
    await context.close();
  }
}

try {
  for (const viewport of [{ width: 375, height: 812 }, { width: 390, height: 844 }, { width: 1280, height: 720 }]) {
    await boundaryCase(viewport);
    for (const role of ["host", "partner"]) await roleCase(viewport, role);
    await roleDraftCase(viewport);
  }
} finally {
  await browser.close();
}
