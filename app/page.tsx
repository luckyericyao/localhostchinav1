import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { culturalVisualLayers } from "@/lib/content";

export const metadata: Metadata = {
  title: "Localhost Global — Private China Routes",
  description:
    "A private China-first local-host network for trusted route design, cultural fluency, and practical confidence."
};

const featuredRoutePreview = [
  {
    place: "Shanxi",
    line: "Ancient architecture, Buddhist depth, road-based northern history.",
    length: "4–6 days",
    entry: "Taiyuan or Datong",
    bestFor: "Ancient architecture, Buddhist depth, northern road history",
    summary:
      "Caves, timber halls, merchant courtyards, mountain roads, and the northern China that rewards patient context.",
    image: "/images/shanxi-ancient-grotto.png",
    alt: "Weathered Buddhist grotto stone and old timber temple architecture in Shanxi.",
    href: "/china/shanxi"
  },
  {
    place: "Shaolin",
    line: "Chan atmosphere, martial discipline, mountain stillness.",
    length: "3–5 days",
    entry: "Zhengzhou or Luoyang",
    bestFor: "Chan heritage, practice culture, mountain stillness",
    summary:
      "Temple atmosphere, Songshan paths, martial practice, and a quieter entry beyond kung fu spectacle.",
    image: "/images/shaolin-temple-gate.png",
    alt: "Shaolin Temple courtyard beneath Songshan mountain haze in restrained morning light.",
    href: "/china/shaolin"
  },
  {
    place: "Huizhou",
    line: "Villages, tea, ancestral halls, Huangshan atmosphere.",
    length: "4–6 days",
    entry: "Huangshan, Hangzhou, or Shanghai extension",
    bestFor: "Villages, tea, ancestral halls, ink landscape",
    summary:
      "White walls, black tiles, tea tables, mist, ancestral halls, and the slower intelligence of southern built culture.",
    image: "/images/huizhou-rain-courtyard.png",
    alt: "A rain-washed Huizhou lane with white walls, dark tiled roofs, and mountain mist.",
    href: "/china/huizhou"
  },
  {
    place: "Shanghai",
    line: "Your first stop, properly read.",
    length: "2–4 days",
    entry: "Pudong, Hongqiao, or rail arrival",
    bestFor: "First arrival, Bund context, food, after-dark rhythm",
    summary:
      "A composed first reading of modern China through river architecture, a considered table, and a quiet night ending.",
    image: "/images/shanghai-bund-walk.png",
    alt: "A quiet early evening walk along the Bund in Shanghai with historic riverfront architecture.",
    href: "/china/shanghai"
  }
] as const;

const privateRouteIncludes = [
  {
    title: "Private route design",
    copy:
      "A route shaped around timing, interests, comfort level, cultural reading, and the China the traveler wants to understand."
  },
  {
    title: "Trusted local host matching",
    copy:
      "A selected local host or local contact matched for judgment, cultural fluency, reliability, and route fit."
  },
  {
    title: "Practical support",
    copy:
      "Transport rhythm, meals, payments, translation, communication, and small local decisions handled in the background."
  },
  {
    title: "Cultural context",
    copy:
      "Before and during the route, Localhost helps the traveler understand what they are seeing, eating, entering, and missing."
  }
] as const;

const trustPreview = [
  {
    title: "Selected hosts, not open listings",
    copy:
      "Hosts are reviewed for judgment, reliability, communication, and cultural fluency."
  },
  {
    title: "Reviewed intent before matching",
    copy:
      "A route is shaped only after timing, comfort, curiosity, and host fit are understood."
  },
  {
    title: "Clear boundaries on both sides",
    copy:
      "Hosts are not servants, entertainers, or 24/7 staff. Travelers are expected to respect local dignity."
  }
] as const;

const howItWorks = [
  "Tell us what kind of China you want to enter.",
  "We shape a private route with local context.",
  "A trusted local host helps you enter the place properly.",
  "Logistics, translation, payments, timing, and cultural context are supported."
] as const;

const entryWays = [
  {
    title: "Route Advisory",
    copy:
      "Direction, timing, cultural context, food, and practical preparation before you move independently."
  },
  {
    title: "Hosted Private Route",
    copy:
      "A selected host joins key moments: meals, movement, interpretation, and decisions where local judgment matters."
  },
  {
    title: "Fully Held China Route",
    copy:
      "Route design, host layer, logistics, timing, translation, payments, and day-to-day support held together."
  }
] as const;

const homeInquiryHref =
  "/inquiry?type=traveler&sourcePage=%2F&sourceLabel=Homepage";

