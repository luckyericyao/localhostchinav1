import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Trust — Localhost Global",
  description:
    "The Localhost trust model: host screening, no random matching, traveler respect, boundaries, privacy, and quality control."
};

const trustPillars = [
  {
    title: "Host screening",
    copy:
      "Hosts are reviewed for judgment, reliability, cultural fluency, communication quality, and the ability to represent home with care."
  },
  {
    title: "No random matching",
    copy:
      "Host fit matters. A route should not be assigned to whoever is free first or willing to bid lowest."
  },
  {
    title: "Traveler respect and host boundaries",
    copy:
      "Travelers must respect local people, time, culture, and boundaries. The relationship only works when dignity goes both ways."
  },
  {
    title: "Privacy and discretion",
    copy:
      "Private routes may involve families, founders, executives, writers, or returning diaspora. Discretion is part of the work."
  },
  {
    title: "Safety and practical limits",
    copy:
      "Hosts support local judgment and route experience. They are not emergency responders or 24/7 personal staff."
  },
  {
    title: "Quality control",
    copy:
      "Feedback, host review, chapter standards, and local constraints shape what Localhost offers next."
  }
];

const boundaries = [
  "Hosts are not servants.",
  "Hosts are not entertainers.",
  "Hosts are not drivers by default.",
  "Hosts are not emergency responders.",
  "Hosts are not forced to be available 24/7.",
  "Localhost does not encourage lowest-price bidding.",
  "Trust comes before scale.",
  "Localhost may decline or redirect inquiries that are not a fit.",
  "A public guide marketplace is not the model."
];

export default function TrustPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="page-hero support-hero">
          <div>
            <p className="eyebrow">Trust</p>
            <h1>A local-host network only works if it protects both sides.</h1>
          </div>
          <div className="page-hero-copy">
            <p>
              Localhost is built around selected hosts, reviewed intent, clear
              boundaries, and quality control. The point is not maximum scale.
              The point is trust that can hold.
            </p>
            <div className="inline-actions">
              <Link className="button button--dark" href="/inquiry">
                Request a Private Route
              </Link>
              <Link className="text-link" href="/hosts">
                Apply to Become a Host
              </Link>
            </div>
          </div>
        </section>

        <section className="section section--stone">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">Trust Architecture</p>
            <h2>Operational credibility begins before the route.</h2>
          </div>
          <div className="support-card-grid support-card-grid--three">
            {trustPillars.map((item) => (
              <article className="support-detail-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section section--dark">
          <div className="section-heading">
            <p className="eyebrow">Boundaries</p>
            <h2>What Localhost will not become.</h2>
          </div>
          <ul className="reference-matrix reference-matrix--dark">
            {boundaries.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="section intro-section">
          <div className="section-heading">
            <p className="eyebrow">Not A Marketplace</p>
            <h2>The host is not a listing. The route is not a commodity.</h2>
          </div>
          <div className="editorial-copy">
            <p className="lead">
              A public marketplace optimizes for supply. Localhost optimizes for
              fit, judgment, and relationship.
            </p>
            <p>
              That means fewer routes, slower matching, clearer expectations,
              and the willingness to redirect an inquiry when the fit is not
              right.
            </p>
          </div>
        </section>

        <section className="section final-section">
          <div className="section-heading">
            <p className="eyebrow">Trust Before Scale</p>
            <h2>Begin with a route that can be held properly.</h2>
          </div>
          <div className="editorial-copy">
            <p>
              The private route inquiry is the first trust step: a way to
              understand intent before any host, city, or chapter is confirmed.
            </p>
            <div className="inline-actions">
              <Link className="button button--dark" href="/inquiry">
                Request a Private Route
              </Link>
              <Link className="text-link" href="/hosts">
                Apply to Become a Host
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
