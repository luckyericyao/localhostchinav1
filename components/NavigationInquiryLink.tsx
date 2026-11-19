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
  const href = buildNavigationInquiryHref(pathname, source);

  if (href.startsWith("#")) {
    return <a className={className} href={href}>{label}</a>;
  }

  return (
    <Link
      className={className}
      data-track-event="request_route"
      data-track-source={source}
      href={href}
    >
      {label}
    </Link>
  );
}
