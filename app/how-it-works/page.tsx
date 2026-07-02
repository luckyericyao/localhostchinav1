import type { Metadata } from "next";
import Link from "next/link";
import { CulturalImageLayer } from "@/components/CulturalImageLayer";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { culturalVisualLayers } from "@/lib/content";

export const metadata: Metadata = {
  title: "How It Works — Localhost Global",
  description:
    "The Localhost operating flow: inquiry, intent review, route direction, host fit, feasibility, proposal, local support, feedback, and future relationship."
};

const operatingFlow = [
  "Private inquiry",
  "Intent review",
  "Route direction",
  "Host fit check",
  "Practical feasibility review",
  "Route proposal",
  "Local support",
  "Post-route feedback",
  "Future relationship / Host Credits"
];

const reviewFactors = [
  "Timing and trip length",
  "Intent and cultural curiosity",
  "Comfort level and movement style",
  "Host fit and local availability",
  "Practical feasibility",
  "Respect for host boundaries"
];

const boundaries = [
  "Localhost is not an instant booking engine.",
  "Routes are shaped only after intent, timing, comfort, and host fit are reviewed.",
  "Some inquiries may be redirected if a route is not the right fit.",
  "Local judgment can change the route before it is confirmed."
];

const howItWorksInquiryHref =
  "/inquiry?type=traveler&sourcePage=%2Fhow-it-works&sourceLabel=How%20It%20Works%20page";

export default function HowItWorksPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="page-hero support-hero">
          <div>
            <p className="eyebrow">How It Works</p>
            <h1>A private route is reviewed before it is shaped.</h1>
          </div>
          <div className="page-hero-copy">
            <p>
              Localhost is a reviewed route process, not an instant booking
              engine. A route becomes real only when intent, timing, comfort,
              local feasibility, and host fit make sense together.
            </p>
            <Link className="button button--dark" href={howItWorksInquiryHref}>
              Begin a Private Route Review
            </Link>
          </div>
        </section>

        <section className="section section--dark">
          <div className="section-heading">
            <p className="eyebrow">Operating Flow</p>
            <h2>Nine steps, held by local judgment.</h2>
          </div>
          <ol className="rhythm-list rhythm-list--dark">
            {operatingFlow.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </section>

        <CulturalImageLayer {...culturalVisualLayers.china} tone="paper" />

        <section className="section split-layout">
          <div className="section-heading">
            <p className="eyebrow">Review</p>
            <h2>Not every inquiry should become the same route.</h2>
          </div>
          <div className="editorial-copy">
            <p className="lead">
              Route shaping begins with the traveler&apos;s question, then meets
              the reality of the place.
            </p>
            <p>
              The strongest routes come from alignment: the right chapter, the
              right pace, the right host, and the right expectations.
            </p>
          </div>
        </section>

        <section className="section section--stone">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">What We Review</p>
            <h2>Fit comes before confirmation.</h2>
          </div>
          <ul className="reference-matrix">
            {reviewFactors.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="section">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">Boundaries</p>
            <h2>Clarity protects the route.</h2>
          </div>
          <ul className="reference-matrix">
            {boundaries.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="section final-section">
          <div className="section-heading">
            <p className="eyebrow">Next Step</p>
            <h2>Tell us the China you want to understand.</h2>
          </div>
          <div className="editorial-copy">
            <p>
              A clear inquiry gives the team enough to suggest a chapter, test
              feasibility, and decide whether a host-led route is the right
              fit.
            </p>
            <div className="inline-actions">
              <Link className="button button--dark" href={howItWorksInquiryHref}>
                Request a Private Route
              </Link>
              <Link className="text-link" href="/trust">
                Understand the trust model
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
