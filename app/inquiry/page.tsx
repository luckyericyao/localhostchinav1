import type { Metadata } from "next";
import Link from "next/link";
import { InquirySection } from "@/components/InquirySection";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Private Route Inquiry — Localhost Global",
  description:
    "A calm private intake for travelers, hosts, and partners interested in Localhost China routes and local-host support."
};

export default function InquiryPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="page-hero support-hero">
          <div>
            <p className="eyebrow">Private Inquiry</p>
            <h1>Begin with the China you want to understand.</h1>
          </div>
          <div className="page-hero-copy">
            <p>
              A private route starts with curiosity, timing, context, and the
              right local support. This is a quiet intake, not a booking engine.
            </p>
            <Link className="text-link" href="/china">
              Explore China first
            </Link>
          </div>
        </section>

        <InquirySection id="private-route" compact />
      </main>
      <SiteFooter />
    </>
  );
}
