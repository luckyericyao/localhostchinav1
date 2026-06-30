import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { chinaJourneys, futureChinaJourneys } from "@/lib/content";

export const metadata: Metadata = {
  title: "China Routes — Localhost Global",
  description:
    "A Localhost China journey atlas: Shanxi, Shaolin, Huizhou, and future chapters held as cultural entry points."
};

const atlasEntries = [
  {
    mode: "Ancient China",
    place: "Shanxi",
    href: "/china/shanxi",
    status: "Active Chapter",
    mood: "Heavy, ancient, road-based",
    pace: "Measured and history-rich",
    hostType: "Cultural Host / Route Host",
    copy:
      "Wood temples, Buddhist mountains, merchant courtyards, noodles, vinegar, Fenjiu, and northern historical weight."
  },
  {
    mode: "Discipline & Practice",
    place: "Shaolin",
    href: "/china/shaolin",
    status: "Active Chapter",
    mood: "Restrained, disciplined, mountain stillness",
    pace: "Slow mornings and selective movement",
    hostType: "Specialist Host / Cultural Host",
    copy:
      "Chan atmosphere, martial discipline, monastery rhythm, mountain paths, and restraint before spectacle."
  },
  {
    mode: "Ink Landscape & Merchant Culture",
    place: "Huizhou",
    href: "/china/huizhou",
    status: "Active Chapter",
    mood: "Poetic, quiet, inward",
    pace: "Slow, weather-aware, intimate",
    hostType: "Cultural Host / Specialist Host",
    copy:
      "White walls, black tiles, ancestral halls, tea, mist, merchant memory, and inward southern beauty."
  },
  {
    mode: "Modern Urban China",
    place: "Shanghai",
    href: "/china",
    status: "Future Chapter",
    mood: "Contemporary, street-level, layered",
    pace: "Flexible urban rhythm",
    hostType: "Route Host / Chapter Lead",
    copy:
      "Neighborhood design, food, street rhythm, contemporary ambition, and modern China below the skyline."
  },
  {
    mode: "Imperial Memory & Capital Rhythm",
    place: "Beijing",
    href: "/china",
    status: "Future Chapter",
    mood: "Historical, political, everyday",
    pace: "Dense but deliberate",
    hostType: "Cultural Host / Specialist Host",
    copy:
      "Power, history, courtyards, state memory, everyday life, and the habits of the capital."
  },
  {
    mode: "Food, Tea & Soft Time",
    place: "Chengdu",
    href: "/china",
    status: "Future Chapter",
    mood: "Soft, social, sensory",
    pace: "Slow and table-centered",
    hostType: "Cultural Host / Route Host",
    copy:
      "Tea houses, Sichuan food culture, conversation, slower intelligence, and the art of staying awhile."
  }
];

const routeSelector = [
  {
    title: "Shanxi",
    href: "/china/shanxi",
    copy:
      "Choose this if you want ancient weight: Buddhist caves, timber halls, merchant courtyards, noodles, Fenjiu, and northern road history."
  },
  {
    title: "Shaolin",
    href: "/china/shaolin",
    copy:
      "Choose this if you want discipline: Chan atmosphere, martial practice, temple rhythm, mountain stillness, and restraint before spectacle."
  },
  {
    title: "Huizhou",
    href: "/china/huizhou",
    copy:
      "Choose this if you want poetic southern China: villages, tea, ancestral halls, mist, white walls, black tiles, and ink landscape."
  }
];

