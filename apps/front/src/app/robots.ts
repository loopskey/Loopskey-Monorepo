import type { MetadataRoute } from "next";

import { isIndexableDeployment } from "@/lib/site/deployment-env";
import { SITEMAP_INDEX_PATH } from "@/lib/sitemap/shards";
import { siteUrl } from "@/lib/site/site-url";

const robots = (): MetadataRoute.Robots => {
  if (!isIndexableDeployment)
    return { rules: [{ userAgent: "*", disallow: "/" }] };

  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: siteUrl(SITEMAP_INDEX_PATH),
  };
};

export default robots;
