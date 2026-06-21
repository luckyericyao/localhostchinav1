import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

type RouteBlock = {
  title: string;
  copy: string;
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
  bestFor: readonly string[];
  notFor: readonly string[];
  final: string;
};

type ChinaRoutePageProps = {
  route: ChinaRoutePageContent;
};

export function ChinaRoutePage({ route }: ChinaRoutePageProps) {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="destination-hero route-hero">
          <div className="destination-copy">
            <p className="eyebrow">{route.eyebrow}</p>
            <h1>{route.title}</h1>
            <p>{route.body}</p>
            <div className="inline-actions">
              <Link className="button button--dark" href="/inquiry">
                Start a private route
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

        <section className="section intro-section">
          <div className="section-heading">
            <p className="eyebrow">Route Thesis</p>
            <h2>{route.thesis}</h2>
          </div>
          <div className="editorial-copy">
            <p className="lead">
              This is a private cultural route, not a rigid itinerary.
            </p>
            <p>
              The shape depends on timing, appetite, weather, local rhythm, and
              the questions the traveler brings.
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
            <p className="eyebrow">What The Host Helps With</p>
            <h2>Context, timing, food, language, and local rhythm.</h2>
          </div>
          <ul className="reference-matrix reference-matrix--dark">
            {route.hostHelps.map((item) => (
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
        </section>

        <section className="section final-section">
          <div className="section-heading">
            <p className="eyebrow">Private Route Inquiry</p>
            <h2>Enter the chapter with a local rhythm.</h2>
          </div>
          <div className="editorial-copy">
            <p>{route.final}</p>
            <div className="inline-actions">
              <Link className="button button--dark" href="/inquiry">
                Start a private route
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
