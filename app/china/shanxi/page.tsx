import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { routePrinciples, shanxiReferences } from "@/lib/content";

export default function ShanxiPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="destination-hero">
          <div className="destination-copy">
            <p className="eyebrow">Flagship China Journey</p>
            <h1>Shanxi — Ancient China, without the tourist filter.</h1>
            <p>
              Ancient temples, caves, wooden pagodas, merchant courtyards,
              noodles, Fenjiu, Buddhist mountains, and northern Chinese
              civilization - best understood with someone who knows the roads
              and the context.
            </p>
            <Link className="button button--dark" href="/china">
              Back to China
            </Link>
          </div>
          <div className="destination-media">
            <Image
              src="/images/shanxi-flagship.png"
              alt="Ancient northern Chinese architecture and mountain temple roads representing Shanxi."
              fill
              priority
              sizes="(min-width: 900px) 46vw, 100vw"
            />
          </div>
        </section>

        <section className="section intro-section">
          <div className="section-heading">
            <p className="eyebrow">Why Shanxi</p>
            <h2>Northern civilization, road by road.</h2>
          </div>
          <div className="editorial-copy">
            <p className="lead">
              Shanxi is dense with history, but it does not reveal itself like a
              polished resort route.
            </p>
            <p>
              The power of the province is in the distances between places, the
              food at the end of a long road, the texture of old timber, the
              mountain air, and the local context that turns a monument into a
              living story.
            </p>
          </div>
        </section>

        <section className="section section--stone">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">Possible References</p>
            <h2>Entry points for a private Shanxi route.</h2>
          </div>
          <ul className="reference-matrix" aria-label="Shanxi route references">
            {shanxiReferences.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="section section--dark">
          <div className="section-heading">
            <p className="eyebrow">How We Shape It</p>
            <h2>Private routes with local context.</h2>
          </div>
          <div className="principle-grid">
            {routePrinciples.map((item) => (
              <article className="principle-card" key={item}>
                <p>{item}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section final-section">
          <div className="section-heading">
            <p className="eyebrow">Localhost China</p>
            <h2>Designed for travelers who want to understand.</h2>
          </div>
          <div className="editorial-copy">
            <p>
              A Shanxi journey can be ancient architecture, Buddhist mountains,
              Jin merchant culture, noodles, Fenjiu, and the daily work of
              moving through northern China with someone who can translate more
              than language.
            </p>
            <Link className="text-link" href="/#travelers">
              For travelers
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
