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

const afterSubmit = [
  "We review intent",
  "We suggest the right chapter or route",
  "We shape a private route direction",
  "We confirm feasibility",
  "Only then does it become a route"
];

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

        <section className="section section--dark">
          <div className="section-heading">
            <p className="eyebrow">After You Submit</p>
            <h2>Review comes before confirmation.</h2>
          </div>
          <ol className="rhythm-list rhythm-list--dark">
            {afterSubmit.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </section>

        <section className="section final-section">
          <div className="section-heading">
            <p className="eyebrow">A Human Intake</p>
            <h2>No instant booking. No random matching.</h2>
          </div>
          <div className="editorial-copy">
            <p>
              A Localhost inquiry may become a traveler route, host
              conversation, partner discussion, or a polite redirect. Fit,
              safety, timing, and local judgment decide the next step.
            </p>
            <div className="inline-actions">
              <Link className="button button--dark" href="/how-it-works">
                See How It Works
              </Link>
              <Link className="text-link" href="/trust">
                Read the trust model
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
