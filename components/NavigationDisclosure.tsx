"use client";

import { useEffect, useId, useRef, type MouseEvent, type ReactNode } from "react";

type NavigationDisclosureProps = {
  children: ReactNode;
  className: string;
  panelClassName: string;
  menuLabel: string;
  navigationLabel?: string;
};

export function NavigationDisclosure({
  children, className, panelClassName, menuLabel, navigationLabel = menuLabel
}: NavigationDisclosureProps) {
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
    const menu = details.current;
    const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
    if (!menu || !(link instanceof HTMLAnchorElement)) return;
    menu.open = false;
    if (event.detail === 0 && link.href === window.location.href) summary.current?.focus();
  }

  return (
    <details
      className={className}
      ref={details}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false;
      }}
    >
      <summary ref={summary} aria-controls={panelId} aria-label={menuLabel}>Menu</summary>
      <nav className={panelClassName} id={panelId} aria-label={navigationLabel} data-focus-destination onClick={closeAfterNavigation}>
        {children}
      </nav>
    </details>
  );
}
