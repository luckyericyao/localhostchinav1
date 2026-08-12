const baseUrl = (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");

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

const expectedContent = new Map([
  ["/", "Request a Private Route"],
  ["/china", "How Localhost Works In China"],
  ["/journeys", "Which China should you enter first?"],
  ["/inquiry", "What the first review gives you"]
]);

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

  if (path.startsWith("/china/") && !body.includes("data-route-page")) {
    console.error(`FAIL ${path}: missing route page marker`);
    failed = true;
    continue;
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
