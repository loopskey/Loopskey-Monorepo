import type { NextConfig } from "next";

const ONE_DAY_SECONDS = 60 * 60 * 24;
const ONE_WEEK_SECONDS = ONE_DAY_SECONDS * 7;

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,

  images: {
    // AVIF first, WebP as the fallback, before the original format.
    formats: ["image/avif", "image/webp"],
    // Optimized remote images are re-fetched at most once a day.
    minimumCacheTTL: ONE_DAY_SECONDS,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      { protocol: "https", hostname: "example.com" },
      {
        protocol: "https",
        hostname: "d3njjcbhbojbot.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "coursera-course-photos.s3.amazonaws.com",
      },
    ],
  },

  experimental: {
    // Rewrites barrel imports to direct module paths so a single icon does not
    // drag the whole icon set into a chunk.
    optimizePackageImports: ["lucide-react", "recharts"],
  },

  async headers() {
    return [
      {
        // Static assets served straight from /public. Next only sets immutable
        // caching for its own content-hashed output under /_next/static, so
        // these would otherwise be revalidated on every navigation.
        source: "/:path*.(svg|png|jpg|jpeg|webp|avif|ico|woff|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: `public, max-age=${ONE_DAY_SECONDS}, stale-while-revalidate=${ONE_WEEK_SECONDS}`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
