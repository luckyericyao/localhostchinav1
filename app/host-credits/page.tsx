import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Host Credits — Localhost Global",
  description:
    "A proposed contribution-recognition model, separate from agreed host compensation and without guaranteed redemption."
};

const whatTheyAre = [
  "Recognition of contribution, separate from agreed host compensation",
  "No automatic balance, redemption rate, or guaranteed benefit is offered here",
  "Any future arrangement needs written terms and a ready local chapter"
];

const earnedBy = [
  "Hosting travelers with care",
  "Helping shape or test a local route",
  "Supporting language, food, timing, or local decisions",
  "Introducing serious hosts or chapter partners",
  "Contributing specialist knowledge that improves a chapter"
];

const remembered = [
  "Time given with care",
  "Local judgment shared with travelers",
  "Routes improved through feedback",
  "Trusted introductions to hosts or partners",
  "Chapter work that helps Localhost protect quality"
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
  "They are not publicly tradable.",
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

const hostCreditsInquiryHref =
  "/inquiry?type=host&sourcePage=%2Fhost-credits&sourceLabel=Host%20Credits%20page";

export default function HostCreditsPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" tabIndex={-1}>
        <section className="page-hero support-hero">
          <div>
            <p className="eyebrow">Host Credits</p>
            <h1>Contribution should count inside the network.</h1>
          </div>
          <div className="page-hero-copy">
            <p>
              A proposed way to recognize contribution over time. Host pay is
              agreed for the work itself; future recognition does not replace
              compensation or create a travel entitlement.
            </p>
            <div className="inline-actions">
              <Link className="button button--dark" href={hostCreditsInquiryHref}>
                Apply as a host
              </Link>
              <Link className="text-link" href="/trust">
                Read the trust model
              </Link>
            </div>
          </div>
        </section>

        <section className="section section--stone">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">Current Scope</p>
            <h2>Paid work and future recognition are separate.</h2>
            <p>
              Before accepting a route, agree the role, hours, fee, expenses,
              payment timing, and cancellation terms in writing. This page is
              not an active credit account or redemption programme.
            </p>
          </div>
          <ul className="reference-matrix">
            {whatTheyAre.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="section">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">What They Remember</p>
            <h2>Contribution should not disappear after the route ends.</h2>
          </div>
          <ul className="reference-matrix">
            {remembered.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="section split-panel-section">
          <div className="quiet-panel">
            <p className="eyebrow">Contributions That May Be Recognized</p>
            <ul className="clean-list">
              {earnedBy.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="quiet-panel">
            <p className="eyebrow">Future Possibilities, Not Entitlements</p>
            <p>These possibilities are not currently promised. Eligibility and any benefit would require separate written terms.</p>
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
              A host who contributes judgment, time, and local access should
              not disappear after one route.
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
              Any future recognition model needs clear eligibility, written
              terms, and a local chapter able to honour it. No balance or
              redemption right is created by an application or inquiry.
            </p>
            <div className="inline-actions">
              <Link className="button button--dark" href={hostCreditsInquiryHref}>
                Apply as a host
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
