import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

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

  return {
    href: "/inquiry?type=traveler&route=huizhou&sourcePage=%2Fchina%2Fhuizhou&sourceLabel=Huizhou%20route%20page"
  };
}

export function ChinaRoutePage({ route }: ChinaRoutePageProps) {
  const inquiry = routeInquiryContext(route);

  return (
    <>
      <SiteHeader />
      <main>
        <section className="destination-hero route-hero">
          <div className="destination-copy">
            <p className="eyebrow">{route.eyebrow}</p>
            <h1>{route.title}</h1>
            <p>{route.body}</p>
            <p className="route-ancient-note">
              Not retro. Not staged. Ancient China, still alive.
            </p>
            <div className="inline-actions">
              <Link className="button button--dark" href={inquiry.href}>
                {route.ctaLabel}
              </Link>
              <Link className="text-link" href="/china">
                Back to China
              </Link>
            </div>
          </div>
          <div className="destination-media">
            <Image
              src={route.image}
              alt={route.alt}
              fill
              priority
              sizes="(min-width: 900px) 46vw, 100vw"
            />
          </div>
        </section>

        <section className="section section--stone">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">Route Snapshot</p>
            <h2>The route shape before the details.</h2>
          </div>
          <dl className="snapshot-grid">
            {route.snapshot.map((item) => (
              <div className="snapshot-item" key={item.label}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {route.gallery ? (
          <section className="section section--dark route-gallery-section">
            <div className="section-heading">
              <p className="eyebrow">{route.gallery.eyebrow}</p>
              <h2>{route.gallery.title}</h2>
              <p>{route.gallery.body}</p>
            </div>
            <div className="route-gallery-grid">
              {route.gallery.images.map((image, index) => (
                <article
                  className={`route-gallery-card${index === 0 ? " route-gallery-card--featured" : ""}`}
                  key={image.src}
                >
                  <div className="route-gallery-media">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes={index === 0 ? "(min-width: 900px) 56vw, 100vw" : "(min-width: 900px) 28vw, 100vw"}
                    />
                  </div>
                  <div className="route-gallery-copy">
                    <h3>{image.title}</h3>
                    <p>{image.copy}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="section">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">Example Rhythm</p>
            <h2>A Day Might Feel Like This</h2>
            <p>
              One possible rhythm, not a fixed itinerary.
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

        <section className="section intro-section">
          <div className="section-heading">
            <p className="eyebrow">Why This Place Matters</p>
            <h2>{route.thesis}</h2>
          </div>
          <div className="editorial-copy">
            <p className="lead">
              This is a private cultural route, not a rigid itinerary.
            </p>
            <p>
              The shape depends on timing, appetite, weather, local
              interpretation, and the questions the traveler brings.
            </p>
          </div>
        </section>

        <section className="section section--stone">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">What This Route Opens</p>
            <h2>Compact entry points, held with context.</h2>
          </div>
          <div className="support-card-grid">
            {route.opens.map((item) => (
              <article className="support-detail-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">What A Host Changes Here</p>
            <h2>Local judgment changes what the traveler can read.</h2>
          </div>
          <ul className="reference-matrix">
            {route.hostChanges.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="section section--dark">
          <div className="section-heading">
            <p className="eyebrow">Route Variants</p>
            <h2>Different ways into the same chapter.</h2>
          </div>
          <div className="support-card-grid support-card-grid--three">
            {route.variants.map((item) => (
              <article
                className="support-detail-card support-detail-card--dark"
                key={item.title}
              >
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">Possible Route Rhythm</p>
            <h2>A flexible rhythm, not a fixed plan.</h2>
          </div>
          <ol className="rhythm-list">
            {route.rhythm.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </section>

        <section className="section section--dark">
          <div className="section-heading">
            <p className="eyebrow">What A Local Host Decodes</p>
            <h2>Context, timing, food, language, and cultural reading.</h2>
          </div>
          <ul className="reference-matrix reference-matrix--dark">
            {route.hostHelps.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="section section--stone">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">What Localhost Handles</p>
            <h2>Practical steadiness around the route.</h2>
          </div>
          <ul className="reference-matrix">
            {route.handles.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="section">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">Practical Notes</p>
            <h2>Comfort, timing, movement, and advance planning.</h2>
          </div>
          <ul className="reference-matrix">
            {route.practicalNotes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="section split-panel-section">
          <div className="quiet-panel">
            <p className="eyebrow">Best For</p>
            <ul className="clean-list">
              {route.bestFor.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="quiet-panel">
            <p className="eyebrow">Not For</p>
            <ul className="clean-list">
              {route.notFor.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="quiet-panel">
            <p className="eyebrow">Choose Another Route If</p>
            <ul className="clean-list">
              {route.chooseAnother.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section final-section">
          <div className="section-heading">
            <p className="eyebrow">Private Route Inquiry</p>
            <h2>Enter the chapter with context and judgment.</h2>
          </div>
          <div className="editorial-copy">
            <p>{route.final}</p>
            <div className="inline-actions">
              <Link className="button button--dark" href={inquiry.href}>
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
