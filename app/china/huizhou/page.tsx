import type { Metadata } from "next";
import { ChinaRoutePage } from "@/components/ChinaRoutePage";
import { chinaRoutePages } from "@/lib/content";
import { buildLocalhostPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildLocalhostPageMetadata({
  title: "Huizhou — Localhost China",
  description:
    "A private Huizhou and Huangshan route through white walls, black tiles, ancestral halls, tea, mountain mist, and local interpretation.",
  image: "/images/huizhou-rain-courtyard.png",
  imageAlt:
    "A rain-washed Huizhou lane with white walls, dark tiled roofs, and mountain mist.",
  path: "/china/huizhou"
});

export default function HuizhouPage() {
  return <ChinaRoutePage route={chinaRoutePages.huizhou} />;
}
