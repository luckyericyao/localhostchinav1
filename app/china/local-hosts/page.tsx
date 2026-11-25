import { ChinaSupportDetailPage } from "@/components/ChinaSupportDetailPage";
import { chinaSupportPages } from "@/lib/content";
import { buildLocalhostPageMetadata } from "@/lib/metadata";

export const metadata = buildLocalhostPageMetadata({
  title: "Local Hosts in China — Localhost Global",
  description:
    "How Localhost selects hosts for local knowledge, communication, and fit, and what a host can help a traveler understand.",
  path: "/china/local-hosts"
});

export default function LocalHostsPage() {
  return <ChinaSupportDetailPage page={chinaSupportPages["local-hosts"]} />;
}
