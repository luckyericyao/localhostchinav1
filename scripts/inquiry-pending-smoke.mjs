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

async function pendingCase(viewport, intentType, outcome, routeContext) {
  const context = await browser.newContext({ viewport });
  let release;
  const responseGate = new Promise((resolve) => { release = resolve; });
  const submissions = [];
  try {
    await context.addInitScript(() => { navigator.sendBeacon = () => true; });
    const page = await context.newPage();
    await page.route("**/api/analytics", (route) => route.fulfill({ status: 200, body: "{}" }));
    await page.route("**/_vercel/insights/**", (route) => route.fulfill({ status: 200, body: "" }));
    // Hold the response to test real pending UI, without contacting a provider.
    await page.route("**/inquiry**", async (route) => {
      if (route.request().method() !== "POST") return route.continue();
      assert.ok(route.request().headers()["next-action"]);
      const [payload] = JSON.parse(route.request().postData());
      submissions.push(payload);
      if (submissions.length === 1) await responseGate;
      if (submissions.length === 1 && outcome === "network-error") return route.abort("failed");
      let result;
      if (submissions.length === 1 && outcome === "rejection") {
        result = { ok: false, message: "Please wait before sending another inquiry." };
      } else {
        result = {
          ok: true, delivery: outcome === "mailto" ? "mailto" : "email",
          inquiryId: "LH-TEST-PENDING", responseWindow: "within two working days",
          message: outcome === "mailto" ? "We could not confirm direct receipt. Your email draft is ready." : "Synthetic inquiry received.",
          summary: {
            name: payload.name, email: payload.email, intentType: payload.intentType,
            routeContext, shortNote: payload.shortNote
          },
          ...(outcome === "mailto" ? {
            contactEmail: "owner@example.test",
            preparedEmail: { subject: "Pending-state test", body: payload.shortNote },
            mailtoHref: `mailto:owner@example.test?body=${encodeURIComponent(payload.shortNote)}`
          } : {})
        };
      }
      return route.fulfill({ status: 200, contentType: "text/x-component",
        body: `0:${JSON.stringify({ a: result, f: "" })}\n`
      });
    });

    const query = new URLSearchParams({ type: intentType });
    if (routeContext) query.set("route", routeContext);
    const response = await page.goto(`${baseUrl}/inquiry?${query}`, { waitUntil: "load" });
    assert.equal(response.status(), 200);
    await page.locator("#inquiry-name").fill("  PRIVATE PENDING TEST  ");
    await page.locator("#inquiry-email").fill("Private-Pending@Example.Test");
    await page.locator("#inquiry-short-note").fill("PRIVATE PENDING INTENT");
    if (intentType === "traveler") {
      await page.getByRole("checkbox", { name: "I am arranging this on behalf of a traveler" }).check();
      await page.locator('select[name="inquiryMadeBy"]').selectOption("Family office");
      await page.locator('input[name="travelerOrPrincipal"]').fill("PRIVATE PRINCIPAL REFERENCE");
    }
    await page.getByRole("button", { name: "Add route details — optional" }).click();
    const detailName = intentType === "traveler" ? "foodPreferences" : intentType === "host" ? "knowledgeAreas" : "organization";
    await page.locator(`[name="${detailName}"]`).fill("PRIVATE OPTIONAL CONTEXT");
    await page.locator('select[name="preferredReply"]').selectOption("Signal");
    await page.locator('input[name="replyDetails"]').fill("PRIVATE REPLY CONTEXT");

    await page.locator('button[type="submit"]').click();
    await page.waitForFunction(() => document.querySelector('button[type="submit"]')?.textContent === "Preparing...");
    const form = page.getByRole("form", { name: "Localhost private inquiry" });
    const editableWhilePending = await form.locator("input, textarea, select, button").evaluateAll((elements) =>
      elements.filter((element) => !element.disabled).map((element) => element.name || element.textContent)
    );
    assert.deepEqual(editableWhilePending, [], "Submission controls must not allow a different identity or draft while pending");
    assert.equal(await form.getAttribute("aria-busy"), "true");
    assert.equal(await page.locator("#inquiry-name").inputValue(), "  PRIVATE PENDING TEST  ");
    assert.equal(await page.locator("#inquiry-email").inputValue(), "Private-Pending@Example.Test");
    await page.addScriptTag({ content: axe.source });
    assert.deepEqual(await page.evaluate(async () =>
      (await window.axe.run(document)).violations.map(({ id, nodes }) => ({
        id, nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary }))
      }))
    ), []);

    release();
    await page.waitForFunction(() => document.querySelector('button[type="submit"]')?.textContent !== "Preparing...");
    assert.equal(submissions.length, 1);
    assert.equal(submissions[0].name, "PRIVATE PENDING TEST");
    assert.equal(submissions[0].email, "private-pending@example.test");
    assert.equal(submissions[0].intentType, intentType);
    assert.equal(submissions[0].routeContext, routeContext ?? "$undefined");
    assert.equal(submissions[0].optionalDetails[detailName], "PRIVATE OPTIONAL CONTEXT");
    assert.equal(submissions[0].optionalDetails.preferredReply, "Signal");
    assert.equal(await form.getAttribute("aria-busy"), "false");
    assert.equal(await page.locator("#inquiry-name").isDisabled(), false);
    assert.equal(await page.locator(`[name="${detailName}"]`).isDisabled(), false);
    assert.equal(await page.locator('input[name="replyDetails"]').inputValue(), "PRIVATE REPLY CONTEXT");

    if (outcome === "network-error" || outcome === "rejection") {
      const error = page.locator("#inquiry-error");
      await error.waitFor();
      assert.match(await error.innerText(), outcome === "network-error" ? /could not confirm receipt/ : /wait before sending/);
      await page.waitForFunction(() => document.activeElement?.id === "inquiry-error");
      assert.equal(await page.getByRole("region", { name: "Inquiry result" }).count(), 0);
      assert.equal(await page.locator('button[type="submit"]').isDisabled(), false);
      assert.equal(await page.locator("#inquiry-short-note").inputValue(), "PRIVATE PENDING INTENT");
      await page.locator('button[type="submit"]').click();
      await page.getByText("Synthetic inquiry received.", { exact: true }).waitFor();
      assert.equal(submissions.length, 2);
      for (const field of ["name", "email", "intentType", "shortNote", "optionalDetails", "routeContext"]) {
        assert.deepEqual(submissions[1][field], submissions[0][field], `Retry changed ${field}`);
      }
    }

    const receipt = page.getByRole("region", { name: "Inquiry result" });
    await receipt.waitFor();
    await page.waitForFunction(() => document.activeElement?.getAttribute("aria-label") === "Inquiry result");
    assert.ok((await receipt.innerText()).includes(`PRIVATE PENDING TEST / ${intentType.charAt(0).toUpperCase() + intentType.slice(1)} / private-pending@example.test`),
      "Receipt identity must use the normalized submitted summary, not current editable fields");
    if (routeContext) assert.ok((await receipt.innerText()).includes(" / Shanxi"));
    if (process.env.SCREENSHOT_DIR && intentType === "traveler" && outcome === "email" && !routeContext) {
      const directory = resolve(process.env.SCREENSHOT_DIR);
      await mkdir(directory, { recursive: true });
      await receipt.scrollIntoViewIfNeeded();
      await page.screenshot({ path: resolve(directory, `inquiry-receipt-${viewport.width}.png`) });
    }
    assert.equal(await page.locator('button[type="submit"]').isDisabled(), true);
    assert.equal(await page.locator("#inquiry-name").inputValue(), "  PRIVATE PENDING TEST  ");
    assert.equal(await page.locator(`[name="${detailName}"]`).inputValue(), "PRIVATE OPTIONAL CONTEXT");
    const events = await page.evaluate(() => window.localhostDataLayer || []);
    const telemetry = JSON.stringify(events);
    for (const value of ["PRIVATE PENDING TEST", "private-pending@example.test", "PRIVATE PENDING INTENT", "PRIVATE OPTIONAL CONTEXT", "PRIVATE REPLY CONTEXT"]) {
      assert.equal(telemetry.includes(value), false);
    }
    await page.locator("#inquiry-short-note").fill("Revised draft after receipt");
    assert.equal(await receipt.count(), 0);
    assert.equal(await page.locator('button[type="submit"]').isDisabled(), false,
      "Intentional new edits should remain possible after the previous response");
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false);
    console.log(`PASS ${viewport.width}px ${intentType} ${outcome}${routeContext ? ` ${routeContext}` : ""}: frozen pending controls, intact draft, accurate receipt${outcome === "network-error" || outcome === "rejection" ? ", intact retry" : ""}, axe 0`);
  } finally {
    release();
    await context.close();
  }
}

try {
  for (const viewport of [{ width: 390, height: 844 }, { width: 1280, height: 720 }]) {
    for (const intentType of ["traveler", "host", "partner"]) await pendingCase(viewport, intentType, "email");
    for (const outcome of ["mailto", "network-error", "rejection"]) await pendingCase(viewport, "traveler", outcome);
  }
  await pendingCase({ width: 390, height: 844 }, "traveler", "email", "shanxi");
} finally {
  await browser.close();
}
