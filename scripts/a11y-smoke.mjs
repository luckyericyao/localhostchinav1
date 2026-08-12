import { chromium } from "playwright-core";
import axe from "axe-core";

const { source: axeSource } = axe;

const baseUrl = (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
const executablePath =
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const routes = [
  "/",
  "/china",
  "/journeys",
  "/china/shanxi",
  "/china/shaolin",
  "/china/huizhou",
  "/china/shanghai",
  "/trust",
  "/inquiry"
];

let failed = false;
const browser = await chromium.launch({ executablePath, headless: true });
const page = await browser.newPage({
  deviceScaleFactor: 1,
  viewport: { height: 844, width: 390 }
});
await page.addInitScript(() => {
  window.__localhostA11yVitals = { cls: 0, events: [], lcp: 0 };

  if (typeof PerformanceObserver === "undefined") return;

  try {
    if (PerformanceObserver.supportedEntryTypes.includes("largest-contentful-paint")) {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window.__localhostA11yVitals.lcp = Math.max(
            window.__localhostA11yVitals.lcp,
            entry.startTime
          );
        }
      }).observe({ buffered: true, type: "largest-contentful-paint" });
    }

    if (PerformanceObserver.supportedEntryTypes.includes("layout-shift")) {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            window.__localhostA11yVitals.cls += entry.value || 0;
          }
        }
      }).observe({ buffered: true, type: "layout-shift" });
    }

    if (PerformanceObserver.supportedEntryTypes.includes("event")) {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.interactionId) {
            window.__localhostA11yVitals.events.push(entry.duration);
          }
        }
      }).observe({ buffered: true, type: "event", durationThreshold: 16 });
    }
  } catch {
    // Unsupported performance observers do not block the accessibility audit.
  }
});