export default function Home() {
  return (
    <>
      <main>
        <section className="hero">
          <Image
            src="/images/temple-of-heaven-centered-hero.png"
            alt="The Temple of Heaven Hall of Prayer for Good Harvests centered in quiet morning light."
            fill
            priority
            className="hero-image"
            sizes="100vw"
          />
          <div className="hero-shade" />
          <SiteHeader tone="transparent" />
          <div className="hero-content">
            <p className="eyebrow">Localhost Global</p>
            <h1>Enter China With Local Judgment.</h1>
            <p className="hero-subhead">
              Private routes shaped by trusted local hosts.
            </p>
            <p className="hero-body">
              Localhost helps travelers move through China with trusted hosts,
              private route design, cultural context, and practical confidence.
            </p>
            <div className="hero-actions" aria-label="Primary actions">
              <Link
                className="button button--light"
                data-track-event="hero_cta"
                data-track-source="homepage"
                href={homeInquiryHref}
              >
                Request a Private Route
              </Link>
              <Link className="button button--ghost" href="/journeys">
                Explore China Routes
              </Link>
            </div>
            <p className="positioning-line">
              A private local-host network, starting with China.
            </p>
          </div>
        </section>

        <section
          className="section section-atmosphere atmosphere-routes"
          id="featured-routes"
        >
          <div className="section-heading section-heading--center">
            <p className="eyebrow">Featured China Routes</p>
            <h2>Choose the China you want to enter first.</h2>
            <p>
              Four distinct thresholds, each shaped around a different kind of
              attention.
            </p>
          </div>
          <div className="journey-grid">
            {featuredRoutePreview.map((route) => (
              <Link
                className="visual-journey-card"
                data-track-event="route_view"
                data-track-route={route.place}
                href={route.href}
                key={route.place}
              >
                <span className="visual-journey-media">
                  <Image
                    src={route.image}
                    alt={route.alt}
                    fill
                    sizes="(min-width: 900px) 25vw, 100vw"
                  />
                </span>
                <span className="visual-journey-copy">
                  <span>{route.place}</span>
                  <strong>{route.line}</strong>
                  <dl className="journey-best-for">
                    <dt>Best for</dt>
                    <dd>{route.bestFor}</dd>
                    <dt>Length / entry</dt>
                    <dd>
                      {route.length} · {route.entry}
                    </dd>
                  </dl>
                  <small>{route.summary}</small>
                  <span className="arrangement-cue">View Route</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="section cultural-layer cultural-layer--paper">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">Real Ancient China</p>
            <h2>Older, quieter China still carries weight.</h2>
            <p>
              Ancient capitals, ritual landscapes, temples, grottoes, stone
              roads, walled cities, and the living context behind them.
            </p>
          </div>
          <div className="cultural-layer-grid cultural-layer-grid--4">
            {culturalVisualLayers.home.items.map((item) => (
              <article
                className="cultural-layer-card"
                key={item.src}
              >
                <div className="cultural-layer-media">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="(min-width: 900px) 25vw, 100vw"
                  />
                </div>
                <div className="cultural-layer-copy">
                  <h3>{item.title}</h3>
                  <p>{item.copy}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section section-atmosphere atmosphere-mist">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">What Localhost Is</p>
            <h2>Private China travel, made legible.</h2>
            <p>
              A private local-host network for travelers who want route design,
              host fit, practical confidence, and cultural context.
            </p>
          </div>
          <div className="support-card-grid">
            {privateRouteIncludes.map((item) => (
              <article className="support-detail-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section section-atmosphere atmosphere-dark trust-preview-section">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">Trust Model</p>
            <h2>Trust before scale.</h2>
            <p>
              A local-host network only works when both travelers and hosts are
              protected.
            </p>
          </div>
          <div className="support-card-grid support-card-grid--three">
            {trustPreview.map((item) => (
              <article className="support-detail-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
          <div className="section-action">
            <Link className="text-link" href="/trust">
              Read the trust model
            </Link>
          </div>
        </section>

        <section className="section section-atmosphere atmosphere-gold-soft split-layout">
          <div className="section-heading">
            <p className="eyebrow">How It Works</p>
            <h2>A private route begins with a serious question.</h2>
          </div>
          <div>
            <ol className="rhythm-list">
              {howItWorks.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
            <div className="support-card-grid support-card-grid--three home-entry-ways">
              {entryWays.map((item) => (
                <article className="support-detail-card" key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-atmosphere atmosphere-dusk-soft section--inquiry inquiry-preview-section">
          <div className="inquiry-preview">
            <div className="section-heading">
              <p className="eyebrow">Private Route Review</p>
              <h2>Begin with the China you want to understand.</h2>
            </div>
            <div className="editorial-copy">
              <p>
                Every private route begins with a review of intent, timing,
                comfort, curiosity, and host fit. This is not instant booking.
              </p>
              <Link
                className="button button--dark"
                data-track-event="request_route"
                data-track-source="homepage_final"
                href={homeInquiryHref}
              >
                Request a Private Route
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
