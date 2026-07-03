import type { Metadata } from "next";
import Link from "next/link";
import { CulturalImageLayer } from "@/components/CulturalImageLayer";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { culturalVisualLayers } from "@/lib/content";

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
  "A traveler receives local judgment in one chapter.",
  "A host contributes judgment, access, and hospitality.",
  "Host Credits remember contribution inside the network.",
  "Future chapters allow trusted hospitality to move across the network."
];

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="page-hero support-hero">
          <div>
            <p className="eyebrow">About Localhost</p>
            <h1>Tourism often turns places into content. Localhost starts with local judgment.</h1>
          </div>
          <div className="page-hero-copy">
            <p>
              Localhost Global exists to make private travel more legible,
              respectful, and locally grounded. The work is route design, host
              fit, and practical context.
            </p>
            <Link className="button button--dark" href="/how-it-works">
              See How It Works
            </Link>
          </div>
        </section>

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
            <h2>The brand in practical terms.</h2>
            <p>
              Localhost should feel thoughtful, not mysterious. The model is
              private route design, trusted host fit, and practical local
              judgment.
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

        <CulturalImageLayer {...culturalVisualLayers.home} tone="paper" />

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
            <h2>A global network should remember contribution.</h2>
          </div>
          <ol className="rhythm-list rhythm-list--dark">
            {networkIdeas.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
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
