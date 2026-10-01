"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buildNavigationInquiryHref } from "@/lib/inquiryLinks";

type NavigationInquiryLinkProps = {
  className: string;
  source: "header" | "footer";
};

export function NavigationInquiryLink({
  className,
  source
}: NavigationInquiryLinkProps) {
  const pathname = usePathname();

  return (
    <Link
      className={className}
      data-track-event="request_route"
      data-track-source={source}
      href={buildNavigationInquiryHref(pathname, source)}
    >
      Request a Private Route
    </Link>
  );
}
