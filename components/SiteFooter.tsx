import Link from "next/link";
import { NavigationInquiryLink } from "@/components/NavigationInquiryLink";

export function SiteFooter({ discovery = false }: { discovery?: boolean }) {
  return (
    <footer className={`site-footer${discovery ? " site-footer--discovery" : ""}`}>
      <div className="footer-brand">
        <p className="footer-title">Localhost Global</p>
        {discovery ? (
          <p>Journeys through China, shaped with local hosts.</p>
        ) : (
          <>
            <p>
              Private China routes shaped through local judgment, cultural context,
              trusted hosts, and practical steadiness.
            </p>
            <p>
              Not a travel agency. Not a tour marketplace. Not instant booking. A
              private local-host network, starting with China.
            </p>
            <p className="footer-note">China is the first chapter.</p>
          </>
        )}
      </div>
      <nav aria-label="Footer navigation">
        <Link href="/china">China</Link>
        <Link href="/journeys">Routes</Link>
        <Link href="/travelers">For Travelers</Link>
        <Link href="/hosts">For Hosts</Link>
        <Link href="/trust">Trust</Link>
        <Link href="/inquiry">Inquiry</Link>
        <Link href="/about">About</Link>
        <Link href="/how-it-works">How It Works</Link>
        <Link href="/host-credits">Host Credits</Link>
      </nav>
      <div className="footer-actions" aria-label="Footer actions">
        <NavigationInquiryLink
          className={discovery ? "text-link" : "button button--light"}
          source="footer"
          label={discovery ? "Contact" : undefined}
        />
      </div>
    </footer>
  );
}
