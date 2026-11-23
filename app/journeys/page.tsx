import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import {
  chinaJourneys,
  chinaRoutePages,
  futureChinaJourneys
} from "@/lib/content";
import { resolveImageSource } from "@/lib/image";
import { discoveryChapters } from "@/lib/discovery";
import { buildLocalhostPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildLocalhostPageMetadata({
  title: "China Routes — Localhost Global",
  description:
    "Compare four active private China routes by cultural focus, pace, entry point, host role, and practical fit.",
  image: "/images/real-ancient-china-hero.png",
  imageAlt:
    "A quiet ancient Chinese stone path leading through a restrained mountain landscape.",
  path: "/journeys",
  shareTitle: "Four Private Ways Into China"
});

type RoutePage = (typeof chinaRoutePages)[keyof typeof chinaRoutePages];

function snapshotValue(route: RoutePage, label: string) {
  return route.snapshot.find((item) => item.label === label)?.value || "To be shaped";
}

const journeysInquiryHref =
  "/inquiry?type=traveler&sourcePage=%2Fjourneys&sourceLabel=China%20Routes%20page";

export default function JourneysPage() {
  const activeJourneys = discoveryChapters.map(({ slug, place }) => {
    const journey = chinaJourneys.find((item) => item.place === place)!;
    const route = chinaRoutePages[slug];
    return {
      journey,
      facts: [
        { id: `${slug}-best-for`, label: "Best for", value: journey.bestFor },
        {
          id: `${slug}-length-entry`,
          label: "Length / entry",
          value: `${snapshotValue(route, "Ideal Length")} · ${snapshotValue(route, "Entry")}`
        },
        { id: `${slug}-pace`, label: "Pace", value: snapshotValue(route, "Pace"), wide: true }
      ]
    };
  });

  return (
    <>
      <SiteHeader discovery />
      <main id="main-content" tabIndex={-1} className="journeys-index">
        <section className="section journeys-decision-section">
          <header className="journeys-decision-header">
            <div>
              <p className="eyebrow">China Routes</p>
              <h1>Four routes into China.</h1>
            </div>
            <div className="journeys-decision-copy">
              <p>
                Compare focus, pace, length, and arrival city.
              </p>
              <Link
                className="text-link"
                href="/china"
              >
                Explore the regional context
              </Link>
            </div>
          </header>
          <div className="journey-comparison-grid">
            {activeJourneys.map(({ journey, facts }) => (
              <div
                className="journey-comparison-reveal"
                key={journey.place}
              >
                <Link
                  aria-describedby={facts.map(({ id }) => `${id}-term ${id}-value`).join(" ")}
                  aria-label={`View ${journey.place}`}
                  className="journey-comparison-card"
                  data-track-event="route_select"
                  data-track-route={journey.place}
                  data-track-source="journeys_comparison"
                  href={journey.href}
                >
                  <span className="journey-comparison-media">
                    <Image
                      src={resolveImageSource(journey.image)}
                      alt={journey.alt}
                      fill
                      sizes="(max-width: 720px) 68px, (min-width: 1021px) 25vw, 50vw"
                    />
                  </span>
                  <div className="journey-comparison-copy">
                    <span className="journey-comparison-kicker">
                      {journey.place === "Shanxi"
                        ? "Flagship route"
                        : "Active route"}
                    </span>
                    <h2>{journey.place}</h2>
                    <strong>{journey.line}</strong>
                    <dl className="journey-comparison-meta">
                      {facts.map(({ id, label, value, wide }) => (
                        <div className={wide ? "journey-comparison-meta-wide" : undefined} key={id}>
                          <dt id={`${id}-term`}>{label}</dt>
                          <dd id={`${id}-value`}>{value}</dd>
                        </div>
                      ))}
                    </dl>
                    <span className="arrangement-cue">{`View ${journey.place}`}</span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="section section--stone journeys-future-section">
          <div className="section-heading">
            <p className="eyebrow">Future China Chapters</p>
            <h2>Further chapters, not current routes.</h2>
            <p>
              Beijing and Chengdu remain in development. They are not offered
              as confirmed Localhost routes.
            </p>
          </div>
          <ul className="journeys-future-list">
            {futureChinaJourneys.map((journey) => (
              <li key={journey.place}>{journey.place}</li>
            ))}
          </ul>
        </section>

        <section className="discovery-conversation">
            <p className="eyebrow">A conversation</p>
            <h2>A first direction is enough.</h2>
            <p>Share the chapter that interests you, your timing, and any questions about the practical fit. A person reviews the details before anything is confirmed.</p>
            <div className="discovery-context-links">
              <Link
                className="text-link"
                data-track-event="request_route"
                data-track-source="journeys_final"
                href={journeysInquiryHref}
              >
                Begin a conversation
              </Link>
              <Link className="text-link" href="/china">
                Return to China
              </Link>
            </div>
        </section>
      </main>
      <SiteFooter discovery />
    </>
  );
}
