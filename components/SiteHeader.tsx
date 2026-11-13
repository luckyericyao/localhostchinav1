import Link from "next/link";
import { NavigationInquiryLink } from "@/components/NavigationInquiryLink";
import { DiscoveryMenu } from "@/components/DiscoveryMenu";

type SiteHeaderProps = {
  tone?: "transparent" | "solid";
  discovery?: boolean;
};

export function SiteHeader({ tone = "solid", discovery = false }: SiteHeaderProps) {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className={`site-header site-header--${tone}${discovery ? " site-header--discovery" : ""}`}>
        <Link className="brand-link" href="/" aria-label="Localhost Global home">
          <span>Localhost Global</span>
        </Link>
        {discovery ? (
          <DiscoveryMenu />
        ) : (
          <>
            <nav className="main-nav main-nav--desktop" aria-label="Primary navigation">
              <Link href="/china">China</Link>
              <Link href="/journeys">Routes</Link>
              <Link href="/travelers">For Travelers</Link>
              <Link href="/hosts">For Hosts</Link>
              <Link href="/trust">Trust</Link>
            </nav>
            <div className="header-actions">
              <NavigationInquiryLink className="nav-cta" source="header" />
              <details className="mobile-menu">
                <summary aria-controls="mobile-navigation" aria-label="Toggle navigation">
                  Menu
                </summary>
                <nav
                  className="mobile-menu-panel"
                  id="mobile-navigation"
                  aria-label="Mobile navigation"
                >
                  <Link href="/china">China</Link>
                  <Link href="/journeys">Routes</Link>
                  <Link href="/travelers">For Travelers</Link>
                  <Link href="/hosts">For Hosts</Link>
                  <Link href="/trust">Trust</Link>
                </nav>
              </details>
            </div>
          </>
        )}
      </header>
    </>
  );
}
