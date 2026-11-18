"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buildNavigationInquiryHref } from "@/lib/inquiryLinks";

type NavigationInquiryLinkProps = {
  className?: string;
  source: "header" | "footer";
  label?: string;
};

export function NavigationInquiryLink({
  className,
  source,
  label = "Request a Private Route"
}: NavigationInquiryLinkProps) {
  const pathname = usePathname();

  return (
    <Link
      className={className}
      data-track-event="request_route"
      data-track-source={source}
      href={buildNavigationInquiryHref(pathname, source)}
    >
      {label}
    </Link>
  );
}