export default function JourneysPage() {
  const activeJourneys = chinaJourneys.filter((journey) =>
    ["Shanxi", "Shaolin", "Huizhou"].includes(journey.place)
  );
  const shanghai = chinaJourneys.find((journey) => journey.place === "Shanghai");
  const futureJourneys = [
    ...(shanghai ? [{ ...shanghai, href: "/china" }] : []),
    ...futureChinaJourneys
  ];

  return (
    <>
      <SiteHeader />
      <main>
        <section className="page-hero support-hero journeys-hero">
          <RevealOnScroll className="journeys-hero-atmosphere reveal-image--background" />
          <div>
            <p className="eyebrow">China Routes</p>
            <h1>A cultural atlas for the China you want to enter.</h1>
          </div>
          <div className="page-hero-copy">
            <p>
              Localhost routes are shaped around timing, food, movement,
              judgment, cultural decoding, practical confidence, and the
              questions travelers bring. They are not fixed tour products.
            </p>
            <Link className="button button--dark" href="/inquiry">
              Request a Private Route
            </Link>
          </div>
        </section>

        <section className="section section-atmosphere atmosphere-gold-soft journeys-selector-section">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">Route Selector</p>
            <h2>Which China should you enter first?</h2>
          </div>
          <div className="arrangement-grid arrangement-grid--three">
            {routeSelector.map((route) => (
              <RevealOnScroll
                className={`route-selector-reveal route-atmosphere route-atmosphere--${route.title.toLowerCase()}`}
                key={route.title}
              >
                <Link
                  className="arrangement-card arrangement-card--link route-selector-card"
                  href={route.href}
                >
                  <h3>{route.title}</h3>
                  <p>{route.copy}</p>
                  <span className="arrangement-cue">View route</span>
                </Link>
              </RevealOnScroll>
            ))}
          </div>
        </section>

        <section className="section section-atmosphere atmosphere-ink journeys-atlas-section">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">Choose By Cultural Threshold</p>
            <h2>Choose by the China you want to enter.</h2>
          </div>
          <div className="atlas-grid">
            {atlasEntries.map((entry) => (
              <RevealOnScroll
                className={`atlas-reveal atlas-reveal--${entry.place.toLowerCase()}`}
                key={entry.mode}
              >
                <Link className="atlas-card" href={entry.href}>
                  <span className="status-pill">{entry.status}</span>
                  <strong>{entry.mode}</strong>
                  <span>{entry.place}</span>
                  <dl className="atlas-meta">
                    <div>
                      <dt>Mood</dt>
                      <dd>{entry.mood}</dd>
                    </div>
                    <div>
                      <dt>Pace</dt>
                      <dd>{entry.pace}</dd>
                    </div>
                    <div>
                      <dt>Best With</dt>
                      <dd>{entry.hostType}</dd>
                    </div>
                  </dl>
                  <p>{entry.copy}</p>
                </Link>
              </RevealOnScroll>
            ))}
          </div>
        </section>

        <section className="section section-atmosphere atmosphere-routes journeys-active-section">
          <div className="section-heading">
            <p className="eyebrow">Active China Chapters</p>
            <h2>Private routes with real pages and local context.</h2>
          </div>
          <div className="journey-grid">
            {activeJourneys.map((journey) => (
              <RevealOnScroll
                className="visual-journey-reveal"
                key={journey.place}
              >
                <Link
                  className="visual-journey-card"
                  href={journey.href}
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
              </RevealOnScroll>
            ))}
          </div>
        </section>

        <section className="section section-atmosphere atmosphere-mist-soft journeys-future-section">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">Future China Chapters</p>
            <h2>Held as future routes until the local chapter is ready.</h2>
          </div>
          <div className="arrangement-grid arrangement-grid--three">
            {futureJourneys.map((journey) => (
              <RevealOnScroll
                className={`journey-status-reveal future-atmosphere future-atmosphere--${journey.place.toLowerCase()}`}
                key={journey.place}
              >
                <article className="arrangement-card journey-status-card">
                  <span className="status-pill">Future Chapter</span>
                  <h3>{journey.place}</h3>
                  <p className="journey-status-line">{journey.line}</p>
                  <p>{journey.summary}</p>
                </article>
              </RevealOnScroll>
            ))}
          </div>
        </section>

        <section className="section section-atmosphere atmosphere-dusk final-section journeys-final-section">
          <div className="section-heading">
            <p className="eyebrow">Private Route Inquiry</p>
            <h2>Start with what you want to understand.</h2>
          </div>
          <div className="editorial-copy">
            <p>
              The right China route begins with curiosity, pace, timing, and the
              kind of local context that would make the place legible.
            </p>
            <div className="inline-actions">
              <Link className="button button--dark" href="/inquiry">
                Request a Private Route
              </Link>
              <Link className="text-link" href="/china">
                Return to Localhost China
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
