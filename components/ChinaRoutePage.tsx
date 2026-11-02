import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { resolveImageSource } from "@/lib/image";

type RouteBlock = {
  title: string;
  copy: string;
};

type SnapshotItem = {
  label: string;
  value: string;
};

type RouteGalleryImage = {
  alt: string;
  copy: string;
  src: string;
  title: string;
  credit?: { author: string; source: string; license: string; licenseUrl: string };
};

type RouteGallery = {
  body: string;
  eyebrow: string;
  images: readonly RouteGalleryImage[];
  title: string;
};

export type ChinaRoutePageContent = {
  eyebrow: string;
  title: string;
  thesis: string;
  image: string;
  alt: string;
  body: string;
  routeNote?: string;
  opens: readonly RouteBlock[];
  rhythm: readonly string[];
  hostHelps: readonly string[];
  handles: readonly string[];
  snapshot: readonly SnapshotItem[];
  gallery?: RouteGallery;
  sampleDay: readonly RouteBlock[];
  hostChanges: readonly string[];
  variants: readonly RouteBlock[];
  practicalNotes: readonly string[];
  chooseAnother: readonly string[];
  ctaLabel: string;
  bestFor: readonly string[];
  notFor: readonly string[];
  final: string;
};

type ChinaRoutePageProps = {
  route: ChinaRoutePageContent;
};

function routeInquiryContext(route: ChinaRoutePageContent) {
  if (route.title.includes("Shanxi")) {
    return {
      href: "/inquiry?type=traveler&route=shanxi&sourcePage=%2Fchina%2Fshanxi&sourceLabel=Shanxi%20route%20page"
    };
  }

  if (route.title.includes("Shaolin")) {
    return {
      href: "/inquiry?type=traveler&route=shaolin&sourcePage=%2Fchina%2Fshaolin&sourceLabel=Shaolin%20route%20page"
    };
  }

  if (route.title.includes("Shanghai")) {
    return {
      href: "/inquiry?type=traveler&route=shanghai&sourcePage=%2Fchina%2Fshanghai&sourceLabel=Shanghai%20route%20page"
    };
  }

  return {
    href: "/inquiry?type=traveler&route=huizhou&sourcePage=%2Fchina%2Fhuizhou&sourceLabel=Huizhou%20route%20page"
  };
}

