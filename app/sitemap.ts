import type { MetadataRoute } from "next";
import { localhostSiteUrl } from "@/lib/metadata";

const routes = [
  "",
  "/china",
  "/journeys",
  "/china/shanxi",
  "/china/shaolin",
  "/china/huizhou",
  "/china/shanghai",
  "/travelers",
  "/hosts",
  "/trust",
  "/inquiry",
  "/how-it-works",
  "/about",
  "/china/private-routes",
  "/china/local-hosts",
  "/china/real-access",
  "/china/seamless-logistics",
  "/host-credits"
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((path) => ({
    url: `${localhostSiteUrl}${path}`,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority:
      path === "" ? 1 : path === "/china" || path === "/journeys" ? 0.9 : 0.7
  }));
}
