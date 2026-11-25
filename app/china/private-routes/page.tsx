import { ChinaSupportDetailPage } from "@/components/ChinaSupportDetailPage";
import { chinaSupportPages } from "@/lib/content";
import { buildLocalhostPageMetadata } from "@/lib/metadata";

export const metadata = buildLocalhostPageMetadata({
  title: "Private Route Design in China — Localhost Global",
  description:
    "How a private China route takes shape around your timing, curiosity, and comfort, with room to adapt as the day unfolds.",
  path: "/china/private-routes"
});

export default function PrivateRoutesPage() {
  return <ChinaSupportDetailPage page={chinaSupportPages["private-routes"]} />;
}
