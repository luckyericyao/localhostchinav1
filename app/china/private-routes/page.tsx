import { ChinaSupportDetailPage } from "@/components/ChinaSupportDetailPage";
import { chinaSupportPages } from "@/lib/content";

export default function PrivateRoutesPage() {
  return <ChinaSupportDetailPage page={chinaSupportPages["private-routes"]} />;
}
