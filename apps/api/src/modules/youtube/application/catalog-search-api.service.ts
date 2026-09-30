import { LandingCatalogSearchQuery } from "@youtube/public/catalog-search-api";
import { YouTubeCatalogSearchApi } from "@youtube/public/catalog-search-api";
import { LandingCatalogCandidate } from "@youtube/public/catalog-search-api";
import { ChannelCatalogSearchRow } from "@youtube/types/youtube-service.types";
import { YouTubeCategory } from "@prisma/client";
import { PrismaService } from "@prisma/prisma.service";
import { Injectable } from "@nestjs/common";

const MAX_CANDIDATE_TAKE = 20;
const VALID_CATEGORIES = new Set<string>(Object.values(YouTubeCategory));

@Injectable()
export class CatalogSearchApiService implements YouTubeCatalogSearchApi {
  constructor(private readonly prisma: PrismaService) {}

  async searchCatalog(
    query: LandingCatalogSearchQuery,
  ): Promise<LandingCatalogCandidate[]> {
    const search = query.search.trim();
    if (!search) return [];
    const take = Math.min(Math.max(query.take, 1), MAX_CANDIDATE_TAKE);
    const category = VALID_CATEGORIES.has(query.category ?? "")
      ? (query.category as YouTubeCategory)
      : null;

    const rows = await this.prisma.$queryRaw<ChannelCatalogSearchRow[]>`
      WITH exact_matches AS (
        SELECT
          yc."id", yc."slug", yc."title", yc."imageUrl",
          yc."category"::text AS category, yc."rating", yc."videoCount",
          yc."createdAt",
          CASE
            WHEN yc."title" ILIKE '%' || ${search} || '%' THEN 3
            WHEN COALESCE(yc."provider", '') ILIKE '%' || ${search} || '%' THEN 2
            ELSE 1
          END AS band
        FROM "YouTubeChannel" yc
        WHERE yc."deletedAt" IS NULL
          AND yc."status" = 'PUBLISHED'::"YouTubeChannelStatus"
          AND (${category}::"YouTubeCategory" IS NULL OR yc."category" = ${category}::"YouTubeCategory")
          AND (
            yc."title" ILIKE '%' || ${search} || '%'
            OR COALESCE(yc."provider", '') ILIKE '%' || ${search} || '%'
            OR COALESCE(yc."description", '') ILIKE '%' || ${search} || '%'
          )
        ORDER BY band DESC, yc."createdAt" DESC, yc."id" ASC
        LIMIT ${take}
      ),
      fuzzy_matches AS (
        SELECT
          yc."id", yc."slug", yc."title", yc."imageUrl",
          yc."category"::text AS category, yc."rating", yc."videoCount",
          yc."createdAt",
          GREATEST(
            similarity(yc."title", ${search}),
            similarity(COALESCE(yc."provider", ''), ${search})
          ) AS "fuzzyScore"
        FROM "YouTubeChannel" yc
        WHERE yc."deletedAt" IS NULL
          AND yc."status" = 'PUBLISHED'::"YouTubeChannelStatus"
          AND (${category}::"YouTubeCategory" IS NULL OR yc."category" = ${category}::"YouTubeCategory")
          AND yc."id" NOT IN (SELECT "id" FROM exact_matches)
          AND (yc."title" % ${search} OR COALESCE(yc."provider", '') % ${search})
        ORDER BY "fuzzyScore" DESC, yc."createdAt" DESC, yc."id" ASC
        LIMIT GREATEST(${take} - (SELECT COUNT(*)::int FROM exact_matches), 0)
      )
      SELECT
        "id", "slug", "title", "imageUrl", category, "rating",
        "videoCount", "createdAt", band::float AS score
      FROM exact_matches
      UNION ALL
      SELECT
        "id", "slug", "title", "imageUrl", category, "rating",
        "videoCount", "createdAt", LEAST("fuzzyScore", 0.99)::float AS score
      FROM fuzzy_matches;
    `;

    return rows.map((row) => ({
      contentId: row.id,
      slug: row.slug,
      title: row.title,
      imageUrl: row.imageUrl,
      category: row.category,
      rating: row.rating,
      score: row.score,
      recency: row.createdAt,
      videoCount: row.videoCount,
    }));
  }
}
