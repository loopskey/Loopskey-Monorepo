import { LearningBudgetPreference } from "@prisma/client";
import { PROFESSIONAL_CATALOG_API } from "@course/public/professional-catalog-api";
import { PODCAST_ENGAGEMENT_API } from "@podcast/public/podcast-engagement-api";
import { YOUTUBE_ENGAGEMENT_API } from "@youtube/public/youtube-engagement-api";
import { CandidateBuildInput } from "../types/professional-roadmap-chat.types";
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

import type { PlatformContentType } from "@infrastructure/service-ai/service-ai.port";
import type { EventsApi } from "@events/public/events-api";

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
    const query = { subjects: input.subjects, take: POOL_PER_TYPE };

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

    const pool: RankableCandidate[] = [
      ...courses.map((course) => ({
        contentId: course.id,
        contentType: "COURSE" as const,
        title: truncate(course.title, TITLE_MAX_LENGTH),
        summary: summarise(course.description),
        tags: tagsOf(course.category),
        isFree: course.isFree,
        credits: null,
        level: toPlatformLevel(course.level),
        durationMinutes: course.durationMinutes,
        rating: course.rating,
        ratingCount: course.ratingCount,
        audience: course.professionals,
        isFeatured: course.isFeatured,
      })),
      ...events.map((event) => ({
        contentId: event.id,
        contentType: "EVENT" as const,
        title: truncate(event.title, TITLE_MAX_LENGTH),
        summary: summarise(event.description),
        tags: tagsOf(event.category, event.topic, event.specificTopic),
        isFree: event.isFree,
        credits: event.pdu > 0 ? event.pdu : null,
        level: null,
        durationMinutes: null,
        rating: event.averageRating,
        ratingCount: event.ratingCount,
        audience: event.attendees,
        isFeatured: false,
      })),
      ...podcasts.map((podcast) => ({
        contentId: podcast.id,
        contentType: "PODCAST" as const,
        title: truncate(podcast.title, TITLE_MAX_LENGTH),
        summary: summarise(podcast.description),
        tags: tagsOf(podcast.category),
        isFree: true,
        credits: null,
        level: null,
        durationMinutes: podcast.durationMinutes,
        rating: podcast.rating,
        ratingCount: podcast.ratingCount,
        audience: podcast.listeners,
        isFeatured: podcast.isFeatured,
      })),
      ...channels.map((channel) => ({
        contentId: channel.id,
        contentType: "YOUTUBE" as const,
        title: truncate(channel.title, TITLE_MAX_LENGTH),
        summary: summarise(channel.description),
        tags: tagsOf(channel.category),
        isFree: true,
        credits: null,
        level: null,
        durationMinutes: null,
        rating: channel.rating,
        ratingCount: channel.ratingCount,
        audience: channel.subscribers,
        isFeatured: channel.isFeatured,
      })),
    ];

    return selectCandidates({
      pool,
      freeOnly,
      cap: input.cap,
      subjects: input.subjects,
      requestedTypes: types,
      creditsNeeded: input.creditsNeeded,
      level: input.skillLevel,
    });
  }
}
