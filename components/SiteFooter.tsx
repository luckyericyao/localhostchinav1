import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <p className="footer-title">Localhost Global — Travel Back Home.</p>
        <p>
          Every place is someone&apos;s home. Localhost is a private local-host
          network for cultural context, trusted hospitality, and quiet support.
        </p>
        <p className="footer-note">China is the first chapter.</p>
      </div>
      <nav aria-label="Footer navigation">
        <Link href="/china">China</Link>
        <Link href="/journeys">Journeys</Link>
        <Link href="/travelers">Travelers</Link>
        <Link href="/hosts">Hosts</Link>
        <Link href="/host-credits">Host Credits</Link>
        <Link href="/inquiry">Inquiry</Link>
        <Link href="/china/shanxi">Shanxi</Link>
        <Link href="/china/shaolin">Shaolin</Link>
        <Link href="/china/huizhou">Huizhou</Link>
      </nav>
      <div className="footer-actions" aria-label="Footer actions">
        <Link className="button button--light" href="/inquiry">
          Request a Private Route
        </Link>
        <Link className="text-link text-link--light" href="/hosts">
          Become a Host
        </Link>
      </div>
    </footer>
  );
}