for (const path of routes) {
  await page.goto(`${baseUrl}${path}`, { waitUntil: "networkidle" });
  await page.addScriptTag({ content: axeSource });

  const axeResults = await page.evaluate(() => window.axe.run(document));
  const audit = await page.evaluate(() => {
    const visiblePrimaryControls = [
      ...document.querySelectorAll("a.button, a.nav-cta, button, summary")
    ].filter((node) => {
      const box = node.getBoundingClientRect();
      return box.width > 0 && box.height > 0;
    });
    const smallControls = visiblePrimaryControls.filter((node) => {
      const box = node.getBoundingClientRect();
      return box.width < 44 || box.height < 44;
    });
    const ids = [...document.querySelectorAll("[id]")].map((node) => node.id);

    return {
      duplicateIds: ids.filter((id, index) => ids.indexOf(id) !== index),
      mainCount: document.querySelectorAll("main").length,
      mainId: document.querySelector("main")?.id || "",
      missingAlt: document.querySelectorAll("img:not([alt])").length,
      overflowX: document.documentElement.scrollWidth > window.innerWidth,
      smallControls: smallControls.map((node) =>
        (node.textContent || "").trim().replace(/\s+/g, " ").slice(0, 60)
      )
    };
  });

  const criticalViolations = axeResults.violations.filter(
    (violation) => violation.impact === "critical"
  );
  const axeSummary = axeResults.violations
    .map(
      (violation) =>
        `${violation.id}:${violation.impact}:${violation.nodes
          .map((node) => node.target.join(" "))
          .join(",")}`
    )
    .join("|");
  const problems = [
    ...criticalViolations.map((violation) => `axe:${violation.id}`),
    ...(audit.duplicateIds.length ? ["duplicate ids"] : []),
    ...(audit.mainCount !== 1 || audit.mainId !== "main-content"
      ? ["main landmark"]
      : []),
    ...(audit.missingAlt ? ["missing image alt"] : []),
    ...(audit.overflowX ? ["horizontal overflow"] : []),
    ...(audit.smallControls.length ? ["primary control below 44px"] : [])
  ];

  if (problems.length) {
    console.error(`FAIL ${path}: ${problems.join(", ")}`);
    failed = true;
  } else {
    console.log(
      `PASS ${path}: axe violations ${axeSummary || "0"}, critical 0, landmarks, alt text, and controls`
    );
  }

  if (path === "/") {
    await page.keyboard.press("Tab");
    const skipFocused = await page.evaluate(
      () => document.activeElement?.classList.contains("skip-link")
    );

    if (!skipFocused) {
      console.error("FAIL /: skip link is not first keyboard target");
      failed = true;
    } else {
      console.log("PASS /: skip link is first keyboard target");
    }

    const menuSummary = page.locator(".mobile-menu summary");
    const menuLabel = await menuSummary.getAttribute("aria-label");
    if (menuLabel !== "Toggle navigation") {
      console.error("FAIL /: mobile menu does not expose a state-safe label");
      failed = true;
    } else {
      console.log("PASS /: mobile menu has a state-safe label");
    }
    await menuSummary.click();
    const mobileMenuLinks = await page.locator(".mobile-menu-panel a").count();
    if (mobileMenuLinks !== 5) {
      console.error("FAIL /: mobile menu does not expose five primary links");
      failed = true;
    } else {
      console.log("PASS /: mobile menu exposes five primary links");
    }
    await menuSummary.click();
  }

  if (path === "/inquiry") {
    const inquiryLayout = await page.evaluate(() => {
      const desktopIntro = document.querySelector(".inquiry-copy-intro");
      const desktopAssuranceList = document.querySelector(
        ".intake-assurance ul"
      );
      const mobilePrivacy = document.querySelector(
        ".privacy-boundary--standalone"
      );
      const requiredIntake = [
        document.querySelector("#inquiry-name"),
        document.querySelector("#inquiry-email"),
        document.querySelector("#inquiry-short-note"),
        document.querySelector(".role-tabs"),
        document.querySelector(".localhost-intake-submit button[type='submit']")
      ];
      const requiredBottom = Math.max(
        ...requiredIntake.map((node) =>
          node ? node.getBoundingClientRect().bottom + window.scrollY : Infinity
        )
      );

      return {
        assuranceListStyle: desktopAssuranceList
          ? getComputedStyle(desktopAssuranceList).listStyleType
          : "missing",
        mobileIntroDisplay: desktopIntro
          ? getComputedStyle(desktopIntro).display
          : "missing",
        mobilePrivacyDisplay: mobilePrivacy
          ? getComputedStyle(mobilePrivacy).display
          : "missing",
        requiredBottom,
        requiredFieldsPresent: requiredIntake.every(Boolean),
        requiredWithinOneAndHalfScreens:
          requiredBottom <= window.innerHeight * 1.5
      };
    });

    if (
      inquiryLayout.mobileIntroDisplay !== "none" ||
      inquiryLayout.mobilePrivacyDisplay === "none" ||
      inquiryLayout.assuranceListStyle !== "none" ||
      !inquiryLayout.requiredFieldsPresent ||
      !inquiryLayout.requiredWithinOneAndHalfScreens
    ) {
      console.error(
        `FAIL /inquiry: mobile hierarchy or privacy styling regressed ${JSON.stringify(inquiryLayout)}`
      );
      failed = true;
    } else {
      console.log(
        "PASS /inquiry: required intake stays within 1.5 mobile screens and privacy guidance remains visible"
      );
    }

    await page
      .getByRole("button", { name: "Add route details — optional" })
      .click();
    const representationOptions = await page
      .locator('select[name="inquiryMadeBy"] option')
      .allTextContents();
    const delegatedInquiryLayout = await page.evaluate(() => ({
      principalFieldVisible: Boolean(
        document.querySelector('input[name="travelerOrPrincipal"]')?.offsetParent
      ),
      replyFieldVisible: Boolean(
        document.querySelector('select[name="preferredReply"]')?.offsetParent
      ),
      overflowX: document.documentElement.scrollWidth > window.innerWidth
    }));

    if (
      !representationOptions.includes("Executive or personal assistant") ||
      !representationOptions.includes("Family office") ||
      !delegatedInquiryLayout.principalFieldVisible ||
      !delegatedInquiryLayout.replyFieldVisible ||
      delegatedInquiryLayout.overflowX
    ) {
      console.error(
        `FAIL /inquiry: delegated inquiry path regressed ${JSON.stringify({ representationOptions, ...delegatedInquiryLayout })}`
      );
      failed = true;
    } else {
      console.log(
        "PASS /inquiry: delegated inquiry and reply-preference controls are usable on mobile"
      );
    }
  }

  if (path === "/journeys") {
    const mobileRouteDecision = await page.evaluate(() => {
      const cards = [...document.querySelectorAll(".journey-comparison-card")];
      const firstCard = cards[0]?.getBoundingClientRect();

      return {
        cardCount: cards.length,
        firstCardTop: firstCard?.top ?? Infinity,
        firstRouteVisible: Boolean(
          firstCard && firstCard.top < window.innerHeight && firstCard.bottom > 0
        )
      };
    });

    if (
      mobileRouteDecision.cardCount !== 4 ||
      !mobileRouteDecision.firstRouteVisible
    ) {
      console.error(
        `FAIL /journeys: mobile route decision starts too late ${JSON.stringify(mobileRouteDecision)}`
      );
      failed = true;
    } else {
      console.log(
        "PASS /journeys: the first active route enters the initial mobile viewport"
      );
    }
  }
}

