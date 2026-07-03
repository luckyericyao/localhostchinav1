import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CulturalImageLayer } from "@/components/CulturalImageLayer";
import { LocalhostIntakeForm } from "@/components/LocalhostIntakeForm";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { chinaJourneys, culturalVisualLayers } from "@/lib/content";

export const metadata: Metadata = {
  title: "Localhost Global — Private China Routes",
  description:
    "A private China-first local-host network for trusted route design, cultural fluency, and practical confidence."
};

const travelerClarityCards = [
  {
    title: "The first hours feel workable",
    copy:
      "Airport or station rhythm, payment setup, ride-hailing, luggage timing, and jet lag are steadied before the route asks more of the traveler."
  },
  {
    title: "Food becomes easier to enter",
    copy:
      "A host can choose the right table, handle ordering, explain dishes, protect dietary needs, and keep the meal from feeling like a test."
  },
  {
    title: "Movement has local judgment",
    copy:
      "Traffic, walking distance, rail transfers, temple entries, restaurant timing, and weather are handled with practical steadiness."
  },
  {
    title: "Context is translated, not simplified",
    copy:
      "Etiquette, history, local habits, and what to notice are explained in plain English without turning the day into a lecture."
  }
];

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
];

const featuredRoutePreview = [
  {
    place: "Shanxi",
    line: "Ancient architecture, Buddhist depth, road-based northern history.",
    length: "4–6 days",
    entry: "Taiyuan or Datong",
    href: "/china/shanxi"
  },
  {
    place: "Shaolin",
    line: "Chan atmosphere, martial discipline, mountain stillness.",
    length: "3–5 days",
    entry: "Zhengzhou or Luoyang",
    href: "/china/shaolin"
  },
  {
    place: "Huizhou",
    line: "Villages, tea, ancestral halls, Huangshan atmosphere.",
    length: "4–6 days",
    entry: "Huangshan, Hangzhou, or Shanghai extension",
    href: "/china/huizhou"
  }
];

const simpleVersion = [
  {
    title: "You do not choose from a fixed tour menu.",
    copy:
      "You tell us what kind of China you want to understand. We shape the route around timing, comfort, curiosity, and fit."
  },
  {
    title: "You are not matched with a random guide.",
    copy:
      "A trusted local host or contact supports the moments where judgment matters: food, movement, etiquette, context, and adjustment."
  },
  {
    title: "You do not solve China alone.",
    copy:
      "Payments, transport, translation, restaurants, timing, and local decisions can be handled quietly in the background."
  }
];

const howItWorks = [
  "Tell us what kind of China you want to enter.",
  "We shape a private route with local context.",
  "A trusted local host helps you enter the place properly.",
  "Logistics, translation, payments, timing, and cultural context are supported."
];

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
];

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
];

const networkLinks = [
  {
    title: "For Travelers",
    copy: "Private routes for travelers who want cultural fluency and practical confidence.",
    href: "/travelers"
  },
  {
    title: "For Hosts",
    copy: "For people who can host with judgment, discretion, and local taste.",
    href: "/hosts"
  },
  {
    title: "Trust Model",
    copy: "Clear boundaries for travelers, hosts, fit, and review before matching.",
    href: "/trust"
  }
];

const homeInquiryHref =
  "/inquiry?type=traveler&sourcePage=%2F&sourceLabel=Homepage";
const homeHeroInquiryHref =
  "/inquiry?type=traveler&sourcePage=%2F&sourceLabel=Homepage%20hero";
const homeFinalInquiryHref =
  "/inquiry?type=traveler&sourcePage=%2F&sourceLabel=Homepage%20final";

