import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <p className="footer-title">Localhost Global — Travel Back Home.</p>
        <p>
          Every place is someone&apos;s home. Localhost is a private local-host
          network for cultural context, trusted hospitality, and practical
          steadiness.
        </p>
        <p>
          Not a travel agency. Not a tour marketplace. Not instant booking. A
          private local-host network, starting with China.
        </p>
        <p className="footer-note">China is the first chapter.</p>
      </div>
      <nav aria-label="Footer navigation">
        <Link href="/china">China</Link>
        <Link href="/journeys">Routes</Link>
        <Link href="/travelers">For Travelers</Link>
        <Link href="/hosts">For Hosts</Link>
        <Link href="/trust">Trust</Link>
        <Link href="/about">About</Link>
        <Link href="/how-it-works">How It Works</Link>
        <Link href="/host-credits">Host Credits</Link>
        <Link href="/inquiry">Inquiry</Link>
      </nav>
      <div className="footer-actions" aria-label="Footer actions">
        <Link className="button button--light" href="/inquiry">
          Request a Private Route
        </Link>
      </div>
    </footer>
  );
}
