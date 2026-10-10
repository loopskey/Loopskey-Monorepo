import { SITEMAP_KINDS, STATIC_SHARD_NAME } from "@/lib/sitemap/shards";
import { contentShardName, shardPath } from "@/lib/sitemap/shards";
import { findShardSet, getPublicUrlShardSets } from "@/lib/sitemap/reader";
import { sitemapNotFoundResponse } from "@/lib/sitemap/response";
import { sitemapUnavailableResponse } from "@/lib/sitemap/response";
import { sitemapXmlResponse } from "@/lib/sitemap/response";
import { isIndexableDeployment } from "@/lib/site/deployment-env";
import { UpstreamFailureError } from "@/lib/server/graphql-server";
import { sitemapIndexXml } from "@/lib/sitemap/xml";
import { logSitemap } from "@/lib/sitemap/response";
import { siteUrl } from "@/lib/site/site-url";

import type { SitemapEntry } from "@/lib/sitemap/xml";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isIndexableDeployment) return sitemapNotFoundResponse();

  const startedAt = Date.now();
  let shardSets;
  try {
    shardSets = await getPublicUrlShardSets();
  } catch (error) {
    if (!(error instanceof UpstreamFailureError)) throw error;
    logSitemap(
      "index-unavailable",
      { reason: error.reason, latencyMs: Date.now() - startedAt },
      "warn",
    );
    return sitemapUnavailableResponse();
  }

  const entries: SitemapEntry[] = [
    { location: siteUrl(shardPath(STATIC_SHARD_NAME)) },
  ];

  for (const kind of SITEMAP_KINDS) {
    const shardSet = findShardSet(shardSets, kind);
    if (!shardSet) continue;
    if (!shardSet.isComplete)
      logSitemap("shard-set-truncated", { kind: kind.contentType }, "warn");
    for (const shard of shardSet.shards)
      entries.push({
        location: siteUrl(shardPath(contentShardName(kind, shard.index))),
        lastModified: new Date(shard.lastPublicChangeAt),
      });
  }

  logSitemap("index", {
    sitemapCount: entries.length,
    latencyMs: Date.now() - startedAt,
  });
  return sitemapXmlResponse(sitemapIndexXml(entries));
}
