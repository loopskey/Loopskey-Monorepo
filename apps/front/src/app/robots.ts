import type { MetadataRoute } from "next";

import { isIndexableDeployment } from "@/lib/site/deployment-env";

const robots = (): MetadataRoute.Robots => {
  if (!isIndexableDeployment)
    return { rules: [{ userAgent: "*", disallow: "/" }] };

  return { rules: [{ userAgent: "*", allow: "/" }] };
};

export default robots;
