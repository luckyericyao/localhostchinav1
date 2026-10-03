import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright-core";
import axe from "axe-core";

const baseUrl = process.env.SITE_URL || "http://127.0.0.1:3118";
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true
});

async function isolateBeacons(context) {
  // Unload beacons can outlive page-level request interception.
  await context.addInitScript(() => {
    window.__recoveryBeacons = [];
    navigator.sendBeacon = (_url, data) => {
      window.__recoveryBeacons.push(data);
      return true;
    };
  });
}

async function recoveryCase(viewport, clipboardAvailable, intentType) {
  const context = await browser.newContext({ viewport });
  try {
    await isolateBeacons(context);
    const page = await context.newPage();
    const metrics = [];
    let submissionCount = 0;
    let draft;
    await page.addInitScript((available) => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: { writeText: async (text) => {
          if (!available) throw new Error("Clipboard unavailable in test");
          window.__recoveryClipboard = text;
        } }
      });
    }, clipboardAvailable);
    await page.route("**/api/analytics", (route) => {
      metrics.push(route.request().postDataJSON());
      return route.fulfill({ status: 200, body: "{}" });
    });
    await page.route("**/_vercel/insights/**", (route) =>
      route.fulfill({ status: 200, body: "" })
    );
    // Every POST is answered here; no server action or provider is called.
    await page.route("**/inquiry**", async (route) => {
      if (route.request().method() !== "POST") return route.continue();
      submissionCount += 1;
      assert.ok(route.request().headers()["next-action"], "Expected a server action request");
      const [payload] = JSON.parse(route.request().postData());
      assert.equal(payload.intentType, intentType);
      draft = {
        subject: "Localhost inquiry - LH-TEST-RECOVERY",
        body: [
          `Name: ${payload.name}`, `Reply email: ${payload.email}`,
          `Role: ${payload.intentType}`, `Intent: ${payload.shortNote}`,
          ...Object.entries(payload.optionalDetails).map(([key, value]) => `${key}: ${value}`),
          "Long inquiry context: ".repeat(1600), "LAST DETAIL RETAINED"
        ].join("\n")
      };
      const result = {
        ok: true, delivery: "mailto", inquiryId: "LH-TEST-RECOVERY",
        message: "We could not confirm direct receipt. Your email draft is ready; send it so we can review fit, route direction, and host availability.",
        contactEmail: "owner@example.test", preparedEmail: draft,
        responseWindow: "within two working days",
        mailtoHref: `mailto:owner@example.test?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`
      };
      // Match the installed Next.js server-action response envelope.
      return route.fulfill({
        status: 200, contentType: "text/x-component",
        body: `0:${JSON.stringify({ a: result, f: "" })}\n`
      });
    });

    const response = await page.goto(`${baseUrl}/inquiry?type=${intentType}`, { waitUntil: "load" });
    assert.equal(response.status(), 200);
    await page.locator("#inquiry-name").fill("PRIVATE RECOVERY TEST NAME");
    await page.locator("#inquiry-email").fill("private-recovery@example.test");
    await page.locator("#inquiry-short-note").fill("PRIVATE RECOVERY TEST INTENT");
    if (intentType === "traveler") {
      await page.getByRole("checkbox", { name: "I am arranging this on behalf of a traveler" }).check();
      await page.locator('select[name="inquiryMadeBy"]').selectOption("Family office");
      await page.locator('input[name="travelerOrPrincipal"]').fill("PRIVATE PRINCIPAL REFERENCE");
    }
    await page.locator('button[type="submit"]').click();
    const status = page.getByRole("region", { name: "Inquiry result" });
    await status.getByText(/could not confirm direct receipt/).waitFor();
    assert.equal(submissionCount, 1);
    assert.equal(await status.evaluate((element) => document.activeElement === element), true);
    assert.equal(await page.locator('button[type="submit"]').innerText(), "Email ready to send");
    const emailLink = status.getByRole("link", { name: "Open prepared email" });
    const url = new URL(await emailLink.getAttribute("href"));
    assert.equal(url.searchParams.get("body"), draft.body);
    assert.ok(url.href.length > 30000, "Fixture must exercise a long email link");
    assert.equal(await page.locator("#inquiry-name").inputValue(), "PRIVATE RECOVERY TEST NAME");
    assert.equal(await page.locator("#inquiry-short-note").inputValue(), "PRIVATE RECOVERY TEST INTENT");

    if (process.env.SCREENSHOT_DIR && clipboardAvailable && intentType === "traveler") {
      const directory = resolve(process.env.SCREENSHOT_DIR);
      await mkdir(directory, { recursive: true });
      await status.scrollIntoViewIfNeeded();
      await page.screenshot({ path: resolve(directory, `inquiry-recovery-${viewport.width}.png`) });
    }

    await status.getByRole("button", { name: "Copy inquiry" }).click();
    const expected = `Subject: ${draft.subject}\n\n${draft.body}`;
    if (clipboardAvailable) {
      await status.getByText("Inquiry copied. Copying does not send the email.", { exact: true }).waitFor();
      assert.equal(await page.evaluate(() => window.__recoveryClipboard), expected);
      await status.locator("summary").focus();
      await page.keyboard.press("Enter");
    } else {
      await status.getByText(/Automatic copying is unavailable/).waitFor();
    }
    const preview = status.getByRole("textbox", { name: "Prepared email" });
    assert.equal(await preview.inputValue(), expected);
    assert.equal(await preview.getAttribute("readonly"), "");
    if (!clipboardAvailable) {
      const selection = await preview.evaluate((element) => ({
        focused: document.activeElement === element,
        start: element.selectionStart, end: element.selectionEnd
      }));
      assert.deepEqual(selection, { focused: true, start: 0, end: expected.length });
    }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false);
    assert.ok(await status.locator("summary").evaluate((element) => element.getBoundingClientRect().height) >= 44);
    await page.addScriptTag({ content: axe.source });
    assert.deepEqual(await page.evaluate(async () =>
      (await window.axe.run(document)).violations.map(({ id, impact, nodes }) => ({
        id, impact, nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary }))
      }))
    ), []);
    const events = await page.evaluate(() => window.localhostDataLayer || []);
    assert.ok(events.some(({ event }) => event === "mailto_fallback"));
    assert.equal(events.some(({ event }) => event === "inquiry_sent"), false);
    const beacons = await page.evaluate(async () => Promise.all(
      window.__recoveryBeacons.map((data) => data instanceof Blob ? data.text() : String(data))
    ));
    const telemetry = JSON.stringify([events, metrics, beacons]);
    for (const text of ["PRIVATE RECOVERY TEST NAME", "private-recovery@example.test", "PRIVATE RECOVERY TEST INTENT", "LAST DETAIL RETAINED"]) {
      assert.equal(telemetry.includes(text), false);
    }
    console.log(`PASS ${viewport.width}px ${intentType}: unsent recovery, full long draft, ${clipboardAvailable ? "copy" : "manual selection"}, keyboard, axe 0, no private analytics`);
  } finally {
    await context.close();
  }
}

