import type {
  LocalhostIntentType,
  LocalhostRouteContext
} from "@/app/actions/submitLocalhostInquiry";

type InquiryLinkContext = {
  intentType: LocalhostIntentType;
  routeContext?: LocalhostRouteContext;
  sourceLabel?: string;
  sourcePage?: string;
};

const activeRoutePaths: Record<string, LocalhostRouteContext> = {
  "/china/shanxi": "shanxi",
  "/china/shaolin": "shaolin",
  "/china/huizhou": "huizhou",
  "/china/shanghai": "shanghai"
};

export function buildInquiryHref({
  intentType,
  routeContext,
  sourceLabel,
  sourcePage
}: InquiryLinkContext) {
  const params = new URLSearchParams({ type: intentType });

  if (routeContext) params.set("route", routeContext);
  if (sourcePage) params.set("sourcePage", sourcePage);
  if (sourceLabel) params.set("sourceLabel", sourceLabel);

  return `/inquiry?${params.toString()}`;
}

export function buildNavigationInquiryHref(
  pathname: string | null,
  source: "header" | "footer"
) {
  // Navigation attribution uses only the path, never URL queries or form data.
  const sourcePage = pathname?.split(/[?#]/)[0] || "/";

  return buildInquiryHref({
    intentType: "traveler",
    routeContext: activeRoutePaths[sourcePage],
    sourceLabel: source === "header" ? "Header" : "Footer",
    sourcePage
  });
}
