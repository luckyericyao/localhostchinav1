import type { Metadata } from "next";
import { ChinaRoutePage } from "@/components/ChinaRoutePage";
import { chinaRoutePages } from "@/lib/content";

export const metadata: Metadata = {
  title: "Shaolin — Localhost China",
  description:
    "A private Dengfeng and Songshan route shaped around Chan atmosphere, martial discipline, mountain stillness, and quiet cultural context."
};

export default function ShaolinPage() {
  return <ChinaRoutePage route={chinaRoutePages.shaolin} />;
}
