import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Hosts — Localhost Global",
  description:
    "A selective host path for people who can represent a place with judgment, cultural fluency, discretion, and care."
};

const hostQualities = [
  "Local judgment and taste",
  "Patience with visitors who are learning",
  "Cultural fluency and clear communication",
  "Reliability with timing and boundaries",
  "Ability to explain without performing",
  "Respect for local dignity"
];

const hostRoles = [
  {
    title: "Cultural Host",
    copy:
      "Helps travelers read a place: food, etiquette, neighborhood rhythm, memory, and the meaning behind what they see."
  },
  {
    title: "Route Host",
    copy:
      "Supports movement through a chapter, helping with timing, pacing, practical decisions, and local communication."
  },
  {
    title: "Specialist Host",
    copy:
      "Brings depth in a field such as architecture, food, tea, martial practice, design, history, or business culture."
  },
  {
    title: "Chapter Lead",
    copy:
      "Helps shape a local chapter, screen routes, identify host fit, and protect standards before scale."
  }
];

const applicationSteps = [
  "Share your city, languages, local knowledge areas, and hosting motivation.",
  "Localhost reviews fit, boundaries, communication, and chapter needs.",
  "A first conversation clarifies expectations, availability, and safety limits.",
  "Host role and route type are matched slowly, not assigned automatically.",
  "Feedback shapes future hosting and Host Credit recognition."
];

const boundaries = [
  "Hosts are not servants or personal staff.",
  "Hosts are not emergency responders.",
  "Hosts are not expected to be available all day and night.",
  "Hosts do not compete in lowest-price bidding.",
  "Hosts may decline routes that do not respect the place, the time, or the relationship."
];

const rewards = [
  "Earn income for trusted local contribution",
  "Build serious global relationships",
  "Earn Host Credits inside the Localhost network",
  "Represent a place with dignity rather than performance"
];

const goodHostSignals = [
  "They know when to explain and when to leave space.",
  "They can read visitor comfort without flattening the place.",
  "They make practical decisions calmly.",
  "They protect local dignity even when a traveler is curious.",
  "They understand that hospitality is selective, not performative."
];

export default function HostsPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="page-hero support-hero">
          <div>
            <p className="eyebrow">For Hosts</p>
            <h1>A selective path for hosts with judgment, patience, and taste.</h1>
          </div>
          <div className="page-hero-copy">
            <p>
              Localhost hosts are not scripted guides. They are trusted local
              people who can hold context, make good decisions, and welcome
              travelers without turning the place into a stage.
            </p>
            <Link className="button button--dark" href="/inquiry">
              Apply to Become a Host
            </Link>
          </div>
        </section>

        <section className="section section--stone">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">Host Qualities</p>
            <h2>Selected for judgment, not performance.</h2>
          </div>
          <ul className="reference-matrix">
            {hostQualities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="section">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">Host Roles</p>
            <h2>Different forms of local intelligence.</h2>
          </div>
          <div className="support-card-grid">
            {hostRoles.map((item) => (
              <article className="support-detail-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section section--dark">
          <div className="section-heading">
            <p className="eyebrow">Application Process</p>
            <h2>Slow enough to protect trust.</h2>
          </div>
          <ol className="rhythm-list rhythm-list--dark">
            {applicationSteps.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </section>

        <section className="section split-panel-section">
          <div className="quiet-panel">
            <p className="eyebrow">Host Boundaries</p>
            <ul className="clean-list">
              {boundaries.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="quiet-panel">
            <p className="eyebrow">Compensation And Credits</p>
            <ul className="clean-list">
              {rewards.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section section--stone">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">What Makes A Good Host</p>
            <h2>The best hosts hold context, not a stage.</h2>
          </div>
          <ul className="reference-matrix">
            {goodHostSignals.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="section final-section">
          <div className="section-heading">
            <p className="eyebrow">Host Network</p>
            <h2>Hosting is not performance. It is cultural judgment in practice.</h2>
          </div>
          <div className="editorial-copy">
            <p>
              The strongest hosts do not act like attractions. They help
              travelers move with enough confidence to notice what matters.
            </p>
            <div className="inline-actions">
              <Link className="button button--dark" href="/inquiry">
                Apply to Become a Host
              </Link>
              <Link className="text-link" href="/host-credits">
                Learn about Host Credits
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
