import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Travelers — Localhost Global",
  description:
    "Private China routes for travelers who want cultural fluency, host fit, and quiet practical support."
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
    title: "Quiet practical support",
    copy:
      "Help with transport, restaurants, payments, apps, language, timing, and the small decisions that steady the day."
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
  "Local rhythm"
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

export default function TravelersPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="page-hero support-hero">
          <div>
            <p className="eyebrow">For Travelers</p>
            <h1>Private routes for people who want context, not content.</h1>
          </div>
          <div className="page-hero-copy">
            <p>
              Localhost helps travelers enter China through route shaping, host
              fit, cultural fluency, and practical support that sits quietly in
              the background.
            </p>
            <Link className="button button--dark" href="/inquiry">
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
            <h2>Different travelers need different thresholds.</h2>
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
        </section>

        <section className="section split-layout">
          <div className="section-heading">
            <p className="eyebrow">Right Fit</p>
            <h2>Localhost is for travelers who want the place to stay real.</h2>
          </div>
          <div className="editorial-copy">
            <p className="lead">
              The route should answer a human question, not just fill a calendar.
            </p>
            <ul className="clean-list">
              {rightFit.map((item) => (
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
              <Link className="button button--dark" href="/inquiry">
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
