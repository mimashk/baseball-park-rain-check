import type { MetadataRoute } from "next";
import { TEAM_IDS } from "@/lib/ui/team";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/+$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = [
    "",
    "/company",
    "/privacy-policy",
    "/terms",
    "/contact",
  ];

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${siteUrl}${path || "/"}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: path === "" ? 1.0 : 0.6,
  }));

  const teamEntries: MetadataRoute.Sitemap = TEAM_IDS.map((teamId) => ({
    url: `${siteUrl}/team/${teamId}`,
    lastModified: now,
    changeFrequency: "hourly",
    priority: 0.8,
  }));

  return [...staticEntries, ...teamEntries];
}
