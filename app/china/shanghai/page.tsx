import type { Metadata } from "next";
import { ChinaRoutePage } from "@/components/ChinaRoutePage";
import { chinaRoutePages } from "@/lib/content";
import { buildLocalhostPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildLocalhostPageMetadata({
  title: "Shanghai — Localhost China",
  description:
    "A private Shanghai first-threshold route shaped around Bund context, a table chosen with judgment, an after-dark ending, and confident entry into China.",
  image: "/images/shanghai-bund-walk.png",
  imageAlt:
    "A quiet early evening walk along Shanghai's historic Bund riverfront.",
  path: "/china/shanghai"
});

export default function ShanghaiPage() {
  return <ChinaRoutePage route={chinaRoutePages.shanghai} />;
}
