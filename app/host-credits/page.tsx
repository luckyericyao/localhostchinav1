import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Host Credits — Localhost Global",
  description:
    "Host Credits are how Localhost remembers contribution inside a private reciprocal hospitality network."
};

const whatTheyAre = [
  "Internal recognition of trusted contribution",
  "Earned through hosting, support, referrals, chapter help, or network-building work",
  "Connected to future hosted travel only where a local chapter is ready",
  "Held inside a private trust network, not a public marketplace"
];

const earnedBy = [
  "Hosting travelers with care",
  "Helping shape or test a local route",
  "Supporting language, food, timing, or local decisions",
  "Introducing serious hosts or chapter partners",
  "Contributing specialist knowledge that improves a chapter"
];

const mayBeUsed = [
  "Future hosted access in another Localhost chapter",
  "Route advisory or practical support where available",
  "Recognition inside the host network",
  "Priority consideration when a matching chapter is ready"
];

const cannotDo = [
  "They are not crypto.",
  "They are not a public token.",
  "They are not cash equivalent by default.",
  "They are not a guaranteed travel voucher.",
  "They are not a public loyalty marketplace.",
  "They do not override host availability, safety, or local fit."
];

const chapterLogic = [
  "A chapter must have trusted hosts.",
  "Routes must be shaped with local standards.",
  "Host boundaries must be clear.",
  "Quality control must exist before credits can be meaningfully used.",
  "Global expansion should follow trust, not marketing pressure."
];

export default function HostCreditsPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="page-hero support-hero">
          <div>
            <p className="eyebrow">Host Credits</p>
            <h1>Host at home. Travel back home somewhere else.</h1>
          </div>
          <div className="page-hero-copy">
            <p>
              Host Credits are how Localhost remembers contribution. They are a
              private trust mechanism for reciprocal hospitality, not a public
              token or travel voucher.
            </p>
            <div className="inline-actions">
              <Link className="button button--dark" href="/hosts">
                Become a Host
              </Link>
              <Link className="text-link" href="/trust">
                Read the trust model
              </Link>
            </div>
          </div>
        </section>

        <section className="section section--stone">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">What They Are</p>
            <h2>Private credits inside a trust network.</h2>
          </div>
          <ul className="reference-matrix">
            {whatTheyAre.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="section split-panel-section">
          <div className="quiet-panel">
            <p className="eyebrow">How They Are Earned</p>
            <ul className="clean-list">
              {earnedBy.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="quiet-panel">
            <p className="eyebrow">How They May Be Used</p>
            <ul className="clean-list">
              {mayBeUsed.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section section--dark">
          <div className="section-heading">
            <p className="eyebrow">What They Cannot Do</p>
            <h2>Credits do not replace trust, fit, or feasibility.</h2>
          </div>
          <ul className="reference-matrix reference-matrix--dark">
            {cannotDo.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="section intro-section">
          <div className="section-heading">
            <p className="eyebrow">Network Logic</p>
            <h2>This creates a network, not just a service.</h2>
          </div>
          <div className="editorial-copy">
            <p className="lead">
              A person who helps others enter their home with care should be
              remembered when they travel elsewhere.
            </p>
            <p>
              Host Credits give Localhost a way to recognize contribution
              without pretending hospitality is a public currency.
            </p>
          </div>
        </section>

        <section className="section section--stone">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">Future Chapters</p>
            <h2>Credits become useful only where trust has been built.</h2>
          </div>
          <ol className="rhythm-list">
            {chapterLogic.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </section>

        <section className="section final-section">
          <div className="section-heading">
            <p className="eyebrow">Contribution</p>
            <h2>Hospitality should leave a trace.</h2>
          </div>
          <div className="editorial-copy">
            <p>
              Host Credits are not a promise of scale. They are the beginning of
              a more reciprocal way for local hospitality to travel.
            </p>
            <div className="inline-actions">
              <Link className="button button--dark" href="/hosts">
                Become a Host
              </Link>
              <Link className="text-link" href="/about">
                Why Localhost exists
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
