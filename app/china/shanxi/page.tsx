import type { Metadata } from "next";
import { ChinaRoutePage } from "@/components/ChinaRoutePage";
import { chinaRoutePages } from "@/lib/content";
import { buildLocalhostPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildLocalhostPageMetadata({
  title: "Shanxi — Localhost China",
  description:
    "A flagship private route into ancient northern China: timber temples, Buddhist grottoes, merchant courtyards, food, and local context.",
  image: "/images/shanxi-ancient-grotto.png",
  imageAlt:
    "Weathered Buddhist grotto stone and old timber architecture in Shanxi.",
  path: "/china/shanxi"
});

export default function ShanxiPage() {
  return <ChinaRoutePage route={chinaRoutePages.shanxi} />;
}
