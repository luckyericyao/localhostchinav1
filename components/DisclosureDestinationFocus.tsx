"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function DisclosureDestinationFocus() {
  const pathname = usePathname();
  const pending = useRef<string | null>(null);

  useEffect(() => {
    const reset = () => { pending.current = null; };

    function remember(event: MouseEvent) {
      reset();
      if (event.detail !== 0 || event.button !== 0 || event.defaultPrevented ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element
        ? event.target.closest<HTMLAnchorElement>("[data-focus-destination] a[href]")
        : null;
      if (!link || link.hasAttribute("download") ||
        (link.target && link.target !== "_self")) return;
      const destination = new URL(link.href);
      if (destination.origin !== window.location.origin || destination.hash ||
        destination.pathname === window.location.pathname) return;
      pending.current = destination.pathname;
    }

    document.addEventListener("click", remember, true);
    window.addEventListener("popstate", reset);
    return () => {
      document.removeEventListener("click", remember, true);
      window.removeEventListener("popstate", reset);
    };
  }, []);

  useEffect(() => {
    const destination = pending.current;
    pending.current = null;
    if (destination && pathname === destination && document.activeElement === document.body) {
      document.getElementById("main-content")?.focus({ preventScroll: true });
    }
  }, [pathname]);

  return null;
}
