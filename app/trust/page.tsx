import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { localhostResponseWindow } from "@/lib/contact";
import { buildLocalhostPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildLocalhostPageMetadata({
  title: "Trust — Localhost Global",
  description:
    "How Localhost reviews inquiries, selects hosts, protects privacy, clarifies boundaries, and confirms route fit before matching.",
  image: "/images/trust-courtyard-wall.png",
  imageAlt:
    "Natural light and shadow crossing a quiet stone courtyard wall in China.",
  path: "/trust",
  shareTitle: "Trust Before Matching — Localhost Global"
});

const operatingTrust = [
  {
    title: "Direct first review",
    copy:
      "Your first note is read by a named Localhost reviewer before a host or local collaborator is approached. It is not broadcast to a public marketplace."
  },
  {
    title: "Host verification",
    copy:
      "Hosts are reviewed for judgment, reliability, communication quality, cultural fluency, and the ability to represent a place with care."
  },
  {
    title: "Traveler safety and local support",
    copy:
      "Localhost supports route-level coordination, local judgment, timing, communication, transport rhythm, and practical decisions. It is not emergency response or 24/7 personal staffing."
  },
  {
    title: "Clear scope and boundaries",
    copy:
      "Every route should clarify what is included, what is not included, how host time works, and where Localhost may redirect or decline an inquiry that is not a fit."
  }
];

const reviewArtifacts = [
  {
    title: "A route direction",
    copy:
      "The first review identifies the chapter, route shape, and cultural question that appear most aligned with the inquiry."
  },
  {
    title: "A scope note",
    copy:
      "Before confirmation, host time, transport, meals, translation, payment help, and support limits are described plainly."
  },
  {
    title: "A fit decision",
    copy:
      "The next step is a confirmation, a redirect, or a clear decline when local feasibility or boundaries do not align."
  }
];

const trustProcess = [
  "Read — a Localhost reviewer checks intent, timing, comfort, route direction, and local feasibility.",
  "Check fit — we consider the right chapter, host capacity, boundaries, and whether the request is realistic.",
  "Clarify scope — host time, transport, meals, translation, payment help, and support limits are made explicit.",
  "Confirm or redirect — a route is confirmed only when fit and feasibility align; otherwise we say so plainly."
];

const trustCommitments = [
  {
    title: "Response window",
    copy: `A named Localhost reviewer usually replies ${localhostResponseWindow}.`
  },
  {
    title: "Privacy",
    copy:
      "Your email and message are not sent to site analytics or public host listings. Inquiry details are used for route review and shared only with relevant collaborators when needed for fit."
  },
  {
    title: "Confirmation",
    copy:
      "An inquiry creates no payment, reservation, or host obligation. Confirmation comes only after scope is understood."
  },
  {
    title: "Delegated inquiries",
    copy:
      "Assistants, family offices, family members, and trusted advisers may begin the review. We keep the initiating contact in the thread and do not bypass them without permission."
  }
];

const boundaries = [
  "Hosts are not servants.",
  "Hosts are not entertainers.",
  "Hosts are not drivers by default.",
  "Hosts are not emergency responders.",
  "Hosts are not forced to be available 24/7.",
  "Localhost does not encourage lowest-price bidding.",
  "Trust comes before scale.",
  "Localhost may decline or redirect inquiries that are not a fit.",
  "A public guide marketplace is not the model."
];

const trustTravelerInquiryHref =
  "/inquiry?type=traveler&sourcePage=%2Ftrust&sourceLabel=Trust%20page";
const trustPartnerInquiryHref =
  "/inquiry?type=partner&sourcePage=%2Ftrust&sourceLabel=Trust%20page";

export default function TrustPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <section className="page-hero support-hero page-hero--trust">
          <div>
            <p className="eyebrow">Trust</p>
            <h1>A local-host network only works if it protects both sides.</h1>
          </div>
          <div className="page-hero-copy">
            <p>
              Localhost is built around selected hosts, reviewed intent, clear
              boundaries, and quality control. The point is not maximum scale.
              The point is trust that can hold.
            </p>
            <div className="inline-actions">
              <Link
                className="button button--dark"
                data-track-event="request_route"
                data-track-source="trust_hero"
                href={trustTravelerInquiryHref}
              >
                Request a Private Route
              </Link>
              <Link className="text-link" href={trustPartnerInquiryHref}>
                Start partner conversation
              </Link>
            </div>
          </div>
        </section>

        <section className="section section--stone trust-process-section">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">The Review Checkpoints</p>
            <h2>Trust is a process, not a promise.</h2>
            <p>
              The inquiry is deliberately human. These are the points we work
              through before a private route is held.
            </p>
          </div>
          <ol className="rhythm-list">
            {trustProcess.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
          <div className="support-card-grid support-card-grid--four trust-commitments">
            {trustCommitments.map((item) => (
              <article className="support-detail-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section section--stone">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">Trust Architecture</p>
            <h2>What trust means before you submit an inquiry.</h2>
            <p>
              Localhost is designed to reduce uncertainty before a private route
              is shaped. The review, host fit, and scope are part of the product.
            </p>
          </div>
          <div className="support-card-grid">
            {operatingTrust.map((item) => (
              <article className="support-detail-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section section--stone trust-evidence-section">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">What You Can Inspect</p>
            <h2>Evidence before commitment.</h2>
            <p>
              Trust should show up in the work itself. These are review outputs,
              not testimonials, guarantees, or public host listings.
            </p>
          </div>
          <div className="support-card-grid support-card-grid--three">
            {reviewArtifacts.map((item) => (
              <article className="support-detail-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section section--dark">
          <div className="section-heading">
            <p className="eyebrow">Boundaries and discretion</p>
            <h2>The host is not a listing. The route is not a commodity.</h2>
            <p>
              A public marketplace optimizes for supply. Localhost optimizes for
              fit, judgment, and a relationship that protects the place.
            </p>
          </div>
          <ul className="reference-matrix reference-matrix--dark">
            {boundaries.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="section final-section">
          <div className="section-heading">
            <p className="eyebrow">Trust Before Scale</p>
            <h2>Begin with a route that can be held properly.</h2>
          </div>
          <div className="editorial-copy">
            <p>
              The private route inquiry is the first trust step: a way to
              understand intent before any host, city, or chapter is confirmed.
            </p>
            <div className="inline-actions">
              <Link
                className="button button--dark"
                data-track-event="request_route"
                data-track-source="trust_final"
                href={trustTravelerInquiryHref}
              >
                Request a Private Route
              </Link>
              <Link className="text-link" href={trustPartnerInquiryHref}>
                Start partner conversation
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
