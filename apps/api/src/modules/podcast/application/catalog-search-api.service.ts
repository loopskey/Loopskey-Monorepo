import { LandingCatalogSearchQuery } from "@podcast/public/catalog-search-api";
import { PodcastCatalogSearchApi } from "@podcast/public/catalog-search-api";
import { LandingCatalogCandidate } from "@podcast/public/catalog-search-api";
import { PodcastCatalogSearchRow } from "@podcast/types/podcast-service.types";
import { PodcastCategory } from "@prisma/client";
import { PrismaService } from "@prisma/prisma.service";
import { Injectable } from "@nestjs/common";

const MAX_CANDIDATE_TAKE = 20;
const VALID_CATEGORIES = new Set<string>(Object.values(PodcastCategory));

@Injectable()
export class CatalogSearchApiService implements PodcastCatalogSearchApi {
  constructor(private readonly prisma: PrismaService) {}

  async searchCatalog(
    query: LandingCatalogSearchQuery,
  ): Promise<LandingCatalogCandidate[]> {
    const search = query.search.trim();
    if (!search) return [];
    const take = Math.min(Math.max(query.take, 1), MAX_CANDIDATE_TAKE);
    const category = VALID_CATEGORIES.has(query.category ?? "")
      ? (query.category as PodcastCategory)
      : null;

    const rows = await this.prisma.$queryRaw<PodcastCatalogSearchRow[]>`
      WITH exact_matches AS (
        SELECT
          p."id", p."slug", p."title", p."imageUrl",
          p."category"::text AS category, p."rating", p."episodeCount",
          p."createdAt",
          CASE
            WHEN p."title" ILIKE '%' || ${search} || '%' THEN 3
            WHEN p."host" ILIKE '%' || ${search} || '%' THEN 2
            ELSE 1
          END AS band
        FROM "Podcast" p
        WHERE p."deletedAt" IS NULL
          AND p."status" = 'PUBLISHED'::"PodcastStatus"
          AND (${category}::"PodcastCategory" IS NULL OR p."category" = ${category}::"PodcastCategory")
          AND (
            p."title" ILIKE '%' || ${search} || '%'
            OR p."host" ILIKE '%' || ${search} || '%'
            OR p."description" ILIKE '%' || ${search} || '%'
          )
        ORDER BY band DESC, p."createdAt" DESC, p."id" ASC
        LIMIT ${take}
      ),
      fuzzy_matches AS (
        SELECT
          p."id", p."slug", p."title", p."imageUrl",
          p."category"::text AS category, p."rating", p."episodeCount",
          p."createdAt",
          GREATEST(
            similarity(p."title", ${search}),
            similarity(p."host", ${search})
          ) AS "fuzzyScore"
        FROM "Podcast" p
        WHERE p."deletedAt" IS NULL
          AND p."status" = 'PUBLISHED'::"PodcastStatus"
          AND (${category}::"PodcastCategory" IS NULL OR p."category" = ${category}::"PodcastCategory")
          AND p."id" NOT IN (SELECT "id" FROM exact_matches)
          AND (p."title" % ${search} OR p."host" % ${search})
        ORDER BY "fuzzyScore" DESC, p."createdAt" DESC, p."id" ASC
        LIMIT GREATEST(${take} - (SELECT COUNT(*)::int FROM exact_matches), 0)
      )
      SELECT
        "id", "slug", "title", "imageUrl", category, "rating",
        "episodeCount", "createdAt", band::float AS score
      FROM exact_matches
      UNION ALL
      SELECT
        "id", "slug", "title", "imageUrl", category, "rating",
        "episodeCount", "createdAt", LEAST("fuzzyScore", 0.99)::float AS score
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
      episodeCount: row.episodeCount,
    }));
  }
}
