import { LandingCatalogSearchQuery } from "@course/public/catalog-search-api";
import { LandingCatalogCandidate } from "@course/public/catalog-search-api";
import { CourseCatalogSearchApi } from "@course/public/catalog-search-api";
import { CourseCatalogSearchRow } from "@course/types/application.types";
import { CourseCategory } from "@prisma/client";
import { PrismaService } from "@prisma/prisma.service";
import { Injectable } from "@nestjs/common";

const MAX_CANDIDATE_TAKE = 20;
const VALID_CATEGORIES = new Set<string>(Object.values(CourseCategory));

@Injectable()
export class CatalogSearchApiService implements CourseCatalogSearchApi {
  constructor(private readonly prisma: PrismaService) {}

  async searchCatalog(
    query: LandingCatalogSearchQuery,
  ): Promise<LandingCatalogCandidate[]> {
    const search = query.search.trim();
    if (!search) return [];
    const take = Math.min(Math.max(query.take, 1), MAX_CANDIDATE_TAKE);
    const category = VALID_CATEGORIES.has(query.category ?? "")
      ? (query.category as CourseCategory)
      : null;

    const rows = await this.prisma.$queryRaw<CourseCatalogSearchRow[]>`
      WITH exact_matches AS (
        SELECT
          c."id", c."slug", c."title", c."imageUrl",
          c."category"::text AS category, c."rating", c."durationMinutes",
          c."createdAt",
          CASE
            WHEN c."title" ILIKE '%' || ${search} || '%' THEN 3
            WHEN c."instructor" ILIKE '%' || ${search} || '%' THEN 2
            ELSE 1
          END AS band
        FROM "Course" c
        WHERE c."deletedAt" IS NULL
          AND c."status" = 'PUBLISHED'::"CourseStatus"
          AND (${category}::"CourseCategory" IS NULL OR c."category" = ${category}::"CourseCategory")
          AND (
            c."title" ILIKE '%' || ${search} || '%'
            OR c."instructor" ILIKE '%' || ${search} || '%'
            OR c."description" ILIKE '%' || ${search} || '%'
          )
        ORDER BY band DESC, c."createdAt" DESC, c."id" ASC
        LIMIT ${take}
      ),
      fuzzy_matches AS (
        SELECT
          c."id", c."slug", c."title", c."imageUrl",
          c."category"::text AS category, c."rating", c."durationMinutes",
          c."createdAt",
          GREATEST(
            similarity(c."title", ${search}),
            similarity(c."instructor", ${search})
          ) AS "fuzzyScore"
        FROM "Course" c
        WHERE c."deletedAt" IS NULL
          AND c."status" = 'PUBLISHED'::"CourseStatus"
          AND (${category}::"CourseCategory" IS NULL OR c."category" = ${category}::"CourseCategory")
          AND c."id" NOT IN (SELECT "id" FROM exact_matches)
          AND (c."title" % ${search} OR c."instructor" % ${search})
        ORDER BY "fuzzyScore" DESC, c."createdAt" DESC, c."id" ASC
        LIMIT GREATEST(${take} - (SELECT COUNT(*)::int FROM exact_matches), 0)
      )
      SELECT
        "id", "slug", "title", "imageUrl", category, "rating",
        "durationMinutes", "createdAt", band::float AS score
      FROM exact_matches
      UNION ALL
      SELECT
        "id", "slug", "title", "imageUrl", category, "rating",
        "durationMinutes", "createdAt", LEAST("fuzzyScore", 0.99)::float AS score
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
      durationMinutes: row.durationMinutes,
    }));
  }
}
