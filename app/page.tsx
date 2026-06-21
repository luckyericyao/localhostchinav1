import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import {
  arrangements,
  chinaJourneys,
  futureChinaJourneys,
  shanxiReferences
} from "@/lib/content";

export default function Home() {
  return (
    <>
      <main>
        <section className="hero">
          <Image
            src="/images/localhost-hero.png"
            alt="A quiet China street at dusk with a trusted local host in conversation with a traveler."
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
              Localhost connects thoughtful travelers with trusted local hosts,
              private routes, and seamless local support - starting with China.
            </p>
            <div className="hero-actions" aria-label="Primary actions">
              <Link className="button button--light" href="/china">
                Explore China
              </Link>
              <Link className="button button--ghost" href="/#hosts">
                Become a Host
              </Link>
            </div>
            <p className="positioning-line">
              A global local-host network, starting with China.
            </p>
          </div>
        </section>

        <section className="section intro-section">
          <div className="section-heading">
            <p className="eyebrow">A Different Way to Travel</p>
            <h2>A different way to travel.</h2>
          </div>
          <div className="editorial-copy">
            <p className="lead">
              Standard travel shows you places.
              <br />
              Localhost helps you enter them.
            </p>
            <p>
              We connect travelers with trusted local hosts who understand the
              streets, food, rhythms, histories, and quiet details that make a
              place feel real.
            </p>
            <p className="short-lines">
              Not a tour group.
              <br />
              Not a checklist.
              <br />A local way in.
            </p>
          </div>
        </section>

        <section className="section section--stone" id="china">
          <div className="split-layout">
            <div className="section-heading">
              <p className="eyebrow">Starting with China</p>
              <h2>Starting with China.</h2>
            </div>
            <div className="editorial-copy">
              <p className="lead">
                China is easy to visit.
                <br />
                It is harder to understand.
              </p>
              <p>
                China is not just a destination checklist. Payments, transport,
                language, food, local habits, city rhythms, and cultural context
                can be difficult to navigate alone. Localhost helps travelers
                enter China through people who live there.
              </p>
              <Link className="text-link" href="/china">
                Enter the China chapter
              </Link>
            </div>
          </div>
        </section>

        <section className="section" aria-labelledby="arrange-title">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">What We Arrange</p>
            <h2 id="arrange-title">What we arrange.</h2>
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

        <section className="section section--dark" id="journeys">
          <div className="section-heading">
            <p className="eyebrow">Signature China Journeys</p>
            <h2>Curated cultural entry points.</h2>
          </div>
          <article className="flagship-destination">
            <div className="flagship-media">
              <Image
                src="/images/shanxi-flagship.png"
                alt="Ancient northern Chinese architecture and mountain temple roads representing Shanxi."
                fill
                sizes="(min-width: 900px) 48vw, 100vw"
              />
            </div>
            <div className="flagship-copy">
              <p className="eyebrow">Flagship Destination</p>
              <h3>Shanxi — Ancient China, without the tourist filter.</h3>
              <p>
                Ancient temples, caves, wooden pagodas, merchant courtyards,
                noodles, Fenjiu, Buddhist mountains, and northern Chinese
                civilization - best understood with someone who knows the roads
                and the context.
              </p>
              <ul className="reference-list" aria-label="Shanxi references">
                {shanxiReferences.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Link className="button button--light" href="/china/shanxi">
                Explore Shanxi
              </Link>
            </div>
          </article>
          <div className="journey-grid">
            {chinaJourneys
              .filter((journey) => !journey.featured)
              .map((journey) => (
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
          <div className="future-journeys" aria-label="Future China journeys">
            <span>Future China Journeys</span>
            <div>
              {futureChinaJourneys.map((journey) => (
                <Link href={journey.href} key={journey.place}>
                  {journey.place} — {journey.line}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section traveler-host-section">
          <div className="quiet-panel" id="travelers">
            <p className="eyebrow">For Travelers</p>
            <h2>Come with curiosity.</h2>
            <p className="lead">We handle the local complexity.</p>
            <p>
              Whether it is your first time in China or your tenth, Localhost
              helps you move with more confidence, more context, and more human
              connection.
            </p>
          </div>
          <div className="quiet-panel" id="hosts">
            <p className="eyebrow">For Local Hosts</p>
            <h2>Show your city to people who are genuinely curious.</h2>
            <p>
              Local hosts are not cheap labor or generic guides. They are people
              with local taste, cultural awareness, and the ability to make a
              traveler feel genuinely welcomed.
            </p>
            <ul className="clean-list">
              <li>Earn income.</li>
              <li>Build global connections.</li>
              <li>Earn Host Credits for future travel.</li>
            </ul>
          </div>
        </section>

        <section className="section section--credit" id="host-credits">
          <div className="credit-content">
            <p className="eyebrow">Host Credits</p>
            <h2>Hospitality should travel.</h2>
            <p className="lead">
              Host at home.
              <br />
              Travel back home somewhere else.
            </p>
            <p>
              When you host travelers in your own city, you earn Host Credits.
              In the future, you can use those credits to be hosted by trusted
              locals in another city.
            </p>
            <p className="fine-print">
              Host Credits are private hospitality credits inside a membership
              network, used only for future hosted travel inside Localhost.
            </p>
          </div>
        </section>

        <section className="section final-section">
          <div className="section-heading">
            <p className="eyebrow">Our First Home Is China</p>
            <h2>Our first home is China.</h2>
          </div>
          <div className="editorial-copy">
            <p>
              Localhost Global starts with China because China is one of the
              most fascinating places in the world - and one of the hardest to
              truly understand without local context.
            </p>
            <p>This is the first chapter of a global local-host network.</p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
