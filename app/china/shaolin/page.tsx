import type { Metadata } from "next";
import { ChinaRoutePage } from "@/components/ChinaRoutePage";
import { chinaRoutePages } from "@/lib/content";
import { buildLocalhostPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildLocalhostPageMetadata({
  title: "Shaolin — Localhost China",
  description:
    "A private Dengfeng and Songshan route shaped around Chan atmosphere, martial discipline, mountain stillness, and cultural context beyond spectacle.",
  image: "/images/shaolin-temple-gate.png",
  imageAlt:
    "Shaolin Temple beneath Songshan mountain haze in quiet morning light.",
  path: "/china/shaolin"
});

export default function ShaolinPage() {
  return <ChinaRoutePage route={chinaRoutePages.shaolin} />;
}
