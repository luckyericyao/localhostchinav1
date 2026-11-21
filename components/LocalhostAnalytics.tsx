"use client";

import { track as trackVercelEvent } from "@vercel/analytics";
import { Analytics } from "@vercel/analytics/react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useReportWebVitals } from "next/web-vitals";
import { normalizeMetricSessionId } from "@/lib/metricSession";
import { normalizeAnalyticsUrl, normalizeMetricName, normalizeMetricPath, normalizeMetricRoute, normalizeMetricSource, normalizeWebVital } from "@/lib/metricDimensions";

type AnalyticsEvent =
  | "hero_cta"
  | "inquiry_duplicate"
  | "inquiry_error"
  | "inquiry_rate_limited"
  | "inquiry_sent"
  | "inquiry_start"
  | "inquiry_submit_attempt"
  | "representative_path_start"
  | "mailto_fallback"
  | "optional_details"
  | "page_view"
  | "request_route"
  | "review_sample"
  | "route_select"
  | "route_view"
  | "validation_error"
  | "web_vital";

type MetricDetails = {
  metricName?: string;
  path?: string;
  route?: string;
  source?: string;
  value?: number;
};

export function getAnonymousSessionId() {
  const storageKey = "localhost_session_id";

  try {
    const existing = normalizeMetricSessionId(window.sessionStorage.getItem(storageKey));
    if (existing) return existing;

    const generated =
      typeof window.crypto?.randomUUID === "function"
        ? window.crypto.randomUUID()
        : `session-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

    window.sessionStorage.setItem(storageKey, generated);
    return generated;
  } catch {
    return "";
  }
}

function sendLocalhostMetric(
  event: AnalyticsEvent,
  details: MetricDetails = {}
) {
  const path = normalizeMetricPath(details.path ?? window.location.pathname);
  if (!path) return;

  const payload = {
    event,
    metricName: event === "web_vital" ? normalizeMetricName(details.metricName) : "",
    path,
    route: normalizeMetricRoute(details.route),
    sessionId: getAnonymousSessionId(),
    source: normalizeMetricSource(details.source),
    value: details.value
  };
  const body = JSON.stringify(payload);

  try {
    trackVercelEvent(event, {
      metricName: payload.metricName || null,
      path: payload.path,
      route: payload.route || null,
      source: payload.source || null,
      value: typeof payload.value === "number" ? payload.value : null
    });
  } catch {
    // The local data layer and server endpoint remain the fallback paths.
  }

  const layerPayload: Record<string, string | number> = {
    event,
    path: payload.path,
    route: payload.route,
    sessionId: payload.sessionId,
    source: payload.source
  };

  if (payload.metricName) layerPayload.metricName = payload.metricName;
  if (typeof payload.value === "number") layerPayload.value = payload.value;

  window.localhostDataLayer ||= [];
  window.localhostDataLayer.push(layerPayload);

  if (
    navigator.sendBeacon &&
    navigator.sendBeacon(
      "/api/analytics",
      new Blob([body], { type: "application/json" })
    )
  ) {
    return;
  }

  void fetch("/api/analytics", {
    body,
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    method: "POST"
  }).catch(() => {
    // Analytics must never interrupt the page.
  });
}

export function trackLocalhostEvent(event: AnalyticsEvent, element?: HTMLElement) {
  sendLocalhostMetric(event, {
    route: element?.dataset.trackRoute,
    source: element?.dataset.trackSource
  });
}

const reportWebVital: Parameters<typeof useReportWebVitals>[0] = (report) => {
  const metric = normalizeWebVital(report, window.location.origin);
  if (metric) sendLocalhostMetric("web_vital", { ...metric, source: "web_vitals_v2" });
};

export function LocalhostAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target instanceof Element
        ? event.target.closest<HTMLElement>("[data-track-event]")
        : null;
      const eventName = target?.dataset.trackEvent as AnalyticsEvent | undefined;

      if (target && eventName) trackLocalhostEvent(eventName, target);
    }

    function handleFocus(event: FocusEvent) {
      const target = event.target instanceof Element ? event.target : null;
      const form = target?.closest<HTMLFormElement>(
        'form[data-inquiry-form="true"]'
      );

      if (form && form.dataset.inquiryTracked !== "true") {
        form.dataset.inquiryTracked = "true";
        trackLocalhostEvent("inquiry_start", form);
      }
    }

    document.addEventListener("click", handleClick);
    document.addEventListener("focusin", handleFocus);

    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("focusin", handleFocus);
    };
  }, []);

  useEffect(() => {
    sendLocalhostMetric("page_view");
    const routePage = document.querySelector<HTMLElement>("[data-route-page]");

    if (routePage) trackLocalhostEvent("route_view", routePage);
  }, [pathname]);

  useReportWebVitals(reportWebVital);

  return <Analytics beforeSend={(event) => {
    const url = normalizeAnalyticsUrl(event.url);
    return url ? { ...event, url } : null;
  }} />;
}

declare global {
  interface Window {
    localhostDataLayer?: Array<Record<string, string | number>>;
  }
}
