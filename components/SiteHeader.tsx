import Link from "next/link";

type SiteHeaderProps = {
  tone?: "transparent" | "solid";
};

export function SiteHeader({ tone = "solid" }: SiteHeaderProps) {
  return (
    <header className={`site-header site-header--${tone}`}>
      <Link className="brand-link" href="/" aria-label="Localhost Global home">
        <span>Localhost Global</span>
      </Link>
      <nav className="main-nav" aria-label="Primary navigation">
        <Link href="/china">China</Link>
        <Link href="/travelers">For Travelers</Link>
        <Link href="/hosts">For Hosts</Link>
        <Link href="/host-credits">Host Credits</Link>
        <Link href="/inquiry">Inquiry</Link>
      </nav>
      <Link className="nav-cta" href="/inquiry">
        Start a Private Route
      </Link>
    </header>
  );
}
