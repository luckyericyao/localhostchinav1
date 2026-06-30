import Link from "next/link";
import { InquiryForm } from "@/components/InquiryForm";

type InquirySectionProps = {
  id?: string;
  compact?: boolean;
};

export function InquirySection({
  id = "inquiry",
  compact = false
}: InquirySectionProps) {
  if (compact) {
    return (
      <section className="section section--inquiry" id={id}>
        <div className="inquiry-preview inquiry-preview--compact">
          <div className="section-heading">
            <p className="eyebrow">Private Route Review</p>
            <h2>Plan a private way into China.</h2>
          </div>
          <div className="editorial-copy">
            <p>
              Tell us what kind of China you want to understand. We review fit,
              timing, and local feasibility before any route is confirmed.
            </p>
            <Link className="button button--dark" href="/inquiry">
              Request Private Route Review
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section section--inquiry" id={id}>
      <div className="inquiry-shell">
        <div className="inquiry-copy">
          <p className="eyebrow">Private Route Inquiry</p>
          <h2>Plan a private way into China.</h2>
          <p>
            Tell us what kind of China you want to understand. We will shape the
            route, host, and local support around your curiosity.
          </p>
          {compact ? null : (
            <p className="fine-copy">
              This is a private intake, not an automated booking flow. A route
              should begin with context.
            </p>
          )}
        </div>

        <InquiryForm />
      </div>
    </section>
  );
}
