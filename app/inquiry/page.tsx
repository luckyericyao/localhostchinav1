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
import { localhostResponseWindow } from "@/lib/contact";
import { culturalVisualLayers } from "@/lib/content";
import { buildLocalhostPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildLocalhostPageMetadata({
  title: "Private Route Preference Intake — Localhost Global",
  description:
    "Begin a private China route review with your intent, timing, comfort, curiosity, and preferred level of local support.",
  image: "/images/inquiry-courtyard-threshold.png",
  imageAlt:
    "A quiet Chinese courtyard threshold in natural light with warm stone texture.",
  path: "/inquiry",
  shareTitle: "Begin a Private China Route Review"
});

const afterSubmit = [
  "We review intent, timing, route direction, and local feasibility.",
  "We identify the right route direction or chapter.",
  "We suggest the right host role and level of involvement.",
  "We clarify scope, support limits, and what happens next.",
  "We confirm, redirect, or decline plainly when the fit is not right."
];

const firstReviewDeliverables = [
  "A route direction that matches what you want to understand.",
  "The useful host role and support level, if there is a fit.",
  "A clear next decision, including scope, limits, or a direct redirect."
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
      <main id="main-content">
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

        <section
          className="section section--inquiry inquiry-intake-section"
          id="private-route"
        >
          <div className="inquiry-shell inquiry-shell--wide">
            <div className="inquiry-copy">
              <div className="inquiry-copy-intro">
                <p className="eyebrow">Step 1: Start</p>
                <h2>Begin with your name, email, and one sentence.</h2>
                <p>
                  Submit the short version first. A Localhost reviewer reads it
                  before any host is approached, then checks fit, timing, route
                  direction, and local feasibility.
                </p>
                <p className="fine-copy">
                  For traveler inquiries, one sentence is enough: what kind of
                  China do you want to understand?
                </p>
              </div>
              <p className="fine-copy">
                Response window: {localhostResponseWindow} for a complete
                inquiry.
              </p>
              <p className="fine-copy">
                Pricing depends on route depth, host involvement, logistics,
                city coverage, and support level. Localhost does not quote
                before the route scope is understood.
              </p>
              <div className="review-deliverable-block">
                <p className="eyebrow">What the first review gives you</p>
                <ul className="clean-list">
                  {firstReviewDeliverables.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
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

        <section className="section section--dark">
          <div className="section-heading">
            <p className="eyebrow">After You Submit</p>
            <h2>What happens after you submit?</h2>
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
