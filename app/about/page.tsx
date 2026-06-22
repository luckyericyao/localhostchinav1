import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "About — Localhost Global",
  description:
    "Why Localhost exists: every place is someone's home, and travel should begin with local context, trust, and hospitality."
};

const principles = [
  {
    title: "Every place is someone's home",
    copy:
      "Localhost begins from a simple premise: a city, village, temple road, market, or neighborhood is not content first. It is home first."
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

const networkIdeas = [
  "A traveler is hosted with care in one chapter.",
  "A host contributes judgment, access, and hospitality at home.",
  "Host Credits remember contribution inside the network.",
  "Future chapters allow hospitality to move from home to home."
];

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="page-hero support-hero">
          <div>
            <p className="eyebrow">About Localhost</p>
            <h1>Tourism often turns places into content. Localhost starts elsewhere.</h1>
          </div>
          <div className="page-hero-copy">
            <p>
              Localhost Global exists because every place is someone&apos;s home.
              The work is to help travelers cross that threshold with context,
              judgment, and care.
            </p>
            <Link className="button button--dark" href="/how-it-works">
              See How It Works
            </Link>
          </div>
        </section>

        <section className="section intro-section">
          <div className="section-heading">
            <p className="eyebrow">Core Thesis</p>
            <h2>A local way in begins with respect.</h2>
          </div>
          <div className="editorial-copy">
            <p className="lead">
              The best travel is not extraction. It is entry with permission,
              fluency, and attention.
            </p>
            <p>
              Localhost is not built around more stops, faster booking, or public
              guide listings. It is built around host fit, route shaping, and the
              human intelligence that makes a place legible.
            </p>
          </div>
        </section>

        <section className="section section--stone">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">Why It Exists</p>
            <h2>Localhost protects the threshold between visitor and home.</h2>
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
            <h2>Start with China. Build toward home everywhere.</h2>
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
