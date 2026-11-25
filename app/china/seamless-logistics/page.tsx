import { ChinaSupportDetailPage } from "@/components/ChinaSupportDetailPage";
import { chinaSupportPages } from "@/lib/content";
import { buildLocalhostPageMetadata } from "@/lib/metadata";

export const metadata = buildLocalhostPageMetadata({
  title: "Travel Logistics in China — Localhost Global",
  description:
    "Practical support for transport, payments, local apps, translation, meals, and timing on a private China route.",
  path: "/china/seamless-logistics"
});

export default function SeamlessLogisticsPage() {
  return (
    <ChinaSupportDetailPage page={chinaSupportPages["seamless-logistics"]} />
  );
}
