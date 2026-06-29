import { PopularCategoriesInput } from "@landing/dtos/popular-categories.input";
import { TPopularCategoryRawRow } from "@landing/types/landing.types";
import { PrismaService } from "@prisma/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class LandingService {
  constructor(private readonly prismaService: PrismaService) {}

  async popularCategories(input?: PopularCategoriesInput) {
    const take = Math.min(Math.max(input?.take ?? 8, 1), 24);
    const rows = await this.prismaService.$queryRaw<TPopularCategoryRawRow[]>`
      WITH unified_categories AS (
        SELECT
          c."category"::text AS category,
          c."rating"::float AS rating,
          c."ratingCount"::int AS rating_count,
          1 AS course_count,
          0 AS event_count,
          0 AS podcast_count,
          0 AS youtube_count
        FROM "Course" c
        WHERE c."deletedAt" IS NULL
          AND c."status" = 'PUBLISHED'
        UNION ALL
        SELECT
          e."category"::text AS category,
          COALESCE(e."averageRating", e."rating")::float AS rating,
          e."ratingCount"::int AS rating_count,
          0 AS course_count,
          1 AS event_count,
          0 AS podcast_count,
          0 AS youtube_count
        FROM "Event" e
        WHERE e."deletedAt" IS NULL
          AND e."status" = 'PUBLISHED'
        UNION ALL
        SELECT
          p."category"::text AS category,
          p."rating"::float AS rating,
          p."ratingCount"::int AS rating_count,
          0 AS course_count,
          0 AS event_count,
          1 AS podcast_count,
          0 AS youtube_count
        FROM "Podcast" p
        WHERE p."deletedAt" IS NULL
          AND p."status" = 'PUBLISHED'
        UNION ALL
        SELECT
          y."category"::text AS category,
          y."rating"::float AS rating,
          y."ratingCount"::int AS rating_count,
          0 AS course_count,
          0 AS event_count,
          0 AS podcast_count,
          1 AS youtube_count
        FROM "YouTubeChannel" y
        WHERE y."deletedAt" IS NULL
          AND y."status" = 'PUBLISHED'
      )
      SELECT
        category,
        COUNT(*)::bigint AS "totalItems",
        SUM(course_count)::bigint AS "courseCount",
        SUM(event_count)::bigint AS "eventCount",
        SUM(podcast_count)::bigint AS "podcastCount",
        SUM(youtube_count)::bigint AS "youtubeCount",
        COALESCE(AVG(NULLIF(rating, 0)), 0)::float AS "averageRating",
        (
          COUNT(*) * 1.0
          + COALESCE(AVG(NULLIF(rating, 0)), 0) * 3.0
          + LOG(1 + COALESCE(SUM(rating_count), 0)) * 1.5
        )::float AS "popularityScore"
      FROM unified_categories
      GROUP BY category
      ORDER BY "popularityScore" DESC, "averageRating" DESC, "totalItems" DESC
      LIMIT ${take};
    `;

    return rows.map((row) => ({
      category: row.category,
      totalItems: Number(row.totalItems),
      courseCount: Number(row.courseCount),
      eventCount: Number(row.eventCount),
      podcastCount: Number(row.podcastCount),
      youtubeCount: Number(row.youtubeCount),
      averageRating: Number(row.averageRating ?? 0),
      popularityScore: Number(row.popularityScore ?? 0),
    }));
  }
}
