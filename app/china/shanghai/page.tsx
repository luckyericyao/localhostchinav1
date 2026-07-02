import type { Metadata } from "next";
import { ChinaRoutePage } from "@/components/ChinaRoutePage";
import { chinaRoutePages } from "@/lib/content";

export const metadata: Metadata = {
  title: "Shanghai — Localhost China",
  description:
    "A private Shanghai first-stop route shaped around a Bund walk, a private table, a secret night ending, and confident entry into China."
};

export default function ShanghaiPage() {
  return <ChinaRoutePage route={chinaRoutePages.shanghai} />;
}
