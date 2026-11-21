const baseUrl = (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");

const routes = [
  "/",
  "/china",
  "/journeys",
  "/china/shanxi",
  "/china/shaolin",
  "/china/huizhou",
  "/china/shanghai",
  "/china/real-access",
  "/china/local-hosts",
  "/china/private-routes",
  "/china/seamless-logistics",
  "/travelers",
  "/hosts",
  "/host-credits",
  "/about",
  "/how-it-works",
  "/trust",
  "/inquiry"
];

const expectedContent = new Map([
  ["/", ["China.", "Explore the chapters", "Stone, timber, and the roads between.", "Begin a conversation"]],
  ["/china", ["Four local perspectives.", "Place before plans", "Compare the four routes"]],
  ["/china/shanxi", ["Flagship China Route", "Shanxi In Detail", "Follow stone and timber"]],
  ["/china/shaolin", ["Around Shaolin", "Training visits require permission"]],
  ["/china/huizhou", ["Village &amp; Mountain", "with Huangshan added when weather and route length allow"]],
  ["/china/shanghai", ["The Bund, dinner, after dark.", "Entry and availability are checked"]],
  ["/china/real-access", ["Permission before access", "A visit depends on invitation, permission"]],
  ["/travelers", ["The parts of a private route.", "A clear route, a considered host, practical support."]],
  ["/about", ["What Localhost does.", "Your Point of Contact", "Eric Yao"]],
  [
    "/journeys",
    [
      "Four routes into China.",
      "View Shanxi",
      "View Shaolin",
      "View Huizhou",
      "View Shanghai"
    ]
  ],
  [
    "/trust",
    [
      "Assistants, family offices, family members, and trusted advisers",
      "Do not add Pingyao unless the route gains a sixth day.",
      "We aim to reply",
      "after receiving your inquiry.",
      "not a client testimonial"
    ]
  ],
  [
    "/inquiry",
    [
      "directly or through someone you trust",
      "We aim to reply",
      "after receiving your inquiry.",
      "See an illustrative first review"
    ]
  ]
]);

const expectedTracking = new Map([
  ["/", ['data-track-event="route_select"', 'data-track-event="request_route"']],
  ["/china", ['data-track-event="route_select"', 'data-track-event="request_route"']],
  ["/journeys", ['data-track-event="route_select"', 'data-track-event="request_route"']],
  ["/travelers", ['data-track-event="request_route"']],
  ["/trust", ['data-track-event="request_route"']],
  ["/inquiry", ['data-track-event="review_sample"']],
  ["/how-it-works", ['data-track-event="request_route"']]
]);

const expectedShareImages = new Map([
  ["/", "/images/temple-of-heaven-centered-hero.png"],
  ["/china", "/images/china-ancient-landscape.png"],
  ["/journeys", "/images/real-ancient-china-hero.png"],
  ["/china/shanxi", "/images/shanxi-ancient-grotto.png"],
  ["/china/shaolin", "/images/shaolin-temple-gate.png"],
  ["/china/huizhou", "/images/huizhou-rain-courtyard.png"],
  ["/china/shanghai", "/images/shanghai-bund-walk.png"],
  ["/trust", "/images/trust-courtyard-wall.png"],
  ["/inquiry", "/images/inquiry-courtyard-threshold.png"]
]);

const productionUrl = "https://localhostglobal.vercel.app";

const activeRoutePaths = new Set([
  "/china/shanxi", "/china/shaolin", "/china/huizhou", "/china/shanghai"
]);

const retiredEditorialCopy = [
  "Visual Entry",
  "different visual temperature",
  "The page should let",
  "The visual language should",
  "visible cultural texture",
  "Practice culture is shown",
  "Training is presented",
  "Shanxi should feel",
  "Shaolin should read",
  "Huizhou should feel",
  "Shanghai should not read",
  "Localhost should feel thoughtful",
  "A few words repeat across the site"
];

const retiredRouteHeadings = [
  "Choose Another Route If",
  "Compact entry points, held with context.",
  "Local judgment changes what the traveler can read.",
  "Route Variants",
  "Different ways into the same chapter."
];

let failed = false;

for (const path of routes) {
  const response = await fetch(`${baseUrl}${path}`);
  const body = await response.text();
  const expected = expectedContent.get(path) || [];

  if (!response.ok) {
    console.error(`FAIL ${path}: HTTP ${response.status}`);
    failed = true;
    continue;
  }

  if ((path === "/trust" || path === "/inquiry") && body.includes("usually replies")) {
    console.error(`FAIL ${path}: a reply target must not be described as observed performance`);
    failed = true;
  }

  for (const marker of expected) {
    if (!body.includes(marker)) {
      console.error(`FAIL ${path}: missing expected content: ${marker}`);
      failed = true;
    }
  }

  for (const marker of retiredEditorialCopy) {
    if (body.includes(marker)) {
      console.error(`FAIL ${path}: internal editorial direction remains: ${marker}`);
      failed = true;
    }
  }

  for (const marker of expectedTracking.get(path) || []) {
    if (!body.includes(marker)) {
      console.error(`FAIL ${path}: missing tracking marker: ${marker}`);
      failed = true;
    }
  }

  const shareImage = expectedShareImages.get(path);
  if (shareImage) {
    const canonicalHref =
      path === "/" ? productionUrl : `${productionUrl}${path}`;
    if (
      !body.includes(
        `property="og:image" content="${productionUrl}${shareImage}"`
      )
    ) {
      console.error(`FAIL ${path}: missing page-specific Open Graph image`);
      failed = true;
    }
    if (!body.includes(`rel="canonical" href="${canonicalHref}"`)) {
      console.error(`FAIL ${path}: missing canonical URL`);
      failed = true;
    }
    if (!body.includes('name="twitter:card" content="summary_large_image"')) {
      console.error(`FAIL ${path}: missing large Twitter share card`);
      failed = true;
    }
  }

  if (activeRoutePaths.has(path) && !body.includes("data-route-page")) {
    console.error(`FAIL ${path}: missing route page marker`);
    failed = true;
    continue;
  }

  if (
    path === "/inquiry" &&
    (!body.includes('id="inquiry-name"') ||
      !body.includes('name="name"') ||
      !body.includes('data-representation-options="optional"') ||
      !body.includes('data-reply-preference="optional"'))
  ) {
    console.error("FAIL /inquiry: identity or reply-preference fields are missing");
    failed = true;
  }

  if (activeRoutePaths.has(path)) {
    for (const retiredHeading of retiredRouteHeadings) {
      if (body.includes(retiredHeading)) {
        console.error(
          `FAIL ${path}: retired repetitive route heading remains: ${retiredHeading}`
        );
        failed = true;
      }
    }

    const requiredRouteSections = [
      "The shape, the trade-offs, and who it suits.",
      "The Route Can Lean Toward",
      "Example Rhythm",
      "Host &amp; Support"
    ];

    for (const section of requiredRouteSections) {
      if (!body.includes(section)) {
        console.error(`FAIL ${path}: missing compact route section: ${section}`);
        failed = true;
      }
    }

    if (!body.includes('data-track-source="route_final"')) {
      console.error(`FAIL ${path}: missing end-of-chapter inquiry path`);
      failed = true;
    }
  }

  console.log(`PASS ${path} (${body.length} bytes)`);
}

for (const path of ["/china/beijing", "/page-not-found-check"]) {
  const response = await fetch(`${baseUrl}${path}`, { redirect: "manual" });
  const html = await response.text();
  if (response.status !== 404 || !html.includes("Page not found.") ||
    !/<meta name="robots" content="noindex(?:,[^"]*)?"\s*\/?\s*>/.test(html) ||
    !html.includes("Explore China Routes") || !html.includes("Return home")) {
    console.error(`FAIL ${path}: expected a non-indexed 404 with recovery links`);
    failed = true;
  } else {
    console.log(`PASS ${path}: HTTP 404, noindex, recovery links`);
  }
}

