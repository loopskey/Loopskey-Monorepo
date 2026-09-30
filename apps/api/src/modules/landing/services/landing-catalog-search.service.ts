import { LandingCatalogSearchItemEntity } from "@landing/entities/landing-catalog-search-item.entity";
import { PODCAST_CATALOG_SEARCH_API } from "@podcast/public/catalog-search-api";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { YOUTUBE_CATALOG_SEARCH_API } from "@youtube/public/catalog-search-api";
import { LandingCatalogSearchInput } from "@landing/dtos/landing-catalog-search.input";
import { COURSE_CATALOG_SEARCH_API } from "@course/public/catalog-search-api";
import { EVENT_CATALOG_SEARCH_API } from "@events/public/catalog-search-api";
import { requestContext } from "@infrastructure/observability/request-context";
import { ContentType } from "@prisma/client";

import type { PodcastCatalogSearchApi } from "@podcast/public/catalog-search-api";
import type { YouTubeCatalogSearchApi } from "@youtube/public/catalog-search-api";
import type { LandingCatalogCandidate } from "@course/public/catalog-search-api";
import type { CourseCatalogSearchApi } from "@course/public/catalog-search-api";
import type { EventCatalogSearchApi } from "@events/public/catalog-search-api";

const DEFAULT_TAKE = 12;
const MAX_TAKE = 20;
const SLOW_QUERY_THRESHOLD_MS = Number(
  process.env.LANDING_SEARCH_SLOW_QUERY_MS ?? 500,
);

const ALL_CONTENT_TYPES: readonly ContentType[] = [
  ContentType.COURSE,
  ContentType.EVENT,
  ContentType.PODCAST,
  ContentType.YOUTUBE,
];

type CandidateWithType = LandingCatalogCandidate & { contentType: ContentType };

@Injectable()
export class LandingCatalogSearchService {
  private readonly logger = new Logger(LandingCatalogSearchService.name);

  constructor(
    @Inject(COURSE_CATALOG_SEARCH_API)
    private readonly courseApi: CourseCatalogSearchApi,
    @Inject(EVENT_CATALOG_SEARCH_API)
    private readonly eventApi: EventCatalogSearchApi,
    @Inject(PODCAST_CATALOG_SEARCH_API)
    private readonly podcastApi: PodcastCatalogSearchApi,
    @Inject(YOUTUBE_CATALOG_SEARCH_API)
    private readonly youtubeApi: YouTubeCatalogSearchApi,
  ) {}

  async search(
    input: LandingCatalogSearchInput,
  ): Promise<LandingCatalogSearchItemEntity[]> {
    const search = input.search.trim();
    const take = Math.min(Math.max(input.take ?? DEFAULT_TAKE, 1), MAX_TAKE);
    const targets = input.contentType ? [input.contentType] : ALL_CONTENT_TYPES;
    const category = input.contentType ? (input.category ?? null) : null;
    const query = { search, take, category };

    const startedAt = Date.now();
    const settled = await Promise.allSettled(
      targets.map((contentType) => this.searchOne(contentType, query)),
    );

    const merged: CandidateWithType[] = [];
    const candidateCounts: Record<string, number> = {};
    settled.forEach((result, index) => {
      const contentType = targets[index];
      if (result.status === "fulfilled") {
        candidateCounts[contentType] = result.value.length;
        merged.push(
          ...result.value.map((candidate) => ({ ...candidate, contentType })),
        );
        return;
      }
      candidateCounts[contentType] = 0;
      this.logger.warn("Landing catalogue search domain failed", {
        contentType,
        correlationId: requestContext.correlationId(),
        error:
          result.reason instanceof Error
            ? result.reason.message
            : "Unknown error",
      });
    });

    merged.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const recencyDelta = b.recency.getTime() - a.recency.getTime();
      if (recencyDelta !== 0) return recencyDelta;
      return a.contentId < b.contentId ? -1 : 1;
    });

    const limited = merged.slice(0, take);
    const durationMs = Date.now() - startedAt;
    if (durationMs > SLOW_QUERY_THRESHOLD_MS) {
      this.logger.warn(
        "Landing catalogue search exceeded slow-query threshold",
        {
          durationMs,
          take,
          searchLength: search.length,
          contentType: input.contentType ?? null,
          category: input.contentType ? (input.category ?? null) : null,
          candidateCounts,
          correlationId: requestContext.correlationId(),
        },
      );
    }

    return limited.map((candidate) => ({
      id: candidate.contentId,
      contentType: candidate.contentType,
      slug: candidate.slug,
      title: candidate.title,
      imageUrl: candidate.imageUrl,
      category: candidate.category,
      rating: candidate.rating,
      durationMinutes: candidate.durationMinutes ?? null,
      startDate: candidate.startDate ?? null,
      episodeCount: candidate.episodeCount ?? null,
      videoCount: candidate.videoCount ?? null,
    }));
  }

  private searchOne(
    contentType: ContentType,
    query: { search: string; take: number; category: string | null },
  ): Promise<LandingCatalogCandidate[]> {
    if (contentType === ContentType.COURSE)
      return this.courseApi.searchCatalog(query);
    if (contentType === ContentType.EVENT)
      return this.eventApi.searchCatalog(query);
    if (contentType === ContentType.PODCAST)
      return this.podcastApi.searchCatalog(query);
    return this.youtubeApi.searchCatalog(query);
  }
}
