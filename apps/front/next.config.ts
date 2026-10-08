import type { NextConfig } from "next";

import { isIndexableDeployment } from "./src/lib/site/deployment-env";
import {
  NOINDEX_DIRECTIVE,
  ROBOTS_TAG_HEADER,
  noindexHeaderSources,
} from "./src/lib/site/route-policy";
import {
  CANONICAL_HOST_ALIASES,
  IS_HTTPS_REDIRECT_ENABLED,
  SITE_ORIGIN,
} from "./src/lib/site/site-origin";

type Redirects = Awaited<ReturnType<NonNullable<NextConfig["redirects"]>>>;

const ONE_DAY_SECONDS = 60 * 60 * 24;
const ONE_WEEK_SECONDS = ONE_DAY_SECONDS * 7;

const EVERY_PATH = "/:path*";

const ROBOTS_TAG = { key: ROBOTS_TAG_HEADER, value: NOINDEX_DIRECTIVE };

const canonicalHostRedirects = (): Redirects =>
  CANONICAL_HOST_ALIASES.map((host) => ({
    source: EVERY_PATH,
    has: [{ type: "host", value: host }],
    destination: `${SITE_ORIGIN}${EVERY_PATH}`,
    permanent: true,
  }));

const forwardedHttpRedirects = (): Redirects =>
  IS_HTTPS_REDIRECT_ENABLED
    ? [
        {
          source: EVERY_PATH,
          has: [{ type: "header", key: "x-forwarded-proto", value: "http" }],
          destination: `${SITE_ORIGIN}${EVERY_PATH}`,
          permanent: true,
        },
      ]
    : [];

const nextConfig: NextConfig = {
  // Produce a minimal self-contained server bundle for the production image.
  output: "standalone",
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
      // The two Coursera image hosts were removed in the content image policy
      // phase: crawled catalog artwork is never hot-linked. A row without a
      // platform-hosted image renders the generated card instead.
    ],
  },

  experimental: {
    // Rewrites barrel imports to direct module paths so a single icon does not
    // drag the whole icon set into a chunk.
    optimizePackageImports: ["lucide-react", "recharts"],
  },

  async redirects() {
    return [...canonicalHostRedirects(), ...forwardedHttpRedirects()];
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
      ...(isIndexableDeployment
        ? noindexHeaderSources().map((source) => ({
            source,
            headers: [ROBOTS_TAG],
          }))
        : [{ source: EVERY_PATH, headers: [ROBOTS_TAG] }]),
    ];
  },
};

export default nextConfig;
