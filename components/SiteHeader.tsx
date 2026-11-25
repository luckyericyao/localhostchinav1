import Link from "next/link";
import { NavigationInquiryLink } from "@/components/NavigationInquiryLink";
import { DiscoveryMenu } from "@/components/DiscoveryMenu";
import { NavigationDisclosure } from "@/components/NavigationDisclosure";
import { NavigationPageLink } from "@/components/NavigationPageLink";

const primaryLinks = [
  ["/china", "China"],
  ["/journeys", "Routes"],
  ["/travelers", "For Travelers"],
  ["/hosts", "For Hosts"],
  ["/trust", "Trust"]
] as const;

type SiteHeaderProps = {
  tone?: "transparent" | "solid";
  discovery?: boolean;
};

export function SiteHeader({ tone = "solid", discovery = false }: SiteHeaderProps) {
  const links = primaryLinks.map(([href, label]) => (
    <NavigationPageLink href={href} key={href}>{label}</NavigationPageLink>
  ));

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
              {links}
            </nav>
            <div className="header-actions">
              <NavigationInquiryLink className="nav-cta" source="header" />
              <NavigationDisclosure
                className="mobile-menu"
                panelClassName="mobile-menu-panel"
                menuLabel="Toggle navigation"
                navigationLabel="Mobile navigation"
              >
                {links}
              </NavigationDisclosure>
            </div>
          </>
        )}
      </header>
    </>
  );
}
