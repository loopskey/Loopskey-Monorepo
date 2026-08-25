export const PODCAST_ENGAGEMENT_API = Symbol("PODCAST_ENGAGEMENT_API");

export type PodcastEngagementProjection = {
  readonly price: 0;
  readonly id: string;
  readonly isFree: true;
  readonly title: string;
  readonly currency: "USD";
};

export type RoadmapCandidatePodcastProjection = {
  readonly id: string;
  readonly title: string;
  readonly rating: number;
  readonly category: string;
  readonly listeners: number;
  readonly description: string;
  readonly ratingCount: number;
  readonly isFeatured: boolean;
  readonly durationMinutes: number | null;
};

export type RoadmapCandidateQuery = {
  readonly take: number;
  readonly subjects: readonly string[];
};

export interface PodcastEngagementApi {
  resolvePodcast(podcastId: string): Promise<PodcastEngagementProjection>;
  roadmapCandidatePodcasts(
    query: RoadmapCandidateQuery,
  ): Promise<RoadmapCandidatePodcastProjection[]>;
  updatePodcastRating(
    podcastId: string,
    average: number,
    count: number,
  ): Promise<void>;
}
