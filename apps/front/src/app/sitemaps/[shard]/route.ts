import { CANONICAL_STATIC_PAGE_PATHS } from "@/lib/sitemap/static-pages";
import { sitemapUnavailableResponse } from "@/lib/sitemap/response";
import { sitemapNotFoundResponse } from "@/lib/sitemap/response";
import { isIndexableDeployment } from "@/lib/site/deployment-env";
import { UpstreamFailureError } from "@/lib/server/graphql-server";
import { sitemapXmlResponse } from "@/lib/sitemap/response";
import { readKindShardUrls } from "@/lib/sitemap/reader";
import { localizedEntries } from "@/lib/sitemap/localized-entries";
import { publicLocalesOf } from "@/lib/sitemap/localized-entries";
import { getKindShardSet } from "@/lib/sitemap/reader";
import { parseShardFile } from "@/lib/sitemap/shards";
import { logSitemap } from "@/lib/sitemap/response";
import { kindLabel } from "@/lib/sitemap/shards";
import { urlSetXml } from "@/lib/sitemap/xml";

import type { SitemapEntry } from "@/lib/sitemap/xml";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ shard: string }> };

const staticPageEntries = (): SitemapEntry[] =>
  CANONICAL_STATIC_PAGE_PATHS.flatMap((path) =>
    localizedEntries(path, ["en", "fr"]),
  );

export async function GET(_request: Request, { params }: Params) {
  if (!isIndexableDeployment) return sitemapNotFoundResponse();

  const { shard } = await params;
  const selector = parseShardFile(shard);
  if (!selector) return sitemapNotFoundResponse();
  if (selector.type === "static")
    return sitemapXmlResponse(urlSetXml(staticPageEntries()));

  const { kind, index } = selector;
  const startedAt = Date.now();
  try {
    const shardSet = await getKindShardSet(kind);
    const descriptor = shardSet?.shards.find(
      (candidate) => candidate.index === index,
    );
    if (!descriptor) {
      logSitemap("shard-missing", { kind: kindLabel(kind), index });
      return sitemapNotFoundResponse();
    }

    const { items, isComplete } = await readKindShardUrls(kind, descriptor);
    if (items.length === 0) {
      logSitemap("shard-empty", { kind: kindLabel(kind), index });
      return sitemapNotFoundResponse();
    }
    if (!isComplete)
      logSitemap(
        "shard-truncated",
        { kind: kindLabel(kind), index, urlCount: items.length },
        "warn",
      );

    logSitemap("shard", {
      index,
      kind: kindLabel(kind),
      urlCount: items.length,
      latencyMs: Date.now() - startedAt,
    });
    return sitemapXmlResponse(
      urlSetXml(
        items.flatMap((item) =>
          localizedEntries(
            `${kind.detailBasePath}/${encodeURIComponent(item.slug)}`,
            publicLocalesOf(item.availableLocales),
            new Date(item.publicChangeAt),
          ),
        ),
      ),
    );
  } catch (error) {
    if (!(error instanceof UpstreamFailureError)) throw error;
    logSitemap(
      "shard-unavailable",
      {
        index,
        kind: kindLabel(kind),
        reason: error.reason,
        latencyMs: Date.now() - startedAt,
      },
      "warn",
    );
    return sitemapUnavailableResponse();
  }
}
