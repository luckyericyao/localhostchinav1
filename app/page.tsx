import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { InquirySection } from "@/components/InquirySection";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { chinaJourneys } from "@/lib/content";

export const metadata: Metadata = {
  title: "Localhost Global — Travel Back Home.",
  description:
    "A quiet local-host network for thoughtful travelers, trusted hosts, private routes, and cultural context, starting with China."
};

const localhostCards = [
  {
    title: "Local access",
    copy:
      "Trusted people help travelers enter the real texture of a place: streets, food, rhythm, and daily judgment."
  },
  {
    title: "Cultural decoding",
    copy:
      "A host explains context, etiquette, history, and what a traveler would not easily read alone."
  },
  {
    title: "Seamless support",
    copy:
      "Route timing, translation, payments, transport, restaurants, and small local decisions are held with care."
  }
];

const howItWorks = [
  "Tell us what kind of China you want to enter.",
  "We shape a private route with local context.",
  "A trusted local host helps you enter the place properly.",
  "Logistics, translation, payments, timing, and cultural context are supported."
];

const networkLinks = [
  {
    title: "For Travelers",
    copy: "Private routes for people who want context, not content.",
    href: "/travelers"
  },
  {
    title: "For Hosts",
    copy: "A way to represent your home with dignity, patience, and taste.",
    href: "/hosts"
  },
  {
    title: "Host Credits",
    copy: "Host at home. Travel back home somewhere else.",
    href: "/host-credits"
  }
];

export default function Home() {
  const featuredJourneys = chinaJourneys.filter((journey) =>
    ["Shanxi", "Shaolin", "Huizhou"].includes(journey.place)
  );

  return (
    <>
      <main>
        <section className="hero">
          <Image
            src="/images/temple-of-heaven-hero.png"
            alt="Temple of Heaven architecture under spacious morning sky in Beijing."
            fill
            priority
            className="hero-image"
            sizes="100vw"
          />
          <div className="hero-shade" />
          <SiteHeader tone="transparent" />
          <div className="hero-content">
            <p className="eyebrow">Localhost Global</p>
            <h1>Travel Back Home.</h1>
            <p className="hero-subhead">Every place is someone&apos;s home.</p>
            <p className="hero-body">
              Localhost helps thoughtful travelers enter a place through trusted
              local people, private routes, and cultural context.
            </p>
            <div className="hero-actions" aria-label="Primary actions">
              <Link className="button button--light" href="/inquiry">
                Request a Private Route
              </Link>
              <Link className="button button--ghost" href="/hosts">
                Become a Host
              </Link>
              <Link className="button button--ghost" href="/china">
                Explore China chapters
              </Link>
            </div>
            <p className="positioning-line">
              A private local-host network, starting with China.
            </p>
          </div>
        </section>

        <section className="section intro-section">
          <div className="section-heading">
            <p className="eyebrow">What Localhost Is</p>
            <h2>Not a tour group. Not a checklist. A local way in.</h2>
          </div>
          <div className="editorial-copy">
            <p className="lead">
              Standard travel shows you places. Localhost helps you enter them.
            </p>
            <p>
              Localhost Global is a private local-host network for thoughtful
              travelers who want to enter a place through trusted people, not
              consume it through standard tourism.
            </p>
          </div>
        </section>

        <section className="section section--stone">
          <div className="arrangement-grid arrangement-grid--three">
            {localhostCards.map((card) => (
              <article className="arrangement-card" key={card.title}>
                <h3>{card.title}</h3>
                <p>{card.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section split-layout">
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

        <section className="section section--dark" id="journeys">
          <div className="section-heading">
            <p className="eyebrow">Featured China Chapters</p>
            <h2>Three private routes into cultural China.</h2>
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
                  <small>{journey.summary}</small>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">How It Works</p>
            <h2>A private route begins with a human question.</h2>
          </div>
          <ol className="rhythm-list">
            {howItWorks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </section>

        <section className="section section--stone">
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

        <section className="section final-section">
          <div className="section-heading">
            <p className="eyebrow">Travel Back Home</p>
            <h2>Start with China. Build toward the world.</h2>
          </div>
          <div className="editorial-copy">
            <p>
              Localhost begins with China as the first chapter of a global
              network where every place is someone&apos;s home.
            </p>
            <div className="inline-actions">
              <Link className="button button--dark" href="/inquiry">
                Request a Private Route
              </Link>
              <Link className="text-link" href="/china">
                Explore China chapters
              </Link>
            </div>
          </div>
        </section>

        <InquirySection id="private-route-inquiry" compact />
      </main>
      <SiteFooter />
    </>
  );
}
