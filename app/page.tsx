import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { PhotographCredit } from "@/components/PhotographCredit";
import { discoveryChapters } from "@/lib/discovery";
import { buildLocalhostPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildLocalhostPageMetadata({
  title: "Localhost Global — China, Chapter One",
  description:
    "Explore Shanxi, Shaolin, Huizhou, and Shanghai through architecture, landscapes, and local life. Private journeys through China, shaped with local hosts.",
  path: "/",
  shareTitle: "Localhost Global — China, Chapter One"
});

const [shanxi, ...chapters] = discoveryChapters;

export default function Home() {
  return (
    <>
      <SiteHeader tone="transparent" discovery />
      <main id="main-content" tabIndex={-1} className="discovery-home">
        <section className="discovery-hero" aria-labelledby="arrival-title">
          <Image
            src="/images/temple-of-heaven-centered-hero.avif"
            alt="The Temple of Heaven Hall of Prayer for Good Harvests, centered above its stone terraces."
            fill
            fetchPriority="high"
            priority
            className="discovery-hero-image"
            unoptimized
            sizes="100vw"
          />
          <div className="discovery-hero-shade" />
          <div className="discovery-arrival">
            <p className="eyebrow">Localhost Global / Chapter One</p>
            <h1 id="arrival-title">China.</h1>
            <a className="discovery-explore" href="#shanxi-chapter">
              Explore the chapters <span aria-hidden="true">↓</span>
            </a>
          </div>
          <p className="discovery-place-caption">
            Beijing<br />The Hall of Prayer for Good Harvests
          </p>
        </section>

        <section className="discovery-feature" id="shanxi-chapter" aria-labelledby="shanxi-title">
          <header className="discovery-chapter-heading">
            <p className="eyebrow">01 / The first chapter</p>
            <h2 id="shanxi-title">Shanxi</h2>
            <p>Stone, timber, and the roads between.</p>
          </header>
          <figure className="discovery-feature-figure">
            <Link
              className="discovery-scene-link"
              data-track-event="route_select"
              data-track-route="Shanxi"
              data-track-source="homepage_featured_routes"
              href="/china/shanxi"
              aria-label="Explore Shanxi"
            >
              <Image
                src={shanxi.photograph.src}
                alt={shanxi.imageAlt}
                fill
                sizes="100vw"
              />
              <span className="discovery-scene-label">Explore Shanxi <span aria-hidden="true">↗</span></span>
            </Link>
            <figcaption>
              <span>{shanxi.imageCaption}</span>
              <PhotographCredit photograph={shanxi.photograph} />
            </figcaption>
          </figure>
          <div className="discovery-feature-note">
            <p className="discovery-setting">{shanxi.setting}</p>
            <p>{shanxi.introduction}</p>
            <Link className="text-link" href="/china/shanxi" data-track-event="route_select" data-track-route="Shanxi" data-track-source="homepage_featured_routes">Into Shanxi</Link>
          </div>
        </section>

        <section className="discovery-chapters" aria-labelledby="further-title">
          <header className="discovery-section-heading">
            <p className="eyebrow">Other chapters</p>
            <h2 id="further-title">A different China,<br />with each turn.</h2>
          </header>
          {chapters.map((chapter) => (
            <article className="discovery-chapter" data-discovery-scene={chapter.slug} key={chapter.slug}>
              <figure>
                <Link
                  className="discovery-chapter-image"
                  href={`/china/${chapter.slug}`}
                  aria-label={`Explore ${chapter.place}`}
                  data-track-event="route_select"
                  data-track-route={chapter.place}
                  data-track-source="homepage_featured_routes"
                >
                  <Image
                    src={chapter.photograph.src}
                    alt={chapter.imageAlt}
                    fill
                    sizes={chapter.imageSizes}
                    style={{ objectPosition: chapter.imagePosition }}
                  />
                </Link>
                <figcaption>
                  <span>{chapter.imageCaption}</span>
                  <PhotographCredit photograph={chapter.photograph} />
                </figcaption>
              </figure>
              <div className="discovery-chapter-copy">
                <div>
                  <p className="eyebrow">{chapter.number} / {chapter.setting}</p>
                  <h3>{chapter.place}</h3>
                </div>
                <p>{chapter.introduction}</p>
                <Link className="text-link" href={`/china/${chapter.slug}`} data-track-event="route_select" data-track-route={chapter.place} data-track-source="homepage_featured_routes">Explore {chapter.place}</Link>
              </div>
            </article>
          ))}
          <Link className="text-link discovery-index-link" href="/journeys">See the four routes together</Link>
        </section>

        <section className="discovery-orientation" aria-labelledby="orientation-title">
          <p className="eyebrow">Traveling with Localhost</p>
          <h2 id="orientation-title">A place comes first.<br />The journey takes shape from there.</h2>
          <p>Localhost is a private local-host network, starting with China. We shape each journey around the places you want to understand, with local interpretation and practical arrangements agreed before you travel.</p>
          <div className="discovery-context-links">
            <Link className="text-link" href="/about">The people behind Localhost</Link>
            <Link className="text-link" href="/travelers">How a journey is supported</Link>
            <Link className="text-link" href="/trust">Trust & care</Link>
          </div>
        </section>

        <section className="discovery-conversation" aria-labelledby="conversation-title">
          <p className="eyebrow">A conversation</p>
          <h2 id="conversation-title">What would you like<br />to look closer at?</h2>
          <p>A place, a question, or a few dates is enough to begin.</p>
          <Link
            className="text-link"
            href="/inquiry?type=traveler&sourcePage=%2F&sourceLabel=Homepage"
            data-track-event="request_route"
            data-track-source="homepage_final"
          >
            Begin a conversation
          </Link>
        </section>
      </main>
      <SiteFooter discovery />
    </>
  );
}
