import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { huizhouPrinciples, huizhouReferences } from "@/lib/content";

export default function HuizhouPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="destination-hero">
          <div className="destination-copy">
            <p className="eyebrow">Huizhou / Huangshan</p>
            <h1>
              Huizhou — Hidden villages, ink landscapes, and the road to
              Huangshan.
            </h1>
            <p>
              Huizhou reveals a quieter China: white walls, black tiles,
              ancestral halls, misty lanes, tea, and mountain light.
            </p>
            <Link className="button button--dark" href="/china">
              Back to China
            </Link>
          </div>
          <div className="destination-media">
            <Image
              src="/images/huizhou-huangshan.png"
              alt="A misty Huizhou village with white walls, black tiles, stone lanes, and mountain peaks."
              fill
              priority
              sizes="(min-width: 900px) 46vw, 100vw"
            />
          </div>
        </section>

        <section className="section intro-section">
          <div className="section-heading">
            <p className="eyebrow">Why Huizhou</p>
            <h2>Architecture, mist, and inward beauty.</h2>
          </div>
          <div className="editorial-copy">
            <p className="lead">
              The journey is less about scenery collected from a distance and
              more about entering a landscape that feels almost painted.
            </p>
            <p>
              With local guidance and a private route, travelers can move
              through old villages, ancestral halls, stone lanes, tea culture,
              mountain mist, and the quiet beauty of southern Chinese built
              culture.
            </p>
          </div>
        </section>

        <section className="section section--stone">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">Possible References</p>
            <h2>Entry points for a private Huizhou route.</h2>
          </div>
          <ul className="reference-matrix" aria-label="Huizhou route references">
            {huizhouReferences.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="section section--dark">
          <div className="section-heading">
            <p className="eyebrow">How We Shape It</p>
            <h2>Hidden villages, tea, and mountain light.</h2>
          </div>
          <div className="principle-grid">
            {huizhouPrinciples.map((item) => (
              <article className="principle-card" key={item}>
                <p>{item}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section final-section">
          <div className="section-heading">
            <p className="eyebrow">Localhost China</p>
            <h2>A quieter road into southern Chinese built culture.</h2>
          </div>
          <div className="editorial-copy">
            <p>
              A Huizhou journey can hold village lanes, ancestral spaces,
              tea-table pauses, Huangshan light, and a host who understands how
              old places keep their rhythm.
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
