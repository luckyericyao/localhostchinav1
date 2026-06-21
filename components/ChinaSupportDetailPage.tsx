import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

type SupportCard = {
  title: string;
  copy: string;
};

type SupportIntro = {
  eyebrow: string;
  title: string;
  lead: string;
  body: string;
};

type SupportListSection = {
  eyebrow: string;
  title: string;
  items: readonly string[];
};

type SupportCardSection = {
  eyebrow: string;
  title: string;
  cards: readonly SupportCard[];
};

type SupportFinal = {
  eyebrow: string;
  title: string;
  body: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
};

export type ChinaSupportPageContent = {
  eyebrow: string;
  title: string;
  subheadline: string;
  body: string;
  intro: SupportIntro;
  listSection: SupportListSection;
  cardSection?: SupportCardSection;
  principleSection?: SupportCardSection;
  final: SupportFinal;
};

type ChinaSupportDetailPageProps = {
  page: ChinaSupportPageContent;
};

export function ChinaSupportDetailPage({ page }: ChinaSupportDetailPageProps) {
  return (
    <>
      <SiteHeader />
      <main className="support-detail-page">
        <section className="page-hero support-hero">
          <div>
            <p className="eyebrow">{page.eyebrow}</p>
            <h1>{page.title}</h1>
          </div>
          <div className="page-hero-copy">
            <p className="support-subhead">{page.subheadline}</p>
            <p>{page.body}</p>
            <div className="inline-actions">
              <Link className="button button--dark" href="/china">
                Back to China
              </Link>
              <Link className="text-link" href="/">
                Localhost Global
              </Link>
            </div>
          </div>
        </section>

        <section className="section intro-section">
          <div className="section-heading">
            <p className="eyebrow">{page.intro.eyebrow}</p>
            <h2>{page.intro.title}</h2>
          </div>
          <div className="editorial-copy">
            <p className="lead">{page.intro.lead}</p>
            <p>{page.intro.body}</p>
          </div>
        </section>

        {page.cardSection ? (
          <section className="section section--stone">
            <div className="section-heading section-heading--center">
              <p className="eyebrow">{page.cardSection.eyebrow}</p>
              <h2>{page.cardSection.title}</h2>
            </div>
            <div className="support-card-grid">
              {page.cardSection.cards.map((card) => (
                <article className="support-detail-card" key={card.title}>
                  <h3>{card.title}</h3>
                  <p>{card.copy}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="section section--stone">
          <div className="section-heading section-heading--center">
            <p className="eyebrow">{page.listSection.eyebrow}</p>
            <h2>{page.listSection.title}</h2>
          </div>
          <ul
            className="reference-matrix"
            aria-label={`${page.listSection.eyebrow} details`}
          >
            {page.listSection.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        {page.principleSection ? (
          <section className="section section--dark">
            <div className="section-heading">
              <p className="eyebrow">{page.principleSection.eyebrow}</p>
              <h2>{page.principleSection.title}</h2>
            </div>
            <div className="support-card-grid">
              {page.principleSection.cards.map((card) => (
                <article
                  className="support-detail-card support-detail-card--dark"
                  key={card.title}
                >
                  <h3>{card.title}</h3>
                  <p>{card.copy}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="section final-section">
          <div className="section-heading">
            <p className="eyebrow">{page.final.eyebrow}</p>
            <h2>{page.final.title}</h2>
          </div>
          <div className="editorial-copy">
            <p>{page.final.body}</p>
            <div className="inline-actions">
              <Link className="button button--dark" href={page.final.primaryHref}>
                {page.final.primaryLabel}
              </Link>
              <Link className="text-link" href={page.final.secondaryHref}>
                {page.final.secondaryLabel}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
