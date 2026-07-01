import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Travelers — Localhost Global",
  description:
    "Private China routes for travelers who want cultural fluency, host fit, and practical support."
};

const received = [
  {
    title: "Private route design",
    copy:
      "A route direction shaped around timing, intent, comfort level, and the China you want to understand."
  },
  {
    title: "Trusted local host",
    copy:
      "A person selected for judgment, communication, local fluency, and fit with the chapter."
  },
  {
    title: "Practical steadiness",
    copy:
      "Help with transport, restaurants, payments, apps, language, timing, and the small decisions handled in the background."
  }
];

const scenarios = [
  {
    title: "First-time China traveler",
    copy:
      "You want confidence with payments, food, movement, etiquette, and the feeling of the place beyond headlines."
  },
  {
    title: "Returning diaspora",
    copy:
      "You are coming back with questions about memory, language, family stories, identity, or a region that deserves care."
  },
  {
    title: "Founder, executive, or investor",
    copy:
      "You need cultural fluency, local judgment, neighborhood texture, and a route that respects your time."
  },
  {
    title: "Family or private group",
    copy:
      "You want comfort, pacing, translation help, food confidence, and a route that can adapt without becoming flattened."
  }
];

const judgmentAreas = [
  "Payments",
  "Local apps",
  "Food ordering",
  "Timing and traffic",
  "Language",
  "Transport",
  "Etiquette",
  "Local interpretation"
];

const supportLevels = [
  {
    title: "Route Advisory",
    copy:
      "For travelers who want direction, context, and practical preparation before moving independently."
  },
  {
    title: "Hosted Private Route",
    copy:
      "For travelers who want a selected host present for key moments, meals, movement, and cultural interpretation."
  },
  {
    title: "Fully Held China Chapter",
    copy:
      "For travelers who want the route, host layer, logistics, timing, and local support held together with greater care."
  }
];

const rightFit = [
  "You want a route shaped around understanding, not speed.",
  "You are comfortable with review before confirmation.",
  "You value host fit over instant booking.",
  "You want practical confidence without turning the trip into a performance."
];

const notRightFit = [
  "You want instant booking without review.",
  "You want the lowest possible price before the route is understood.",
  "You want a host to act as a servant, entertainer, or 24/7 assistant.",
  "You only want fast photo stops with no local interpretation."
];

const travelersInquiryHref =
  "/inquiry?type=traveler&sourcePage=%2Ftravelers&sourceLabel=Travelers%20page";

export default function TravelersPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="page-hero support-hero">
          <div>
            <p className="eyebrow">For Travelers</p>
            <h1>Private routes for travelers who want China to make sense.</h1>
          </div>
          <div className="page-hero-copy">
            <p>
              Localhost helps travelers enter China through route shaping, host
              fit, cultural fluency, and practical support handled in the
              background.
            </p>
            <Link className="button button--dark" href={travelersInquiryHref}>
              Request a Private Route
            </Link>
          </div>
        </section>

        <section className="section section--stone">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">What You Receive</p>
            <h2>Not more itinerary noise. A route that can be held.</h2>
          </div>
          <div className="support-card-grid support-card-grid--three">
            {received.map((item) => (
              <article className="support-detail-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">Traveler Scenarios</p>
            <h2>Different travelers need different route logic.</h2>
          </div>
          <div className="support-card-grid">
            {scenarios.map((item) => (
              <article className="support-detail-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section executive-traveler-section">
          <div className="section-heading">
            <p className="eyebrow">Executive Travelers</p>
            <h2>For founders, investors, and executives</h2>
          </div>
          <div className="editorial-copy">
            <p>
              Some travelers do not need more luxury. They need judgment: where
              to go, what to notice, how to read a city, when to slow down, and
              how to move through China without flattening it into meetings,
              hotels, and skyline photos.
            </p>
            <Link className="button button--dark" href={travelersInquiryHref}>
              Request Private Route Review
            </Link>
          </div>
        </section>

        <section className="section section--dark">
          <div className="section-heading">
            <p className="eyebrow">Local Judgment</p>
            <h2>The small decisions often change the whole day.</h2>
          </div>
          <ul className="reference-matrix reference-matrix--dark">
            {judgmentAreas.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="section section--stone">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">Support Levels</p>
            <h2>Scope language, not pricing tiers.</h2>
          </div>
          <div className="support-card-grid support-card-grid--three">
            {supportLevels.map((item) => (
              <article className="support-detail-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
          <p className="scope-note">
            Pricing depends on route depth, host involvement, logistics, city
            coverage, and support level. Localhost does not quote before the
            route scope is understood.
          </p>
        </section>

        <section className="section split-panel-section">
          <div className="quiet-panel">
            <p className="eyebrow">Right Fit</p>
            <h2>When Localhost makes sense.</h2>
            <ul className="clean-list">
              {rightFit.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="quiet-panel">
            <p className="eyebrow">Not Right If</p>
            <h2>Some travelers need a different model.</h2>
            <ul className="clean-list">
              {notRightFit.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section final-section">
          <div className="section-heading">
            <p className="eyebrow">Begin With China</p>
            <h2>Tell us what you want to understand.</h2>
          </div>
          <div className="editorial-copy">
            <p>
              China is the first chapter because it rewards cultural fluency:
              language, payments, etiquette, food, transport, regional depth,
              and the judgment to know when to slow down.
            </p>
            <div className="inline-actions">
              <Link className="button button--dark" href={travelersInquiryHref}>
                Request a Private Route
              </Link>
              <Link className="text-link" href="/how-it-works">
                See how the route is reviewed
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
