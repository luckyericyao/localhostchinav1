import { ChinaSupportDetailPage } from "@/components/ChinaSupportDetailPage";
import { chinaSupportPages } from "@/lib/content";

export default function LocalHostsPage() {
  return <ChinaSupportDetailPage page={chinaSupportPages["local-hosts"]} />;
}