export default function Home() {
  const featuredJourneys = chinaJourneys.filter((journey) =>
    ["Shanxi", "Shaolin", "Huizhou", "Shanghai"].includes(journey.place)
  );

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
            <p className="hero-subhead">Private routes shaped by trusted local hosts.</p>
            <p className="hero-body">
              Localhost helps travelers move through China with trusted hosts,
              private route design, cultural context, and practical confidence.
            </p>
            <div className="hero-actions" aria-label="Primary actions">
              <Link className="button button--light" href={homeHeroInquiryHref}>
                Request a Private Route
              </Link>
              <Link className="button button--ghost" href="/journeys">
                Explore China Routes
              </Link>
            </div>
            <p className="positioning-line">
              A private local-host network, starting with China.
            </p>
            <p className="positioning-line">
              Not retro. Not staged. Ancient China, still alive.
            </p>
            <div className="hero-intake-panel">
              <div>
                <p className="eyebrow">Private Review</p>
                <h2>Start with a private route question.</h2>
                <p>Start lightly. A full itinerary is not needed.</p>
              </div>
              <LocalhostIntakeForm
                compact
                embedded
                sourceLabel="Homepage hero"
                sourcePage="/"
              />
            </div>
          </div>
        </section>

        <section className="section section-atmosphere atmosphere-ivory">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">The Simple Version</p>
            <h2>Private China travel, made legible.</h2>
            <p>
              Localhost is for travelers who want local judgment, not a public
              guide marketplace, group tour, or instant booking engine.
            </p>
          </div>
          <div className="support-card-grid support-card-grid--three">
            {simpleVersion.map((item) => (
              <article className="support-detail-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section section-atmosphere atmosphere-gold featured-route-preview-section">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">Featured China Routes</p>
            <h2>Three clear ways into cultural China.</h2>
          </div>
          <div className="arrangement-grid arrangement-grid--three">
            {featuredRoutePreview.map((route) => (
              <Link
                className={`arrangement-card arrangement-card--link featured-route-card featured-route-card--${route.place.toLowerCase()}`}
                href={route.href}
                key={route.place}
              >
                <h3>{route.place}</h3>
                <p>{route.line}</p>
                <p className="featured-route-meta">
                  Ideal length: {route.length}. Entry: {route.entry}.
                </p>
                <span className="arrangement-cue">View Route</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="section section-atmosphere atmosphere-ivory intro-section">
          <div className="section-heading">
            <p className="eyebrow">What Localhost Is</p>
            <h2>Not a tour group. Not a checklist. A private route with local judgment.</h2>
          </div>
          <div className="editorial-copy">
            <p className="lead">
              Standard travel shows you places. Localhost makes them legible.
            </p>
            <p>
              Localhost Global is a private local-host network for travelers
              who want context, host fit, and practical confidence instead of
              standardized tourism.
            </p>
          </div>
        </section>

        <section className="section section-atmosphere atmosphere-clay intro-section real-ancient-section">
          <div className="section-heading">
            <p className="eyebrow">Real Ancient China</p>
            <h2>Older, quieter China still carries weight.</h2>
          </div>
          <div className="editorial-copy">
            <p className="lead">
              Not retro. Not staged. Ancient China, still alive.
            </p>
            <p>
              Localhost China is not built around retro nostalgia or staged
              cultural spectacle. We focus on older, quieter China: ancient
              capitals, ritual landscapes, temples, grottoes, stone roads,
              walled cities, and the living context behind them.
            </p>
          </div>
        </section>

        <CulturalImageLayer {...culturalVisualLayers.home} tone="dark" />

        <section className="section section-atmosphere atmosphere-mist">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">Private Route Scope</p>
            <h2>What a Private Route Includes</h2>
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

        <section className="section section-atmosphere atmosphere-clay-soft">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">Ease For International Visitors</p>
            <h2>The value is fewer moments of guesswork.</h2>
            <p>
              Localhost does not add noise to the trip. It removes the parts
              where unfamiliar systems, timing, food, and etiquette make China
              harder to read than it needs to be.
            </p>
          </div>
          <div className="support-card-grid">
            {travelerClarityCards.map((card) => (
              <article className="support-detail-card" key={card.title}>
                <h3>{card.title}</h3>
                <p>{card.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section section-atmosphere atmosphere-ink split-layout">
          <div className="section-heading">
            <p className="eyebrow">Why China First</p>
            <h2>China is easy to visit. It is harder to understand.</h2>
          </div>
          <div className="editorial-copy">
            <p className="lead">
              Payments, language, food culture, transport, social context, city
              rhythm, and regional depth shape every day.
            </p>
            <p>
              China rewards local fluency. Localhost China begins with people
              who can help travelers move with confidence and understand what
              they are seeing.
            </p>
            <Link className="text-link" href="/china">
              Enter the China chapter
            </Link>
          </div>
        </section>

        <section className="section section-atmosphere atmosphere-routes route-scroll-section" id="journeys">
          <div className="section-heading">
            <p className="eyebrow">Featured China Routes</p>
            <h2>Four private routes into cultural China.</h2>
          </div>
          <div className="journey-grid">
            {featuredJourneys.map((journey) => (
              <Link
                className="visual-journey-card"
                href={journey.href}
                key={journey.place}
              >
                <span className="visual-journey-media">
                  <Image
                    src={journey.image}
                    alt={journey.alt}
                    fill
                    sizes="(min-width: 900px) 30vw, 100vw"
                  />
                </span>
                <span className="visual-journey-copy">
                  <span>{journey.place}</span>
                  <strong>{journey.line}</strong>
                  <dl className="journey-best-for">
                    <dt>Best for</dt>
                    <dd>{journey.bestFor}</dd>
                  </dl>
                  <small>{journey.summary}</small>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="section section-atmosphere atmosphere-gold-soft">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">How It Works</p>
            <h2>A private route begins with a serious question.</h2>
          </div>
          <ol className="rhythm-list">
            {howItWorks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </section>

        <section className="section section-atmosphere atmosphere-mist-soft">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">Private China Intake</p>
            <h2>Three ways to enter China</h2>
          </div>
          <div className="support-card-grid support-card-grid--three">
            {entryWays.map((item) => (
              <article className="support-detail-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section section-atmosphere atmosphere-dark">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">Two-Sided Network</p>
            <h2>Travelers, hosts, and reciprocal hospitality.</h2>
          </div>
          <div className="arrangement-grid arrangement-grid--three">
            {networkLinks.map((item) => (
              <Link
                className="arrangement-card arrangement-card--link"
                href={item.href}
                key={item.title}
              >
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
                <span className="arrangement-cue">Enter</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="section section-atmosphere atmosphere-dusk final-section">
          <div className="section-heading">
            <p className="eyebrow">Localhost China</p>
            <h2>Start with China. Build carefully from there.</h2>
          </div>
          <div className="editorial-copy">
            <p>
              Localhost begins with China as a working chapter: real routes,
              host judgment, practical support, and cultural fluency before
              scale.
            </p>
            <div className="inline-actions">
              <Link className="button button--dark" href={homeFinalInquiryHref}>
                Request a Private Route
              </Link>
              <Link className="text-link" href="/china">
                Explore China Routes
              </Link>
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
              <Link className="button button--dark" href={homeInquiryHref}>
                Request Private Route Review
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
