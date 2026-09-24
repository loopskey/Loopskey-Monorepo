import { LearningBudgetPreference } from "@prisma/client";
import { PROFESSIONAL_CATALOG_API } from "@course/public/professional-catalog-api";
import { PODCAST_ENGAGEMENT_API } from "@podcast/public/podcast-engagement-api";
import { YOUTUBE_ENGAGEMENT_API } from "@youtube/public/youtube-engagement-api";
import { CandidateBuildInput } from "../types/professional-roadmap-chat.types";
import { selectByRelaxation } from "@professional/utils/roadmap-relaxation.util";
import { Inject, Injectable } from "@nestjs/common";
import { summarise, tagsOf } from "@professional/utils/professional.helper";
import { TITLE_MAX_LENGTH } from "@professional/utils/professional.helper";
import { selectCandidates } from "@professional/utils/roadmap-candidate-ranking.util";
import { toPlatformLevel } from "@professional/utils/professional.helper";
import { POOL_PER_TYPE } from "@professional/utils/professional.helper";
import { EVENTS_API } from "@events/public/events-api.token";
import { truncate } from "@professional/utils/professional.helper";

import { type ProfessionalCatalogApi } from "@course/public/professional-catalog-api";
import { type PodcastEngagementApi } from "@podcast/public/podcast-engagement-api";
import { type YouTubeEngagementApi } from "@youtube/public/youtube-engagement-api";
import { type RankableCandidate } from "@professional/utils/roadmap-candidate-ranking.util";
import { type RoadmapMatchTier } from "@professional/utils/roadmap-relaxation.util";

import type { PlatformContentType } from "@infrastructure/service-ai/service-ai.port";
import type { EventsApi } from "@events/public/events-api";

const isSameSubstring = (haystack: string, needle: string) =>
  haystack.toLowerCase().includes(needle.toLowerCase());

@Injectable()
export class ProfessionalRoadmapCandidateService {
  constructor(
    @Inject(PROFESSIONAL_CATALOG_API)
    private readonly catalog: ProfessionalCatalogApi,
    @Inject(EVENTS_API) private readonly events: EventsApi,
    @Inject(PODCAST_ENGAGEMENT_API)
    private readonly podcasts: PodcastEngagementApi,
    @Inject(YOUTUBE_ENGAGEMENT_API)
    private readonly channels: YouTubeEngagementApi,
  ) {}

  async build(input: CandidateBuildInput): Promise<RankableCandidate[]> {
    const types =
      input.preferredContentTypes.length > 0
        ? input.preferredContentTypes
        : (["COURSE", "EVENT", "PODCAST", "YOUTUBE"] as PlatformContentType[]);
    const freeOnly =
      input.budgetPreference === LearningBudgetPreference.FREE_ONLY;

    const { items: pool } = await selectByRelaxation((tier) =>
      this.queryTier(tier, types, freeOnly, input),
    );

    return selectCandidates({
      pool,
      freeOnly,
      cap: input.cap,
      requestedTypes: types,
      creditsNeeded: input.creditsNeeded,
      level: input.skillLevel,
    });
  }

  private async queryTier(
    tier: RoadmapMatchTier,
    types: PlatformContentType[],
    freeOnly: boolean,
    input: CandidateBuildInput,
  ): Promise<RankableCandidate[]> {
    const query = {
      tier,
      take: POOL_PER_TYPE,
      subjects: input.subjects,
      keywords: input.keywords,
      groupKeys: input.groupKeys,
    };

    const [courses, events, podcasts, channels] = await Promise.all([
      types.includes("COURSE")
        ? this.catalog.roadmapCandidateCourses({ ...query, freeOnly })
        : Promise.resolve([]),
      types.includes("EVENT")
        ? this.events.roadmapCandidateEvents({ ...query, freeOnly })
        : Promise.resolve([]),
      types.includes("PODCAST")
        ? this.podcasts.roadmapCandidatePodcasts(query)
        : Promise.resolve([]),
      types.includes("YOUTUBE")
        ? this.channels.roadmapCandidateChannels(query)
        : Promise.resolve([]),
    ]);

    const isCloseMatch = (title: string, summary: string | null) =>
      tier !== "EXACT" &&
      !input.subjects.some(
        (subject) =>
          isSameSubstring(title, subject) ||
          (summary !== null && isSameSubstring(summary, subject)),
      );

    return [
      ...courses.map((course) => {
        const summary = summarise(course.description);
        return {
          contentId: course.id,
          contentType: "COURSE" as const,
          title: truncate(course.title, TITLE_MAX_LENGTH),
          summary,
          tags: tagsOf(course.category),
          isFree: course.isFree,
          credits: null,
          level: toPlatformLevel(course.level),
          durationMinutes: course.durationMinutes,
          rating: course.rating,
          ratingCount: course.ratingCount,
          audience: course.professionals,
          isFeatured: course.isFeatured,
          matchScore: course.matchScore,
          matchTier: tier,
          isCloseMatch: isCloseMatch(course.title, summary),
        };
      }),
      ...events.map((event) => {
        const summary = summarise(event.description);
        return {
          contentId: event.id,
          contentType: "EVENT" as const,
          title: truncate(event.title, TITLE_MAX_LENGTH),
          summary,
          tags: tagsOf(event.category, event.topic, event.specificTopic),
          isFree: event.isFree,
          credits: event.pdu > 0 ? event.pdu : null,
          level: null,
          durationMinutes: null,
          rating: event.averageRating,
          ratingCount: event.ratingCount,
          audience: event.attendees,
          isFeatured: false,
          matchScore: event.matchScore,
          matchTier: tier,
          isCloseMatch: isCloseMatch(event.title, summary),
        };
      }),
      ...podcasts.map((podcast) => {
        const summary = summarise(podcast.description);
        return {
          contentId: podcast.id,
          contentType: "PODCAST" as const,
          title: truncate(podcast.title, TITLE_MAX_LENGTH),
          summary,
          tags: tagsOf(podcast.category),
          isFree: true,
          credits: null,
          level: null,
          durationMinutes: podcast.durationMinutes,
          rating: podcast.rating,
          ratingCount: podcast.ratingCount,
          audience: podcast.listeners,
          isFeatured: podcast.isFeatured,
          matchScore: podcast.matchScore,
          matchTier: tier,
          isCloseMatch: isCloseMatch(podcast.title, summary),
        };
      }),
      ...channels.map((channel) => {
        const summary = summarise(channel.description);
        return {
          contentId: channel.id,
          contentType: "YOUTUBE" as const,
          title: truncate(channel.title, TITLE_MAX_LENGTH),
          summary,
          tags: tagsOf(channel.category),
          isFree: true,
          credits: null,
          level: null,
          durationMinutes: null,
          rating: channel.rating,
          ratingCount: channel.ratingCount,
          audience: channel.subscribers,
          isFeatured: channel.isFeatured,
          matchScore: channel.matchScore,
          matchTier: tier,
          isCloseMatch: isCloseMatch(channel.title, summary),
        };
      }),
    ];
  }
}
