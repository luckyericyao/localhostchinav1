"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

type AnalyticsEvent =
  | "hero_cta"
  | "inquiry_sent"
  | "inquiry_start"
  | "mailto_fallback"
  | "optional_details"
  | "request_route"
  | "route_view"
  | "validation_error";

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

export function trackLocalhostEvent(event: AnalyticsEvent, element?: HTMLElement) {
  const payload = {
    event,
    path: window.location.pathname,
    route: element?.dataset.trackRoute || "",
    sessionId: getAnonymousSessionId(),
    source: element?.dataset.trackSource || ""
  };
  const body = JSON.stringify(payload);

  window.localhostDataLayer ||= [];
  window.localhostDataLayer.push(payload);

  if (navigator.sendBeacon && navigator.sendBeacon(
      "/api/analytics",
      new Blob([body], { type: "application/json" })
    )) {
    return;
  }

  void fetch("/api/analytics", {
    body,
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    method: "POST"
  });
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

  return null;
}

declare global {
  interface Window {
    localhostDataLayer?: Array<Record<string, string>>;
  }
}
