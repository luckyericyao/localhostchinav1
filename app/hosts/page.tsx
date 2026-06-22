import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Hosts — Localhost Global",
  description:
    "A way for thoughtful locals to represent home with dignity, local judgment, cultural context, and trust."
};

const whoCanHost = [
  "People with deep local knowledge",
  "Globally minded locals",
  "Students, founders, artists, operators, researchers, and community builders",
  "People who can explain context, not just lead people around"
];

const hostWork = [
  "Help design or refine local routes",
  "Share local context",
  "Help with food, timing, language, and rhythm",
  "Protect the dignity of local culture",
  "Avoid superficial tourism"
];

const boundaries = [
  "No unsafe situations",
  "No forced full-time availability",
  "No being treated like a servant",
  "No low-quality mass tourism"
];

const rewards = [
  "Earn income",
  "Build global relationships",
  "Earn Host Credits",
  "Represent your home with dignity"
];

export default function HostsPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="page-hero support-hero">
          <div>
            <p className="eyebrow">For Hosts</p>
            <h1>You are not a tour guide. You are the doorway.</h1>
          </div>
          <div className="page-hero-copy">
            <p>
              Localhost hosts help thoughtful travelers enter the local rhythm
              of a place with dignity, context, and trust.
            </p>
            <Link className="button button--dark" href="/inquiry">
              Apply to Become a Host
            </Link>
          </div>
        </section>

        <section className="section section--stone">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">Who Can Become A Host</p>
            <h2>Local knowledge, global patience.</h2>
          </div>
          <ul className="reference-matrix">
            {whoCanHost.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="section split-panel-section">
          <div className="quiet-panel">
            <p className="eyebrow">What Hosts Do</p>
            <ul className="clean-list">
              {hostWork.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="quiet-panel">
            <p className="eyebrow">What Hosts Are Not Expected To Do</p>
            <ul className="clean-list">
              {boundaries.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section section--dark">
          <div className="section-heading">
            <p className="eyebrow">Rewards</p>
            <h2>Hospitality should be respected.</h2>
          </div>
          <ul className="reference-matrix reference-matrix--dark">
            {rewards.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="section final-section">
          <div className="section-heading">
            <p className="eyebrow">Host At Home</p>
            <h2>Represent your home with dignity.</h2>
          </div>
          <div className="editorial-copy">
            <p>
              A Localhost host is a cultural doorway: calm, trusted, locally
              grounded, and able to welcome people who are genuinely curious.
            </p>
            <div className="inline-actions">
              <Link className="button button--dark" href="/inquiry">
                Apply to Become a Host
              </Link>
              <Link className="text-link" href="/host-credits">
                Learn about Host Credits
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
