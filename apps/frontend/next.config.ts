import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  images: {
    minimumCacheTTL: 2592000, // 30 days
    unoptimized: true,
  },
  async headers() {
    return [
      // チームロゴなど（更新頻度低め）
      {
        source: "/teams/:path*",
        headers: [
          {
            key: "Cache-Control",
            value:
              "public, max-age=2592000, s-maxage=2592000, stale-while-revalidate=86400",
          },
        ],
      },
      // ロゴ/シェアアイコン
      {
        source: "/logo/:path*",
        headers: [
          {
            key: "Cache-Control",
            value:
              "public, max-age=2592000, s-maxage=2592000, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/share/:path*",
        headers: [
          {
            key: "Cache-Control",
            value:
              "public, max-age=2592000, s-maxage=2592000, stale-while-revalidate=86400",
          },
        ],
      },
      // OG背景画像（差し替えがありえるなら短めでもOK）
      {
        source: "/og/:path*",
        headers: [
          {
            key: "Cache-Control",
            value:
              "public, max-age=2592000, s-maxage=2592000, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

initOpenNextCloudflareForDev();
