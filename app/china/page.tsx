import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PhotographCredit } from "@/components/PhotographCredit";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { discoveryChapters } from "@/lib/discovery";
import { resolveImageSource } from "@/lib/image";
import { buildLocalhostPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildLocalhostPageMetadata({
  title: "Localhost China — Four Local Perspectives",
  description:
    "Explore northern architecture in Shanxi, practice around Shaolin, the villages of Huizhou, and the river city of Shanghai. Four starting points for a private China journey.",
  image: "/images/china-ancient-landscape.png",
  imageAlt: "A weathered Chinese stone wall beneath distant mountains.",
  path: "/china",
  shareTitle: "Shanxi. Shaolin. Huizhou. Shanghai."
});

const chinaInquiryHref =
  "/inquiry?type=traveler&route=china-general&sourcePage=%2Fchina&sourceLabel=Localhost%20China%20page";

export default function ChinaPage() {
  return (
    <>
      <SiteHeader tone="transparent" discovery />
      <main id="main-content" tabIndex={-1} className="china-atlas-page">
        <section className="chapter-opening" aria-labelledby="china-title">
          <Image
            src={resolveImageSource("/images/china-ancient-landscape.png")}
            alt="A weathered Chinese stone wall beneath distant mountains."
            fill
            priority
            sizes="100vw"
            className="chapter-opening-image"
          />
          <div className="chapter-opening-shade" />
          <div className="chapter-opening-copy">
            <p className="eyebrow">Localhost / China</p>
            <h1 id="china-title">China.</h1>
            <p>Begin in the north, around Songshan, among the villages of Huizhou, or by the river in Shanghai.</p>
            <a className="discovery-explore" href="#china-places">Explore the places <span aria-hidden="true">↓</span></a>
          </div>
        </section>

        <section className="china-atlas" id="china-places" aria-labelledby="china-perspectives-title">
          <header className="discovery-section-heading">
            <p className="eyebrow">Place before plans</p>
            <h2 id="china-perspectives-title">Four local perspectives.</h2>
          </header>
          <div className="china-atlas-places">
            {discoveryChapters.map((chapter) => (
              <article className="china-atlas-place" data-china-place={chapter.slug} key={chapter.slug}>
                <figure>
                  <Link
                    className="china-atlas-image"
                    href={`/china/${chapter.slug}`}
                    aria-label={`Explore ${chapter.place}`}
                    data-track-event="route_select"
                    data-track-route={chapter.place}
                    data-track-source="china_featured_routes"
                  >
                    <Image src={chapter.photograph.src} alt={chapter.imageAlt} fill sizes="(min-width: 900px) 50vw, 100vw" />
                  </Link>
                  <figcaption>
                    <span>{chapter.imageCaption}</span>
                    <PhotographCredit photograph={chapter.photograph} />
                  </figcaption>
                </figure>
                <div className="china-atlas-copy">
                  <p className="eyebrow">{chapter.number} / {chapter.region}{chapter.slug === "shanxi" ? " / Flagship chapter" : ""}</p>
                  <h3>{chapter.place}</h3>
                  <p className="china-atlas-perspective">{chapter.perspective}</p>
                  <p>{chapter.regionalContext}</p>
                  <p className="discovery-setting">{chapter.setting}</p>
                  <Link className="text-link" href={`/china/${chapter.slug}`} data-track-event="route_select" data-track-route={chapter.place} data-track-source="china_featured_routes">Explore {chapter.place}</Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="discovery-orientation" aria-labelledby="china-practical-title">
          <p className="eyebrow">When a place interests you</p>
          <h2 id="china-practical-title">Then consider the journey.</h2>
          <p>Compare time, arrival cities, and pace on the Routes page. Host involvement, transport, costs, and support are agreed separately before a journey is confirmed.</p>
          <div className="discovery-context-links">
            <Link className="text-link" href="/journeys">Compare the four routes</Link>
            <Link className="text-link" href="/travelers">How a journey is supported</Link>
            <Link className="text-link" href="/trust">Trust & care</Link>
          </div>
        </section>

        <section className="discovery-conversation" aria-labelledby="china-conversation-title">
          <p className="eyebrow">A conversation</p>
          <h2 id="china-conversation-title">Start with a place<br />or a question.</h2>
          <p>You do not need a finished itinerary. Tell us what drew your attention, and we can consider the next steps together.</p>
          <Link className="text-link" href={chinaInquiryHref} data-track-event="request_route" data-track-source="china_final">Begin a conversation</Link>
        </section>
      </main>
      <SiteFooter discovery />
    </>
  );
}
