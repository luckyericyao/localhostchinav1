import { ChinaSupportDetailPage } from "@/components/ChinaSupportDetailPage";
import { chinaSupportPages } from "@/lib/content";
import { buildLocalhostPageMetadata } from "@/lib/metadata";

export const metadata = buildLocalhostPageMetadata({
  title: "Cultural Access in China — Localhost Global",
  description:
    "What local context and permission make possible, from neighborhood tables to visits that depend on an invitation.",
  path: "/china/real-access"
});

export default function RealAccessPage() {
  return <ChinaSupportDetailPage page={chinaSupportPages["real-access"]} />;
}
