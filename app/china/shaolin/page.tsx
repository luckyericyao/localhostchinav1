import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { shaolinPrinciples, shaolinReferences } from "@/lib/content";

export default function ShaolinPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="destination-hero">
          <div className="destination-copy">
            <p className="eyebrow">Dengfeng / Songshan</p>
            <h1>
              Shaolin — Zen practice, martial discipline, and mountain
              stillness.
            </h1>
            <p>
              Shaolin is not only a temple stop. It is an entry into a world of
              discipline, stillness, training, and spiritual atmosphere.
            </p>
            <Link className="button button--dark" href="/china">
              Back to China
            </Link>
          </div>
          <div className="destination-media">
            <Image
              src="/images/shaolin-dengfeng.png"
              alt="A quiet Shaolin temple courtyard near misted mountains at dawn."
              fill
              priority
              sizes="(min-width: 900px) 46vw, 100vw"
            />
          </div>
        </section>

        <section className="section intro-section">
          <div className="section-heading">
            <p className="eyebrow">Why Shaolin</p>
            <h2>Practice before performance.</h2>
          </div>
          <div className="editorial-copy">
            <p className="lead">
              The deeper route is less about spectacle and more about rhythm,
              restraint, and context.
            </p>
            <p>
              Through a private route shaped with local interpretation,
              travelers can encounter mountain roads, Chan heritage, martial
              practice culture, morning courtyards, timber halls, and the quiet
              atmosphere around Dengfeng and Songshan.
            </p>
          </div>
        </section>

        <section className="section section--stone">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">Possible References</p>
            <h2>Entry points for a private Shaolin route.</h2>
          </div>
          <ul className="reference-matrix" aria-label="Shaolin route references">
            {shaolinReferences.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="section section--dark">
          <div className="section-heading">
            <p className="eyebrow">How We Shape It</p>
            <h2>Discipline, stillness, and mountain air.</h2>
          </div>
          <div className="principle-grid">
            {shaolinPrinciples.map((item) => (
              <article className="principle-card" key={item}>
                <p>{item}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section final-section">
          <div className="section-heading">
            <p className="eyebrow">Localhost China</p>
            <h2>A quieter way into Chinese spiritual and physical culture.</h2>
          </div>
          <div className="editorial-copy">
            <p>
              A Shaolin journey can hold bells, stone paths, practice
              courtyards, mountain roads, and a host who helps separate living
              culture from performance.
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
