"use client";

import Link from "next/link";
import { useEffect, useId, useRef } from "react";
import type { MouseEvent } from "react";
import { NavigationInquiryLink } from "@/components/NavigationInquiryLink";

const chapters = ["Shanxi", "Shaolin", "Huizhou", "Shanghai"] as const;

export function DiscoveryMenu() {
  const details = useRef<HTMLDetailsElement>(null);
  const summary = useRef<HTMLElement>(null);
  const panelId = useId();

  useEffect(() => {
    function dismiss(event: KeyboardEvent | PointerEvent) {
      const menu = details.current;
      if (!menu?.open) return;

      if (event instanceof KeyboardEvent && event.key === "Escape") {
        event.preventDefault();
        menu.open = false;
        summary.current?.focus();
      } else if (
        event instanceof PointerEvent &&
        event.target instanceof Node &&
        !menu.contains(event.target)
      ) {
        menu.open = false;
      }
    }

    document.addEventListener("keydown", dismiss);
    document.addEventListener("pointerdown", dismiss);
    return () => {
      document.removeEventListener("keydown", dismiss);
      document.removeEventListener("pointerdown", dismiss);
    };
  }, []);

  function closeAfterNavigation(event: MouseEvent<HTMLElement>) {
    if (event.target instanceof Element && event.target.closest("a")) {
      if (details.current) details.current.open = false;
    }
  }

  return (
    <details
      className="discovery-menu"
      ref={details}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          event.currentTarget.open = false;
        }
      }}
    >
      <summary ref={summary} aria-controls={panelId} aria-label="Explore Localhost">
        Menu
      </summary>
      <nav
        className="discovery-menu-panel"
        id={panelId}
        aria-label="Explore Localhost"
        onClick={closeAfterNavigation}
      >
        <div className="discovery-menu-chapters">
          <p className="eyebrow">China / Chapters</p>
          {chapters.map((place) => (
            <Link
              href={`/china/${place.toLowerCase()}`}
              data-discovery-chapter={place.toLowerCase()}
              key={place}
            >
              {place}
            </Link>
          ))}
        </div>
        <div className="discovery-menu-context">
          <Link href="/china">China</Link>
          <Link href="/journeys">Compare routes</Link>
          <Link href="/about">About Localhost</Link>
          <Link href="/travelers">Traveling with us</Link>
          <Link href="/trust">Trust & care</Link>
          <Link href="/hosts">For hosts</Link>
          <NavigationInquiryLink className="discovery-contact" source="header" label="Contact" />
        </div>
      </nav>
    </details>
  );
}
