"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";

type NavigationPageLinkProps = Omit<ComponentProps<typeof Link>, "href" | "aria-current"> & {
  href: string;
};

export function NavigationPageLink({ href, ...props }: NavigationPageLinkProps) {
  const pathname = usePathname();
  return <Link {...props} href={href} aria-current={pathname === href ? "page" : undefined} />;
}
