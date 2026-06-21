import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <p className="footer-title">Localhost Global — Travel Back Home.</p>
        <p>A global local-host network, starting with China.</p>
      </div>
      <nav aria-label="Footer navigation">
        <Link href="/china">China</Link>
        <Link href="/china/shanxi">Shanxi</Link>
        <Link href="/china/shaolin">Shaolin</Link>
        <Link href="/china/huizhou">Huizhou</Link>
        <Link href="/#travelers">Travelers</Link>
        <Link href="/#hosts">Hosts</Link>
      </nav>
    </footer>
  );
}
