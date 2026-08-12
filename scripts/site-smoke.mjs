const baseUrl = (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");

const routes = [
  "/",
  "/china",
  "/journeys",
  "/china/shanxi",
  "/china/shaolin",
  "/china/huizhou",
  "/china/shanghai",
  "/travelers",
  "/how-it-works",
  "/trust",
  "/inquiry"
];

const expectedContent = new Map([
  ["/", "No payment or booking at inquiry"],
  ["/china", "How Localhost Works In China"],
  ["/journeys", "Flagship route"],
  ["/trust", "Your email and message are not sent to site analytics"],
  ["/inquiry", "A Localhost reviewer reads it"]
]);

const expectedTracking = new Map([
  ["/", ['data-track-event="route_select"', 'data-track-event="request_route"']],
  ["/china", ['data-track-event="route_select"', 'data-track-event="request_route"']],
  ["/journeys", ['data-track-event="route_select"', 'data-track-event="request_route"']],
  ["/travelers", ['data-track-event="request_route"']],
  ["/trust", ['data-track-event="request_route"']],
  ["/how-it-works", ['data-track-event="request_route"']]
]);

const retiredRouteHeadings = [
  "Choose Another Route If",
  "Compact entry points, held with context.",
  "Local judgment changes what the traveler can read."
];

let failed = false;

for (const path of routes) {
  const response = await fetch(`${baseUrl}${path}`);
  const body = await response.text();
  const expected = expectedContent.get(path);

  if (!response.ok) {
    console.error(`FAIL ${path}: HTTP ${response.status}`);
    failed = true;
    continue;
  }

  if (expected && !body.includes(expected)) {
    console.error(`FAIL ${path}: missing expected content: ${expected}`);
    failed = true;
    continue;
  }

  for (const marker of expectedTracking.get(path) || []) {
    if (!body.includes(marker)) {
      console.error(`FAIL ${path}: missing tracking marker: ${marker}`);
      failed = true;
    }
  }

  if (path.startsWith("/china/") && !body.includes("data-route-page")) {
    console.error(`FAIL ${path}: missing route page marker`);
    failed = true;
    continue;
  }

  if (path.startsWith("/china/")) {
    for (const retiredHeading of retiredRouteHeadings) {
      if (body.includes(retiredHeading)) {
        console.error(
          `FAIL ${path}: retired repetitive route heading remains: ${retiredHeading}`
        );
        failed = true;
      }
    }

    if (!body.includes("What Localhost Holds")) {
      console.error(`FAIL ${path}: missing compact Localhost scope section`);
      failed = true;
    }
  }

  console.log(`PASS ${path} (${body.length} bytes)`);
}

const analyticsEvents = [
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
