import Link from "next/link";
import { NavigationDisclosure } from "@/components/NavigationDisclosure";
import { NavigationInquiryLink } from "@/components/NavigationInquiryLink";

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
          <Link
            href={`/china/${place.toLowerCase()}`}
            data-discovery-chapter={place.toLowerCase()}
            key={place}
          >
            {place}
          </Link>
        ))}
      </div>
      <div className="discovery-menu-context">
        <Link href="/china">China</Link>
        <Link href="/journeys">Compare routes</Link>
        <Link href="/about">About Localhost</Link>
        <Link href="/travelers">Traveling with us</Link>
        <Link href="/trust">Trust & care</Link>
        <Link href="/hosts">For hosts</Link>
        <NavigationInquiryLink className="discovery-contact" source="header" label="Contact" />
      </div>
    </NavigationDisclosure>
  );
}
