import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import {
  chinaJourneys,
  chinaRoutePages,
  futureChinaJourneys
} from "@/lib/content";

export const metadata: Metadata = {
  title: "China Routes — Localhost Global",
  description:
    "Compare the active Localhost China routes by cultural focus, pace, entry point, and practical fit."
};

const activeRouteKeys = [
  { key: "shanxi", place: "Shanxi" },
  { key: "shaolin", place: "Shaolin" },
  { key: "huizhou", place: "Huizhou" },
  { key: "shanghai", place: "Shanghai" }
] as const;

type RoutePage = (typeof chinaRoutePages)[keyof typeof chinaRoutePages];

function snapshotValue(route: RoutePage, label: string) {
  return route.snapshot.find((item) => item.label === label)?.value || "To be shaped";
}

const journeysInquiryHref =
  "/inquiry?type=traveler&sourcePage=%2Fjourneys&sourceLabel=China%20Routes%20page";

export default function JourneysPage() {
  const activeJourneys = activeRouteKeys.map(({ key, place }) => ({
    journey: chinaJourneys.find((item) => item.place === place)!,
    route: chinaRoutePages[key]
  }));

  return (
    <>
      <SiteHeader />
      <main>
        <section className="page-hero support-hero journeys-hero">
          <div className="journeys-hero-atmosphere reveal-image--background" />
          <div>
            <p className="eyebrow">China Routes</p>
            <h1>Choose a China that matches your attention.</h1>
          </div>
          <div className="page-hero-copy">
            <p>
              Four active chapters, each with a different cultural temperature,
              pace, entry point, and kind of local judgment.
            </p>
            <Link className="button button--dark" href={journeysInquiryHref}>
              Request a Private Route
            </Link>
          </div>
        </section>

        <section className="section section-atmosphere atmosphere-gold-soft journeys-selector-section">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">Route Selector</p>
            <h2>Which China should you enter first?</h2>
            <p>
              Start with the route shape, then open the chapter that deserves a
              closer read.
            </p>
          </div>
          <div className="journey-comparison-grid">
            {activeJourneys.map(({ journey, route }) => (
              <RevealOnScroll
                className="journey-comparison-reveal"
                key={journey.place}
              >
                <Link
                  className="journey-comparison-card"
                  href={journey.href}
                >
                  <span className="journey-comparison-media">
                    <Image
                      src={journey.image}
                      alt={journey.alt}
                      fill
                      sizes="(min-width: 1100px) 25vw, (min-width: 720px) 50vw, 100vw"
                    />
                  </span>
                  <span className="journey-comparison-copy">
                    <span className="journey-comparison-kicker">
                      Active chapter
                    </span>
                    <h3>{journey.place}</h3>
                    <strong>{journey.line}</strong>
                    <p>{journey.summary}</p>
                    <dl className="journey-comparison-meta">
                      <div>
                        <dt>Best for</dt>
                        <dd>{journey.bestFor}</dd>
                      </div>
                      <div>
                        <dt>Length / entry</dt>
                        <dd>
                          {snapshotValue(route, "Ideal Length")} · {snapshotValue(route, "Entry")}
                        </dd>
                      </div>
                      <div>
                        <dt>Pace / demand</dt>
                        <dd>
                          {snapshotValue(route, "Pace")} · {snapshotValue(route, "Physical Demand")}
                        </dd>
                      </div>
                    </dl>
                    <span className="arrangement-cue">View route</span>
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
            <p>
              Beijing and Chengdu stay secondary until their local host layer
              and route standards are ready to be held properly.
            </p>
          </div>
          <div className="arrangement-grid arrangement-grid--three">
            {futureChinaJourneys.map((journey) => (
              <article
                className="arrangement-card journey-status-card"
                key={journey.place}
              >
                <span className="status-pill">Future Chapter</span>
                <h3>{journey.place}</h3>
                <p className="journey-status-line">{journey.line}</p>
                <p>{journey.summary}</p>
              </article>
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
              <Link className="button button--dark" href={journeysInquiryHref}>
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