const desktopRoutesPage = await browser.newPage({
  deviceScaleFactor: 1,
  viewport: { height: 900, width: 1440 }
});
await desktopRoutesPage.goto(`${baseUrl}/journeys`, { waitUntil: "networkidle" });
const desktopRouteDecision = await desktopRoutesPage.evaluate(() => {
  const cards = [...document.querySelectorAll(".journey-comparison-card")];
  const bounds = cards.map((card) => {
    const box = card.getBoundingClientRect();
    return { bottom: Math.round(box.bottom), top: Math.round(box.top) };
  });

  return {
    allRoutesInFirstViewport:
      cards.length === 4 &&
      bounds.every((box) => box.top >= 0 && box.bottom <= window.innerHeight),
    bounds,
    cardCount: cards.length
  };
});

if (!desktopRouteDecision.allRoutesInFirstViewport) {
  console.error(
    `FAIL /journeys: four active routes do not fit in the initial desktop viewport ${JSON.stringify(desktopRouteDecision)}`
  );
  failed = true;
} else {
  console.log(
    "PASS /journeys: all four active routes are comparable in the initial desktop viewport"
  );
}
await desktopRoutesPage.close();

await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
const vitals = await page.evaluate(() => {
  const measured = window.__localhostA11yVitals;
  const interactionDurations = measured.events;

  return {
    cls: Math.round(measured.cls * 10000) / 10000,
    inp: interactionDurations.length
      ? Math.round(Math.max(...interactionDurations))
      : null,
    lcp: measured.lcp ? Math.round(measured.lcp) : null
  };
});
console.log(`Homepage vitals: ${JSON.stringify(vitals)}`);

if (vitals.lcp === null) {
  console.warn("WARN /: LCP was not exposed by this headless browser run");
}

if (vitals.lcp !== null && vitals.lcp >= 2500) {
  console.error("FAIL /: LCP is at or above 2.5s");
  failed = true;
}
if (vitals.cls >= 0.1) {
  console.error("FAIL /: CLS is at or above 0.1");
  failed = true;
}
if (vitals.inp !== null && vitals.inp >= 200) {
  console.error("FAIL /: observed interaction latency is at or above 200ms");
  failed = true;
}

await browser.close();
if (failed) process.exitCode = 1;
