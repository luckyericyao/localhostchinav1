import type { Metadata } from "next";
import { ChinaRoutePage } from "@/components/ChinaRoutePage";
import { chinaRoutePages } from "@/lib/content";

export const metadata: Metadata = {
  title: "Huizhou — Localhost China",
  description:
    "A private Huizhou and Huangshan route through white walls, black tiles, ancestral halls, tea, mountain mist, and local context."
};

export default function HuizhouPage() {
  return <ChinaRoutePage route={chinaRoutePages.huizhou} />;
}
