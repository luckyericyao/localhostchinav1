const metricPaths = new Set([
  "/", "/china", "/journeys", "/travelers", "/hosts", "/trust", "/inquiry",
  "/about", "/how-it-works", "/host-credits", "/china/shanxi", "/china/shaolin",
  "/china/huizhou", "/china/shanghai", "/china/local-hosts", "/china/private-routes",
  "/china/real-access", "/china/seamless-logistics"
]);

const metricSources = new Set([
  "header", "footer", "homepage", "homepage_featured_routes", "homepage_route_review",
  "homepage_final", "china_hero", "china_featured_routes", "china_final",
  "china_support_final", "journeys_decision", "journeys_comparison", "journeys_final",
  "route_page", "route_hero", "route_fit", "route_final", "trust_hero", "trust_final",
  "travelers_hero", "travelers_executive", "travelers_final", "how_it_works_hero",
  "how_it_works_final", "inquiry_first_review", "private_inquiry", "server_action",
  "web_vitals", "smoke", "Header", "Footer", "Homepage", "Inquiry page",
  "Localhost China page", "China Routes page", "Travelers page", "Hosts page",
  "Trust page", "How It Works page", "Host Credits page", "Shanxi route page",
  "Shaolin route page", "Huizhou route page", "Shanghai route page",
  "Local Hosts support page", "Private Routes support page",
  "Seamless Logistics support page", "Real Access support page"
]);

const metricRoutes = new Map([
  ["shanxi", "Shanxi"], ["shaolin", "Shaolin"], ["huizhou", "Huizhou"],
  ["shanghai", "Shanghai"], ["beijing", "Beijing"], ["chengdu", "Chengdu"],
  ["china-general", "China general"], ["china general", "China general"]
]);

export function normalizeMetricPath(value: unknown): string {
  if (typeof value !== "string") return "";
  const pathname = value.trim().split(/[?#]/)[0];
  if (!pathname.startsWith("/")) return "";
  const path = pathname.replace(/\/+$/, "") || "/";
  return metricPaths.has(path) ? path : "";
}

export function normalizeMetricRoute(value: unknown): string {
  return typeof value === "string" ? metricRoutes.get(value.trim().toLowerCase()) || "" : "";
}

export function normalizeMetricSource(value: unknown): string {
  if (typeof value !== "string") return "";
  const source = value.trim();
  return metricSources.has(source) ? source : source.startsWith("/") ? normalizeMetricPath(source) : "";
}

export function normalizeMetricName(value: unknown): string {
  return typeof value === "string" && ["LCP", "CLS", "INP"].includes(value) ? value : "";
}

export function normalizeMetricInquiryId(value: unknown): string {
  return typeof value === "string" && /^LH-\d{4}-\d{2}-\d{2}-[A-F0-9]{8}$/.test(value) ? value : "";
}

export function normalizeAnalyticsUrl(value: string): string | null {
  try {
    const url = new URL(value);
    const path = normalizeMetricPath(url.pathname);
    return path && ["http:", "https:"].includes(url.protocol) ? `${url.origin}${path}` : null;
  } catch {
    return null;
  }
}
