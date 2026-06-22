import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Host Credits — Localhost Global",
  description:
    "A private trust mechanism for reciprocal hosted travel: host at home, then travel back home somewhere else."
};

const creditIdeas = [
  "A credit system for trusted hosts and members",
  "Earned by hosting, supporting, referring, or contributing to the network",
  "Used for future Localhost experiences in other places"
];

const whyItMatters = [
  "It turns travel into reciprocal trust",
  "It rewards cultural generosity",
  "It makes Localhost a network, not just a service"
];

const boundaries = [
  "Credits are not crypto",
  "Credits are not cash-equivalent unless clearly supported",
  "Credits are not a public marketplace",
  "Trust and quality control come first"
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
              Host Credits are the beginning of a reciprocal global local-host
              network: hospitality that can move from home to home.
            </p>
            <div className="inline-actions">
              <Link className="button button--dark" href="/hosts">
                Become a host
              </Link>
              <Link className="text-link" href="/travelers">
                Start as a traveler
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
            {creditIdeas.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="section intro-section">
          <div className="section-heading">
            <p className="eyebrow">Why It Matters</p>
            <h2>Travel becomes reciprocal.</h2>
          </div>
          <div className="editorial-copy">
            {whyItMatters.map((item) => (
              <p key={item}>{item}.</p>
            ))}
          </div>
        </section>

        <section className="section section--dark">
          <div className="section-heading">
            <p className="eyebrow">Example Flow</p>
            <h2>A host gives context at home, then receives it elsewhere.</h2>
          </div>
          <div className="editorial-copy">
            <p>
              A Shanghai host earns credits by helping a traveler understand
              the city. Later, those credits can support a future Localhost
              experience in another chapter of the network.
            </p>
            <p>
              Future cities are conceptual until each local chapter is built,
              hosted, and quality controlled.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">Boundaries</p>
            <h2>Trust before scale.</h2>
          </div>
          <ul className="reference-matrix">
            {boundaries.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="section final-section">
          <div className="section-heading">
            <p className="eyebrow">Network Logic</p>
            <h2>Hospitality should travel.</h2>
          </div>
          <div className="editorial-copy">
            <p>
              Localhost begins with China, but the deeper idea is global:
              people hosting at home and being hosted elsewhere with care.
            </p>
            <div className="inline-actions">
              <Link className="button button--dark" href="/hosts">
                Become a host
              </Link>
              <Link className="text-link" href="/inquiry">
                Request a Private Route
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
