import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { arrangements, chinaJourneys } from "@/lib/content";

export default function ChinaPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="page-hero page-hero--china">
          <div>
            <p className="eyebrow">Localhost China</p>
            <h1>Starting with China.</h1>
          </div>
          <p>
            China is easy to visit. It is harder to understand. Localhost helps
            thoughtful travelers enter real China through trusted local hosts,
            private routes, cultural decoding, and seamless local support.
          </p>
        </section>

        <section className="section intro-section">
          <div className="section-heading">
            <p className="eyebrow">The First Market</p>
            <h2>Not a checklist. A local way in.</h2>
          </div>
          <div className="editorial-copy">
            <p className="lead">
              Payments, transport, language, food, local habits, city rhythms,
              and cultural context can shape every day of a China journey.
            </p>
            <p>
              Localhost China is designed for travelers who want more than
              standard sightseeing, but still want the confidence of private
              support and people they can trust.
            </p>
          </div>
        </section>

        <section className="section section--stone" aria-labelledby="china-arrange">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">Local Support</p>
            <h2 id="china-arrange">What we arrange in China.</h2>
          </div>
          <div className="arrangement-grid">
            {arrangements.map((item) => (
              <article className="arrangement-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section section--dark">
          <div className="china-feature">
            <div className="china-feature-copy">
              <p className="eyebrow">Flagship Journey</p>
              <h2>Shanxi - Ancient China, without the tourist filter.</h2>
              <p>
                Ancient temples, caves, wooden pagodas, merchant courtyards,
                noodles, Fenjiu, Buddhist mountains, and northern Chinese
                civilization - best understood with someone who knows the roads
                and the context.
              </p>
              <Link className="button button--light" href="/china/shanxi">
                Explore Shanxi
              </Link>
            </div>
            <div className="china-feature-media">
              <Image
                src="/images/shanxi-flagship.png"
                alt="Ancient northern Chinese architecture and mountain temple roads representing Shanxi."
                fill
                sizes="(min-width: 900px) 44vw, 100vw"
              />
            </div>
          </div>
          <div className="journey-grid journey-grid--light">
            {chinaJourneys
              .filter((journey) => !journey.featured)
              .map((journey) => (
                <Link
                  className="journey-card"
                  href={journey.href}
                  id={journey.place.toLowerCase()}
                  key={journey.place}
                >
                  <span>{journey.place}</span>
                  <strong>{journey.line}</strong>
                </Link>
              ))}
          </div>
        </section>

        <section className="section final-section">
          <div className="section-heading">
            <p className="eyebrow">Travel Back Home</p>
            <h2>A first chapter, not a finished map.</h2>
          </div>
          <div className="editorial-copy">
            <p>
              Localhost Global begins with China because the country rewards
              context, patience, and local trust. The long-term vision is a
              global network where hospitality can move from home to home.
            </p>
            <Link className="text-link" href="/#host-credits">
              Learn about Host Credits
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