export function ChinaRoutePage({ route }: ChinaRoutePageProps) {
  const inquiry = routeInquiryContext(route);
  const decisionFacts = route.snapshot.filter(
    (item) => item.label !== "Best For"
  );

  return (
    <>
      <SiteHeader />
      <main
        id="main-content"
        data-route-page={route.title.split(" —")[0]}
        data-track-route={route.title.split(" —")[0]}
        data-track-source="route_page"
      >
        <section className="destination-hero route-hero">
          <div className="destination-copy">
            <p className="eyebrow">{route.eyebrow}</p>
            <h1>{route.title}</h1>
            <p>{route.body}</p>
            <p className="route-ancient-note">
              {route.routeNote ||
                "Ancient China, read through place, practice, and local context."}
            </p>
            <div className="inline-actions">
              <Link
                className="button button--dark"
                data-track-event="request_route"
                data-track-route={route.title.split(" —")[0]}
                data-track-source="route_hero"
                href={inquiry.href}
              >
                {route.ctaLabel}
              </Link>
              <Link className="text-link" href="/china">
                Back to China
              </Link>
            </div>
          </div>
          <div className="destination-media">
            <Image
              src={resolveImageSource(route.image)}
              alt={route.alt}
              fill
              priority
              sizes="(min-width: 900px) 46vw, 100vw"
            />
          </div>
        </section>

        <section className="section section--stone route-decision-section">
          <div className="route-decision-shell">
            <header className="route-decision-header">
              <div>
                <p className="eyebrow">Route Fit</p>
                <h2>The shape, the trade-offs, and who it suits.</h2>
              </div>
              <div className="route-decision-intro">
                <p>
                  A private route can change. Its basic demands should be clear
                  before you ask us to shape it.
                </p>
                <Link
                  className="text-link"
                  data-track-event="request_route"
                  data-track-route={route.title.split(" —")[0]}
                  data-track-source="route_fit"
                  href={inquiry.href}
                >
                  {route.ctaLabel}
                </Link>
              </div>
            </header>

            <dl className="route-decision-facts">
              {decisionFacts.map((item) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>

            <div className="route-fit-grid">
              <div className="route-fit-column">
                <p className="eyebrow">Best For</p>
                <ul className="clean-list">
                  {route.bestFor.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="route-fit-column">
                <p className="eyebrow">Less Suited To</p>
                <ul className="clean-list">
                  {route.notFor.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="route-emphasis-row">
              <p className="eyebrow">The Route Can Lean Toward</p>
              <ul>
                {route.variants.map((item) => (
                  <li key={item.title}>{item.title}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {route.gallery ? (
          <section className="section section--dark route-gallery-section">
            <div className="section-heading">
              <p className="eyebrow">{route.gallery.eyebrow}</p>
              <h2>{route.gallery.title}</h2>
              <p>{route.gallery.body}</p>
            </div>
            <div className={`route-gallery-grid${route.gallery.images.length === 3 ? " route-gallery-grid--three" : ""}`}>
              {route.gallery.images.map((image, index) => (
                <article
                  className={`route-gallery-card${index === 0 ? " route-gallery-card--featured" : ""}`}
                  key={image.src}
                >
                  <div className="route-gallery-media">
                    <Image
                      src={resolveImageSource(image.src)}
                      alt={image.alt}
                      fill
                      sizes={route.gallery!.images.length === 3 ? "(min-width: 900px) 33vw, 100vw" : index === 0 ? "(min-width: 900px) 56vw, 100vw" : "(min-width: 900px) 28vw, 100vw"}
                    />
                  </div>
                  <div className="route-gallery-copy">
                    <h3>{image.title}</h3>
                    <p>{image.copy}</p>
                    {image.credit ? (
                      <p className="route-photo-credit">
                        Photo: <a href={image.credit.source}>{image.credit.author}</a>
                        {" · "}<a href={image.credit.licenseUrl}>{image.credit.license}</a>
                        {" · Cropped and toned for display."}
                      </p>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
            <p className="scope-note">Photographs are credited place references, not records of a Localhost-hosted journey. Visits and any private access are confirmed separately.</p>
          </section>
        ) : null}

        <section className="section intro-section route-read-section">
          <div className="section-heading">
            <p className="eyebrow">Example Rhythm</p>
            <h2>A Day Might Feel Like This</h2>
          </div>
          <div className="editorial-copy">
            <p className="lead">{route.thesis}</p>
            <p>
              One possible rhythm, not a fixed itinerary. The shape depends on
              timing, appetite, weather, local interpretation, and the questions
              the traveler brings.
            </p>
          </div>
          <div className="support-card-grid">
            {route.sampleDay.map((item) => (
              <article className="support-detail-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section section--stone">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">Host & Support</p>
            <h2>Know who joins you, and what is agreed.</h2>
            <p>
              Host time, transport, costs, and support are clarified before
              confirmation. A local host and a driver are separate roles.
            </p>
          </div>
          <div className="support-card-grid support-card-grid--three">
            <article className="support-detail-card">
              <h3>Where a host helps</h3>
              <ul className="clean-list">
                {route.hostHelps.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article className="support-detail-card">
              <h3>What we agree before confirmation</h3>
              <ul className="clean-list">
                {[
                  "When the host joins you, and when you travel independently.",
                  "Transport arrangements and the separate roles of host and driver.",
                  "Fees, third-party costs, availability, and cancellation terms.",
                  "Your point of contact, reply window, and support boundaries."
                ].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article className="support-detail-card">
              <h3>Practical notes</h3>
              <ul className="clean-list">
                {route.practicalNotes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        <section className="section final-section">
          <div className="section-heading">
            <p className="eyebrow">Private Route Inquiry</p>
            <h2>Discuss the route before making plans.</h2>
          </div>
          <div className="editorial-copy">
            <p>{route.final}</p>
            <div className="inline-actions">
              <Link
                className="button button--dark"
                data-track-event="request_route"
                data-track-route={route.title.split(" —")[0]}
                data-track-source="route_final"
                href={inquiry.href}
              >
                {route.ctaLabel}
              </Link>
              <Link className="text-link" href="/travelers">
                For travelers
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
