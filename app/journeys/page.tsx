import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { chinaJourneys, futureChinaJourneys } from "@/lib/content";

export const metadata: Metadata = {
  title: "China Journeys — Localhost Global",
  description:
    "A Localhost China cultural atlas: Shanxi, Shaolin, Huizhou, and future chapters held as cultural entry points."
};

const atlasEntries = [
  {
    mode: "Ancient China",
    place: "Shanxi",
    href: "/china/shanxi",
    status: "Active Chapter",
    copy:
      "Wood temples, Buddhist mountains, merchant courtyards, noodles, vinegar, Fenjiu, and northern historical weight."
  },
  {
    mode: "Discipline & Practice",
    place: "Shaolin",
    href: "/china/shaolin",
    status: "Active Chapter",
    copy:
      "Chan atmosphere, martial discipline, monastery rhythm, mountain paths, and restraint before spectacle."
  },
  {
    mode: "Ink Landscape & Merchant Culture",
    place: "Huizhou",
    href: "/china/huizhou",
    status: "Active Chapter",
    copy:
      "White walls, black tiles, ancestral halls, tea, mist, merchant memory, and inward southern beauty."
  },
  {
    mode: "Modern Urban China",
    place: "Shanghai",
    href: "/china",
    status: "Future Chapter",
    copy:
      "Neighborhood design, food, street rhythm, contemporary ambition, and modern China below the skyline."
  },
  {
    mode: "Imperial Memory & Capital Rhythm",
    place: "Beijing",
    href: "/china",
    status: "Future Chapter",
    copy:
      "Power, history, courtyards, state memory, everyday life, and the habits of the capital."
  },
  {
    mode: "Food, Tea & Soft Time",
    place: "Chengdu",
    href: "/china",
    status: "Future Chapter",
    copy:
      "Tea houses, Sichuan food culture, conversation, slower intelligence, and the art of staying awhile."
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
        <section className="page-hero support-hero">
          <div>
            <p className="eyebrow">Journeys</p>
            <h1>A cultural atlas for the China you want to enter.</h1>
          </div>
          <div className="page-hero-copy">
            <p>
              Localhost routes are shaped around local rhythm, cultural
              decoding, practical confidence, and the questions travelers bring.
              They are not fixed tour products.
            </p>
            <Link className="button button--dark" href="/inquiry">
              Request a Private Route
            </Link>
          </div>
        </section>

        <section className="section">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">Choose By Cultural Threshold</p>
            <h2>Choose by the China you want to enter.</h2>
          </div>
          <div className="atlas-grid">
            {atlasEntries.map((entry) => (
              <Link className="atlas-card" href={entry.href} key={entry.mode}>
                <span className="status-pill">{entry.status}</span>
                <strong>{entry.mode}</strong>
                <span>{entry.place}</span>
                <p>{entry.copy}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="section section--dark">
          <div className="section-heading">
            <p className="eyebrow">Active China Chapters</p>
            <h2>Private routes with real pages and local context.</h2>
          </div>
          <div className="journey-grid">
            {activeJourneys.map((journey) => (
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
                  <small>{journey.summary}</small>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="section section--stone">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">Future China Chapters</p>
            <h2>Held as future routes until the local chapter is ready.</h2>
          </div>
          <div className="arrangement-grid arrangement-grid--three">
            {futureJourneys.map((journey) => (
              <article className="arrangement-card journey-status-card" key={journey.place}>
                <span className="status-pill">Future Chapter</span>
                <h3>{journey.place}</h3>
                <p className="journey-status-line">{journey.line}</p>
                <p>{journey.summary}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section final-section">
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
