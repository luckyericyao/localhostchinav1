"use client";

import { track as trackVercelEvent } from "@vercel/analytics";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

type AnalyticsEvent =
  | "hero_cta"
  | "inquiry_duplicate"
  | "inquiry_error"
  | "inquiry_rate_limited"
  | "inquiry_sent"
  | "inquiry_start"
  | "inquiry_submit_attempt"
  | "mailto_fallback"
  | "optional_details"
  | "request_route"
  | "review_sample"
  | "route_select"
  | "route_view"
  | "validation_error"
  | "web_vital";

type MetricDetails = {
  metricName?: string;
  route?: string;
  source?: string;
  value?: number;
};

function getAnonymousSessionId() {
  const storageKey = "localhost_session_id";

  try {
    const existing = window.sessionStorage.getItem(storageKey);
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
  const payload = {
    event,
    metricName: details.metricName || "",
    path: window.location.pathname,
    route: details.route || "",
    sessionId: getAnonymousSessionId(),
    source: details.source || "",
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

function observePerformanceType(
  entryType: string,
  callback: (entries: PerformanceObserverEntryList) => void
) {
  if (typeof PerformanceObserver === "undefined") return null;

  if (
    Array.isArray(PerformanceObserver.supportedEntryTypes) &&
    !PerformanceObserver.supportedEntryTypes.includes(entryType)
  ) {
    return null;
  }

  const observer = new PerformanceObserver((list) => callback(list));

  try {
    observer.observe({ buffered: true, type: entryType });
    return observer;
  } catch {
    observer.disconnect();
    return null;
  }
}

function startWebVitalCollection() {
  let clsValue = 0;
  let lcpValue = 0;
  let reported = false;
  const interactionDurations = new Map<number, number>();
  const observers: PerformanceObserver[] = [];

  const lcpObserver = observePerformanceType("largest-contentful-paint", (list) => {
    for (const entry of list.getEntries()) {
      lcpValue = Math.max(lcpValue, entry.startTime);
    }
  });
  const clsObserver = observePerformanceType("layout-shift", (list) => {
    for (const entry of list.getEntries() as Array<PerformanceEntry & {
      hadRecentInput?: boolean;
      value?: number;
    }>) {
      if (!entry.hadRecentInput) clsValue += entry.value || 0;
    }
  });
  const inpObserver = observePerformanceType("event", (list) => {
    for (const entry of list.getEntries() as Array<PerformanceEntry & {
      interactionId?: number;
    }>) {
      if (entry.interactionId) {
        interactionDurations.set(
          entry.interactionId,
          Math.max(interactionDurations.get(entry.interactionId) || 0, entry.duration)
        );
      }
    }
  });

  for (const observer of [lcpObserver, clsObserver, inpObserver]) {
    if (observer) observers.push(observer);
  }

  function report() {
    if (reported) return;
    reported = true;

    if (lcpValue > 0) {
      sendLocalhostMetric("web_vital", {
        metricName: "LCP",
        source: "web_vitals",
        value: Math.round(lcpValue)
      });
    }

    sendLocalhostMetric("web_vital", {
      metricName: "CLS",
      source: "web_vitals",
      value: Math.round(clsValue * 10000) / 10000
    });

    const durations = [...interactionDurations.values()].sort((a, b) => a - b);
    if (durations.length) {
      const index = Math.min(
        durations.length - 1,
        Math.floor(durations.length * 0.98)
      );
      sendLocalhostMetric("web_vital", {
        metricName: "INP",
        source: "web_vitals",
        value: Math.round(durations[index])
      });
    }
  }

  function handleVisibilityChange() {
    if (document.visibilityState === "hidden") report();
  }

  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("pagehide", report);

  return () => {
    report();
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("pagehide", report);
    observers.forEach((observer) => observer.disconnect());
  };
}

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
    const routePage = document.querySelector<HTMLElement>("[data-route-page]");

    if (routePage) trackLocalhostEvent("route_view", routePage);
  }, [pathname]);

  useEffect(() => startWebVitalCollection(), [pathname]);

  return null;
}

declare global {
  interface Window {
    localhostDataLayer?: Array<Record<string, string | number>>;
  }
}
