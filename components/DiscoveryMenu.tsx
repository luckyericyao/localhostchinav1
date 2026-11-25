import { NavigationDisclosure } from "@/components/NavigationDisclosure";
import { NavigationInquiryLink } from "@/components/NavigationInquiryLink";
import { NavigationPageLink } from "@/components/NavigationPageLink";

const chapters = ["Shanxi", "Shaolin", "Huizhou", "Shanghai"] as const;

export function DiscoveryMenu() {
  return (
    <NavigationDisclosure
      className="discovery-menu"
      panelClassName="discovery-menu-panel"
      menuLabel="Explore Localhost"
    >
      <div className="discovery-menu-chapters">
        <p className="eyebrow">China / Chapters</p>
        {chapters.map((place) => (
          <NavigationPageLink
            href={`/china/${place.toLowerCase()}`}
            data-discovery-chapter={place.toLowerCase()}
            key={place}
          >
            {place}
          </NavigationPageLink>
        ))}
      </div>
      <div className="discovery-menu-context">
        <NavigationPageLink href="/china">China</NavigationPageLink>
        <NavigationPageLink href="/journeys">Compare routes</NavigationPageLink>
        <NavigationPageLink href="/about">About Localhost</NavigationPageLink>
        <NavigationPageLink href="/travelers">Traveling with us</NavigationPageLink>
        <NavigationPageLink href="/trust">Trust & care</NavigationPageLink>
        <NavigationPageLink href="/hosts">For hosts</NavigationPageLink>
        <NavigationInquiryLink className="discovery-contact" source="header" label="Contact" />
      </div>
    </NavigationDisclosure>
  );
}
