import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CulturalImageLayer } from "@/components/CulturalImageLayer";
import { InquirySection } from "@/components/InquirySection";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { arrangements, chinaJourneys, culturalVisualLayers } from "@/lib/content";
import { resolveImageSource } from "@/lib/image";
import { buildLocalhostPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildLocalhostPageMetadata({
  title: "Localhost China — Real Ancient China",
  description:
    "Private routes into ancient and living China, shaped with selected hosts, cultural interpretation, and practical confidence.",
  image: "/images/china-ancient-landscape.png",
  imageAlt:
    "An ancient Chinese stone landscape beneath distant mountains in restrained natural light.",
  path: "/china",
  shareTitle: "China Is Easy to Visit. It Is Harder to Understand."
});

const chinaMethod = [
  {
    title: "Arrive with practical confidence",
    copy:
      "Shanghai can be a composed first threshold: landing, payments, food, movement, and a more intelligent first read of modern China."
  },
  {
    title: "Choose depth after arrival",
    copy:
      "Go ancient in Shanxi, disciplined in Shaolin, poetic in Huizhou, or stay urban in Shanghai."
  },
  {
    title: "Context over sightseeing",
    copy:
      "Temples, villages, cities, food, etiquette, and history become clearer with local interpretation."
  },
  {
    title: "Local support in the background",
    copy:
      "Transport, timing, restaurants, translation, payments, and day-of adjustments can sit behind the experience while the route keeps what you are seeing, eating, entering, and missing legible."
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

const chinaInquiryHref =
  "/inquiry?type=traveler&route=china-general&sourcePage=%2Fchina&sourceLabel=Localhost%20China%20page";

export default function ChinaPage() {
  const featuredRoutes = chinaJourneys.filter((journey) =>
    ["Shanxi", "Shaolin", "Huizhou", "Shanghai"].includes(journey.place)
  );

  return (
    <>
      <SiteHeader />
      <main id="main-content">
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
            <p className="support-subhead">
              Ancient China, approached through living context.
            </p>
            <p>
              We do not design routes around retro-themed attractions. We look
              for places where ancient China still has weight, silence,
              structure, and continuity.
            </p>
            <Link
              className="button button--dark"
              data-track-event="request_route"
              data-track-source="china_hero"
              href={chinaInquiryHref}
            >
              Request a Private Route
            </Link>
          </div>
        </section>

        <section className="section section--stone">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">How Localhost Works In China</p>
            <h2>Practical confidence first. Cultural reading deeper.</h2>
            <p>
              The route holds the details that make China easier to enter, then
              makes space for the local meaning behind them.
            </p>
          </div>
          <div className="support-card-grid">
            {chinaMethod.map((card) => (
              <article className="support-detail-card" key={card.title}>
                <h3>{card.title}</h3>
                <p>{card.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <CulturalImageLayer {...culturalVisualLayers.china} tone="paper" />

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
                    src={resolveImageSource(journey.image)}
                    alt={journey.alt}
                    fill
                    sizes="(min-width: 900px) 34vw, 100vw"
                  />
                </div>
                <div className="route-entry-copy">
                  <p className="eyebrow">{journey.place}</p>
                  <h3>{journey.line}</h3>
                  <dl className="route-best-for">
                    <dt>Best for</dt>
                    <dd>{journey.bestFor}</dd>
                  </dl>
                  <p>{journey.summary}</p>
                  <Link
                    className="text-link text-link--light"
                    data-track-event="route_select"
                    data-track-route={journey.place}
                    data-track-source="china_featured_routes"
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
              pace, and the kind of understanding you want to leave with.
            </p>
            <div className="inline-actions">
              <Link
                className="button button--dark"
                data-track-event="request_route"
                data-track-source="china_final"
                href={chinaInquiryHref}
              >
                Request a Private Route
              </Link>
              <Link className="text-link" href="/travelers">
                For travelers
              </Link>
            </div>
          </div>
        </section>

        <InquirySection
          compact
          id="china-private-route-inquiry"
          routeContext="china-general"
          sourceLabel="Localhost China page"
          sourcePage="/china"
        />
      </main>
      <SiteFooter />
    </>
  );
}
