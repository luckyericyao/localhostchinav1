import { LocalhostIntakeForm } from "@/components/LocalhostIntakeForm";
import type { LocalhostRouteContext } from "@/app/actions/submitLocalhostInquiry";

type InquirySectionProps = {
  compact?: boolean;
  id?: string;
  routeContext?: LocalhostRouteContext;
  sourceLabel?: string;
  sourcePage?: string;
};

export function InquirySection({
  compact = false,
  id = "inquiry",
  routeContext,
  sourceLabel,
  sourcePage = "/china"
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
              Start lightly. A full itinerary is not needed.
            </p>
            <LocalhostIntakeForm
              compact
              embedded
              routeContext={routeContext}
              sourceLabel={sourceLabel}
              sourcePage={sourcePage}
            />
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
          <p className="fine-copy">
            Start lightly. A full itinerary is not needed.
          </p>
        </div>

        <LocalhostIntakeForm
          embedded
          routeContext={routeContext}
          sourceLabel={sourceLabel}
          sourcePage={sourcePage}
        />
      </div>
    </section>
  );
}
