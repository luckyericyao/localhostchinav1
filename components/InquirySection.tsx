import { InquiryForm } from "@/components/InquiryForm";

type InquirySectionProps = {
  id?: string;
  compact?: boolean;
};

export function InquirySection({
  id = "inquiry",
  compact = false
}: InquirySectionProps) {
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