const analyticsEvents = process.env.SMOKE_READ_ONLY === "1" ? [] : [
  {
    event: "route_view",
    path: "/china/shanxi",
    route: "Shanxi",
    source: "smoke"
  },
  {
    event: "route_select",
    path: "/journeys",
    route: "Shaolin",
    source: "smoke"
  },
  {
    event: "inquiry_submit_attempt",
    path: "/inquiry",
    source: "smoke"
  },
  {
    event: "inquiry_error",
    path: "/inquiry",
    source: "smoke"
  },
  {
    event: "review_sample",
    path: "/inquiry",
    source: "smoke"
  },
  {
    event: "web_vital",
    metricName: "CLS",
    path: "/",
    source: "smoke",
    value: 0
  }
];

for (const metric of analyticsEvents) {
  const analyticsResponse = await fetch(`${baseUrl}/api/analytics`, {
    body: JSON.stringify({
      ...metric,
      sessionId: "smoke-test-session"
    }),
    headers: { "Content-Type": "application/json" },
    method: "POST"
  });

  if (!analyticsResponse.ok) {
    console.error(
      `FAIL /api/analytics (${metric.event}): HTTP ${analyticsResponse.status}`
    );
    failed = true;
  } else {
    console.log(`PASS /api/analytics (${metric.event})`);
  }
}

if (baseUrl.endsWith(".vercel.app")) {
  const analyticsScriptResponse = await fetch(
    `${baseUrl}/_vercel/insights/script.js`
  );

  if (!analyticsScriptResponse.ok) {
    console.error(
      `FAIL /_vercel/insights/script.js: HTTP ${analyticsScriptResponse.status}`
    );
    failed = true;
  } else {
    console.log("PASS /_vercel/insights/script.js");
  }
}

if (failed) process.exitCode = 1;
