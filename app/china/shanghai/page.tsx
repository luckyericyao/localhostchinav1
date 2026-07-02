import type { Metadata } from "next";
import { ChinaRoutePage } from "@/components/ChinaRoutePage";
import { chinaRoutePages } from "@/lib/content";

export const metadata: Metadata = {
  title: "Shanghai — Localhost China",
  description:
    "A private Shanghai first-threshold route shaped around Bund context, a table chosen with judgment, an after-dark ending, and confident entry into China."
};

export default function ShanghaiPage() {
  return <ChinaRoutePage route={chinaRoutePages.shanghai} />;
}