async function receivedCase() {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  try {
    await isolateBeacons(context);
    const page = await context.newPage();
    await page.route("**/api/analytics", (route) => route.fulfill({ status: 200, body: "{}" }));
    await page.route("**/_vercel/insights/**", (route) => route.fulfill({ status: 200, body: "" }));
    await page.route("**/inquiry**", (route) => {
      if (route.request().method() !== "POST") return route.continue();
      const result = { ok: true, delivery: "email", inquiryId: "LH-TEST-RECEIVED", responseWindow: "within two working days", message: "Thank you, Synthetic Receipt Test. Your private route review has been received. Reference LH-TEST-RECEIVED. A named Localhost reviewer will review fit, timing, and local feasibility before replying." };
      return route.fulfill({ status: 200, contentType: "text/x-component", body: `0:${JSON.stringify({ a: result, f: "" })}\n` });
    });
    await page.goto(`${baseUrl}/inquiry`, { waitUntil: "load" });
    await page.locator("#inquiry-name").fill("Synthetic Receipt Test");
    await page.locator("#inquiry-email").fill("receipt@example.test");
    await page.locator("#inquiry-short-note").fill("Synthetic route context");
    await page.locator('button[type="submit"]').click();
    await page.getByText(/Your private route review has been received\. Reference LH-TEST-RECEIVED/).waitFor();
    assert.equal(await page.getByRole("button", { name: "Copy inquiry" }).count(), 0);
    assert.equal(await page.locator('button[type="submit"]').innerText(), "Inquiry received");
    await page.addScriptTag({ content: axe.source });
    assert.deepEqual(await page.evaluate(async () =>
      (await window.axe.run(document)).violations.map(({ id, nodes }) => ({
        id, nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary }))
      }))
    ), []);
    console.log("PASS simulated receipt: no manual recovery or false-unsent status, axe 0");
  } finally {
    await context.close();
  }
}

try {
  for (const viewport of [{ width: 390, height: 844 }, { width: 1280, height: 720 }]) {
    for (const intentType of ["traveler", "host", "partner"]) {
      for (const clipboardAvailable of [true, false]) {
        await recoveryCase(viewport, clipboardAvailable, intentType);
      }
    }
  }
  await receivedCase();
} finally {
  await browser.close();
}
