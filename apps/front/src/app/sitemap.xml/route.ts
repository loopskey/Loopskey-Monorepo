import { getKindShardSet, getPublicUrlShardSets } from "@/lib/sitemap/reader";
import { ALL_SITEMAP_KINDS, STATIC_SHARD_NAME } from "@/lib/sitemap/shards";
import { contentShardName, shardPath } from "@/lib/sitemap/shards";
import { sitemapUnavailableResponse } from "@/lib/sitemap/response";
import { sitemapNotFoundResponse } from "@/lib/sitemap/response";
import { isIndexableDeployment } from "@/lib/site/deployment-env";
import { UpstreamFailureError } from "@/lib/server/graphql-server";
import { sitemapXmlResponse } from "@/lib/sitemap/response";
import { sitemapIndexXml } from "@/lib/sitemap/xml";
import { logSitemap } from "@/lib/sitemap/response";
import { kindLabel } from "@/lib/sitemap/shards";
import { siteUrl } from "@/lib/site/site-url";

import type { SitemapEntry } from "@/lib/sitemap/xml";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isIndexableDeployment) return sitemapNotFoundResponse();

  const startedAt = Date.now();
  try {
    await getPublicUrlShardSets();
    for (const kind of ALL_SITEMAP_KINDS) await getKindShardSet(kind);
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

  for (const kind of ALL_SITEMAP_KINDS) {
    const shardSet = await getKindShardSet(kind);
    if (!shardSet) continue;
    if (!shardSet.isComplete)
      logSitemap("shard-set-truncated", { kind: kindLabel(kind) }, "warn");
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
