import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { InquirySection } from "@/components/InquirySection";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { arrangements, chinaJourneys } from "@/lib/content";

export const metadata: Metadata = {
  title: "Localhost China — A Local Way In",
  description:
    "China as the first Localhost chapter: private routes, trusted hosts, cultural decoding, and practical confidence for thoughtful travelers."
};

const whyChina = [
  {
    title: "Context over sightseeing",
    copy:
      "Temples, villages, cities, food, etiquette, and history become clearer when someone can explain what matters."
  },
  {
    title: "Local rhythm over checklist",
    copy:
      "A good route knows when to move, when to slow down, what to avoid, and where the day should breathe."
  },
  {
    title: "Regional depth over generic China",
    copy:
      "Shanxi, Shaolin, Huizhou, and Shanghai each ask for a different language of attention."
  },
  {
    title: "Trusted support over confusion",
    copy:
      "Payments, apps, transport, restaurants, timing, and translation can be held quietly in the background."
  }
];

const whoFor = [
  "Thoughtful international travelers",
  "Overseas Chinese and diaspora returning with questions",
  "Founders, investors, academics, artists, writers, and executives",
  "People who want to understand China beyond headlines and tourist lists"
];

const notFor = [
  "People looking only for the lowest-cost group tour",
  "Travelers who only want photo stops",
  "People who want standardized tourism"
];

export default function ChinaPage() {
  const featuredRoutes = chinaJourneys.filter((journey) =>
    ["Shanxi", "Shaolin", "Huizhou"].includes(journey.place)
  );

  return (
    <>
      <SiteHeader />
      <main>
        <section className="page-hero page-hero--china">
          <div>
            <p className="eyebrow">Localhost China</p>
            <h1>China is easy to visit. It is harder to understand.</h1>
          </div>
          <div className="page-hero-copy">
            <p>
              China asks for local decoding: language, payments, food,
              etiquette, cities, temples, villages, rhythm, and regional
              history. Localhost China is the first chapter of a private
              local-host network built around context.
            </p>
            <Link className="button button--dark" href="/inquiry">
              Request a Private Route
            </Link>
          </div>
        </section>

        <section className="section section--stone">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">Why Localhost China</p>
            <h2>Local fluency changes the quality of the journey.</h2>
          </div>
          <div className="support-card-grid">
            {whyChina.map((card) => (
              <article className="support-detail-card" key={card.title}>
                <h3>{card.title}</h3>
                <p>{card.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section" aria-labelledby="china-arrange">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">Local Support Layers</p>
            <h2 id="china-arrange">What we arrange in China.</h2>
          </div>
          <div className="arrangement-grid">
            {arrangements.map((item) => (
              <Link
                className="arrangement-card arrangement-card--link"
                href={item.href}
                key={item.title}
              >
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
                <span className="arrangement-cue">Learn more</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="section section--dark" id="journeys">
          <div className="section-heading">
            <p className="eyebrow">Featured Routes</p>
            <h2>Private cultural routes with local context.</h2>
          </div>
          <div className="china-route-list">
            {featuredRoutes.map((journey) => (
              <article className="route-entry" key={journey.place}>
                <div className="route-entry-media">
                  <Image
                    src={journey.image}
                    alt={journey.alt}
                    fill
                    sizes="(min-width: 900px) 34vw, 100vw"
                  />
                </div>
                <div className="route-entry-copy">
                  <p className="eyebrow">{journey.place}</p>
                  <h3>{journey.line}</h3>
                  <p>{journey.summary}</p>
                  <Link
                    className="text-link text-link--light"
                    href={journey.href}
                  >
                    Enter {journey.place}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section split-panel-section">
          <div className="quiet-panel">
            <p className="eyebrow">Who This Is For</p>
            <ul className="clean-list">
              {whoFor.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="quiet-panel">
            <p className="eyebrow">Not For</p>
            <ul className="clean-list">
              {notFor.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section final-section">
          <div className="section-heading">
            <p className="eyebrow">Private Inquiry</p>
            <h2>Tell us what kind of China you want to enter.</h2>
          </div>
          <div className="editorial-copy">
            <p>
              The first route should be shaped around your curiosity, time,
              pace, and the kind of understanding you want to bring home.
            </p>
            <div className="inline-actions">
              <Link className="button button--dark" href="/inquiry">
                Request a Private Route
              </Link>
              <Link className="text-link" href="/travelers">
                For travelers
              </Link>
            </div>
          </div>
        </section>

        <InquirySection id="china-private-route-inquiry" compact />
      </main>
      <SiteFooter />
    </>
  );
}
