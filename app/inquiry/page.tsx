import type { Metadata } from "next";
import Link from "next/link";
import { CulturalImageLayer } from "@/components/CulturalImageLayer";
import { LocalhostIntakeForm } from "@/components/LocalhostIntakeForm";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import type {
  LocalhostIntentType,
  LocalhostRouteContext
} from "@/app/actions/submitLocalhostInquiry";
import { culturalVisualLayers } from "@/lib/content";

export const metadata: Metadata = {
  title: "Private Route Preference Intake — Localhost Global",
  description:
    "A detailed private China route intake for food rhythm, comfort, curiosity, host fit, and practical support."
};

const afterSubmit = [
  "A prepared email opens with your route review details.",
  "We read for intent, not just dates.",
  "We identify the right route direction.",
  "We check whether a local host fit is realistic.",
  "We clarify feasibility before anything becomes a route.",
  "If the request is not a fit, we may redirect or decline it."
];

const canStayOpen = [
  {
    title: "Dates can be approximate",
    copy:
      "A month, season, or rough window is enough. Exact flights are not needed for the first review."
  },
  {
    title: "The route can be undecided",
    copy:
      "Shanxi, Shaolin, Huizhou, Shanghai, or not sure yet are all acceptable starting points."
  },
  {
    title: "Comfort can be described plainly",
    copy:
      "Private car, walking tolerance, hotel style, food comfort, privacy, and day rhythm can be described in ordinary language."
  },
  {
    title: "Constraints matter more than polish",
    copy:
      "Dietary needs, mobility, children, business privacy, sensitive context, and things to avoid help us review fit."
  }
];

type InquiryPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const intentTypes = ["traveler", "host", "partner"] as const;
const routeContexts = [
  "shanxi",
  "shaolin",
  "huizhou",
  "shanghai",
  "beijing",
  "chengdu",
  "china-general"
] as const;

function firstValue(value?: string | string[]) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function parseIntent(value?: string): LocalhostIntentType | undefined {
  return intentTypes.includes(value as LocalhostIntentType)
    ? (value as LocalhostIntentType)
    : undefined;
}

function parseRoute(value?: string): LocalhostRouteContext | undefined {
  return routeContexts.includes(value as LocalhostRouteContext)
    ? (value as LocalhostRouteContext)
    : undefined;
}

export default async function InquiryPage({ searchParams }: InquiryPageProps) {
  const params = (await searchParams) || {};
  const intentType = parseIntent(firstValue(params.type)) || "traveler";
  const routeContext = parseRoute(firstValue(params.route));
  const sourcePage = firstValue(params.sourcePage) || "/inquiry";
  const sourceLabel = firstValue(params.sourceLabel) || "Inquiry page";

  return (
    <>
      <SiteHeader />
      <main>
        <section className="page-hero support-hero page-hero--inquiry">
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
              Start lightly. A full itinerary is not needed.
            </p>
          </div>
        </section>

        <CulturalImageLayer {...culturalVisualLayers.inquiry} tone="paper" />

        <section className="section section--stone">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">What Can Stay Open</p>
            <h2>You do not need a finished plan before you write.</h2>
            <p>
              The inquiry is not a final itinerary. It helps us understand
              whether the route can be shaped and held well.
            </p>
          </div>
          <div className="support-card-grid">
            {canStayOpen.map((item) => (
              <article className="support-detail-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section section--inquiry" id="private-route">
          <div className="inquiry-shell inquiry-shell--wide">
            <div className="inquiry-copy">
              <p className="eyebrow">Step 1: Start</p>
              <h2>Begin with email and one sentence.</h2>
              <p>
                Submit the short version first. We prepare a structured email
                inquiry so a human can review fit, timing, and local
                feasibility.
              </p>
              <p className="fine-copy">
                For traveler inquiries, one sentence is enough: what kind of
                China do you want to understand?
              </p>
              <p className="fine-copy">
                Pricing depends on route depth, host involvement, logistics,
                city coverage, and support level. Localhost does not quote
                before the route scope is understood.
              </p>
            </div>
            <LocalhostIntakeForm
              contextLocked={Boolean(routeContext)}
              intentType={intentType}
              routeContext={routeContext}
              sourceLabel={sourceLabel}
              sourcePage={sourcePage}
            />
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
