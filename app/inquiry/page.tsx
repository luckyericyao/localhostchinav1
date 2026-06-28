import type { Metadata } from "next";
import Link from "next/link";
import { DetailedInquiryForm } from "@/components/DetailedInquiryForm";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Private Route Preference Intake — Localhost Global",
  description:
    "A detailed private China route intake for food rhythm, comfort, curiosity, host fit, and quiet practical support."
};

const afterSubmit = [
  "We read for intent, not just dates.",
  "We identify the right route direction.",
  "We check whether a local host fit is realistic.",
  "We shape the food, pace, comfort, and support level.",
  "We clarify what is feasible before anything becomes a route.",
  "If the request is not a fit, we may redirect or decline it."
];

export default function InquiryPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="page-hero support-hero">
          <div>
            <p className="eyebrow">Private Inquiry</p>
            <h1>Tell us how you want to enter China.</h1>
          </div>
          <div className="page-hero-copy">
            <p>
              Food, rhythm, comfort, privacy, curiosity, small pleasures, and
              host fit help us shape a private route.
            </p>
            <p className="support-subhead">
              This is not a booking engine.
            </p>
          </div>
        </section>

        <section className="section section--inquiry" id="private-route">
          <div className="inquiry-shell inquiry-shell--wide">
            <div className="inquiry-copy">
              <p className="eyebrow">Private Route Preference System</p>
              <h2>A route shaped around taste, rhythm, and host fit.</h2>
              <p>
                The more specific you are, the better Localhost can understand
                route fit, food rhythm, comfort direction, practical support,
                and the kind of local person you would trust.
              </p>
              <p className="fine-copy">
                Traveler intake is prioritized here. Host and partner paths
                remain available for people building the network.
              </p>
              <p className="fine-copy">
                Pricing depends on route depth, host involvement, logistics,
                city coverage, and support level. Localhost does not quote
                before the route scope is understood.
              </p>
            </div>
            <DetailedInquiryForm />
          </div>
        </section>

        <section className="section section--dark">
          <div className="section-heading">
            <p className="eyebrow">After Preparation</p>
            <h2>What happens after this intake is prepared?</h2>
          </div>
          <ol className="rhythm-list rhythm-list--dark">
            {afterSubmit.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
          <div className="editorial-copy after-submit-note">
            <p>
              Localhost is not an instant booking engine. A private route begins
              only when intent, timing, host fit, and local feasibility align.
            </p>
          </div>
        </section>

        <section className="section final-section">
          <div className="section-heading">
            <p className="eyebrow">A Human Intake</p>
            <h2>No instant booking. No random matching.</h2>
          </div>
          <div className="editorial-copy">
            <p>
              A Localhost inquiry may become a traveler route, host
              conversation, partner discussion, or a polite redirect. Fit,
              safety, timing, and local judgment decide the next step.
            </p>
            <div className="inline-actions">
              <Link className="button button--dark" href="/how-it-works">
                See How It Works
              </Link>
              <Link className="text-link" href="/trust">
                Read the trust model
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
