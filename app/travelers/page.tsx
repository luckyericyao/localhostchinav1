import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Travelers — Localhost Global",
  description:
    "Private routes for travelers who want cultural context, trusted local hosts, and practical confidence rather than a sightseeing checklist."
};

const handled = [
  "Private route shaping",
  "Local host matching",
  "Food and cultural context",
  "Timing and logistics",
  "Payment and translation friction",
  "On-the-ground support"
];

const travelerTypes = [
  "Thoughtful travelers",
  "Returning diaspora",
  "Cultural travelers",
  "Executives, founders, and academics",
  "Families who want smoother local access"
];

const howItWorks = [
  "Inquiry",
  "Route design",
  "Host matching",
  "Local support",
  "Reflection and future credits"
];

const notThis = [
  "Not a mass tour",
  "Not a generic guide",
  "Not a checklist itinerary",
  "Not a budget travel hack"
];

export default function TravelersPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="page-hero support-hero">
          <div>
            <p className="eyebrow">For Travelers</p>
            <h1>For travelers who want context, not content.</h1>
          </div>
          <div className="page-hero-copy">
            <p>
              Localhost is for people who want to understand a place through
              trusted local people, private rhythm, and cultural context.
            </p>
            <Link className="button button--dark" href="/inquiry">
              Request a Private Route
            </Link>
          </div>
        </section>

        <section className="section section--stone">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">What We Handle</p>
            <h2>Less friction. More understanding.</h2>
          </div>
          <ul className="reference-matrix">
            {handled.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="section split-panel-section">
          <div className="quiet-panel">
            <p className="eyebrow">Who It Is For</p>
            <ul className="clean-list">
              {travelerTypes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="quiet-panel">
            <p className="eyebrow">What This Is Not</p>
            <ul className="clean-list">
              {notThis.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section section--dark">
          <div className="section-heading">
            <p className="eyebrow">How It Works</p>
            <h2>A private route begins with a human question.</h2>
          </div>
          <ol className="rhythm-list rhythm-list--dark">
            {howItWorks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </section>

        <section className="section final-section">
          <div className="section-heading">
            <p className="eyebrow">Begin With China</p>
            <h2>Tell us what you want to understand.</h2>
          </div>
          <div className="editorial-copy">
            <p>
              China is the first chapter because it rewards local fluency:
              language, payments, etiquette, food, transport, regional depth,
              and rhythm.
            </p>
            <div className="inline-actions">
              <Link className="button button--dark" href="/inquiry">
                Request a Private Route
              </Link>
              <Link className="text-link" href="/china">
                Explore China chapters
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
