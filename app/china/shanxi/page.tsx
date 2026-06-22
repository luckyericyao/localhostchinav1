import type { Metadata } from "next";
import { ChinaRoutePage } from "@/components/ChinaRoutePage";
import { chinaRoutePages } from "@/lib/content";

export const metadata: Metadata = {
  title: "Shanxi — Localhost China",
  description:
    "A flagship private cultural route into ancient northern China: wooden temples, Buddhist mountains, merchant courtyards, food, and local context."
};

export default function ShanxiPage() {
  return <ChinaRoutePage route={chinaRoutePages.shanxi} />;
}
