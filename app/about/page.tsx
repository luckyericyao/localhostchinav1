import type { Metadata } from "next";
import Link from "next/link";
import { OperatorDetails } from "@/components/OperatorDetails";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "About — Localhost Global",
  description:
    "Why Localhost exists: private routes, local judgment, trust, and cultural context for China-first travel."
};

const principles = [
  {
    title: "Places are lived systems",
    copy:
      "A city, village, temple road, market, or neighborhood is not raw material for content. It has local habits, limits, and social context."
  },
  {
    title: "China first, not China only",
    copy:
      "China is the first chapter because language, payments, food, etiquette, transport, and regional depth reward local fluency."
  },
  {
    title: "Judgment before performance",
    copy:
      "Hosts are selected for taste, patience, judgment, and the ability to hold context. The work is not staged personality."
  },
  {
    title: "Trust before scale",
    copy:
      "A global network only matters if each chapter is built slowly enough to protect hosts, travelers, and the dignity of place."
  }
];

const plainVersion = [
  {
    title: "What Localhost does",
    copy:
      "We shape private routes with local judgment: where to go, how to move, what to eat, what to notice, and when to slow down."
  },
  {
    title: "How it is different",
    copy:
      "Localhost is not a tour agency, guide marketplace, booking platform, or instant itinerary tool. Every route is reviewed before it is shaped."
  },
  {
    title: "Why China first",
    copy:
      "China rewards fluency around language, payment, food, timing, etiquette, regional depth, and the difference between seeing and understanding."
  }
];

const networkIdeas = [
  "A host is paid for the work agreed for a confirmed route.",
  "Feedback and useful introductions can inform future collaboration.",
  "Any reciprocal recognition needs separate written terms.",
  "New chapters follow real local capacity, not a promise of global coverage."
];

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" tabIndex={-1}>
        <section className="page-hero support-hero">
          <div>
            <p className="eyebrow">About Localhost</p>
            <h1>Private China routes, with someone accountable.</h1>
          </div>
          <div className="page-hero-copy">
            <p>
              We help travelers choose a route, find the right local host, and
              agree the practical arrangements. China is our first chapter.
            </p>
            <Link className="button button--dark" href="/how-it-works">
              See How It Works
            </Link>
          </div>
        </section>

        <OperatorDetails />

        <section className="section intro-section">
          <div className="section-heading">
            <p className="eyebrow">Core Thesis</p>
            <h2>A better route starts with local judgment.</h2>
          </div>
          <div className="editorial-copy">
            <p className="lead">
              Good private travel needs fluency, restraint, and attention.
            </p>
            <p>
              Localhost is not built around more stops, faster booking, or public
              guide listings. It is built around host fit, route shaping, and the
              local judgment that makes a place legible.
            </p>
          </div>
        </section>

        <section className="section section--stone">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">Plain Version</p>
            <h2>What Localhost does.</h2>
            <p>
              We shape a private route, identify a suitable local host, and
              agree the practical support before confirmation.
            </p>
          </div>
          <div className="support-card-grid support-card-grid--three">
            {plainVersion.map((item) => (
              <article className="support-detail-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section section--stone">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">Why It Exists</p>
            <h2>Localhost protects the line between access and performance.</h2>
          </div>
          <div className="support-card-grid">
            {principles.map((item) => (
              <article className="support-detail-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section section--dark">
          <div className="section-heading">
            <p className="eyebrow">Reciprocal Hospitality</p>
            <h2>Contribution and future chapters.</h2>
          </div>
          <ol className="rhythm-list rhythm-list--dark">
            {networkIdeas.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
          <p className="scope-note">Host compensation is agreed separately. Future recognition or reciprocal access is not a confirmed benefit.</p>
        </section>

        <section className="section final-section">
          <div className="section-heading">
            <p className="eyebrow">First Chapter</p>
            <h2>Start with China. Build carefully from there.</h2>
          </div>
          <div className="editorial-copy">
            <p>
              China gives Localhost its first operating chapter: real routes,
              real host judgment, practical support, and cultural fluency before
              scale.
            </p>
            <div className="inline-actions">
              <Link className="button button--dark" href="/china">
                Enter Localhost China
              </Link>
              <Link className="text-link" href="/trust">
                Read the trust principles
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
