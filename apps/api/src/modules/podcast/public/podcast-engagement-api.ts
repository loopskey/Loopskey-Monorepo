/**
 * Just enough of an open transaction for this module to write its own row.
 *
 * Declared structurally rather than as a Prisma type: a public contract that
 * named the ORM would leak persistence across a module boundary. The caller
 * hands over the transaction it is already inside, the owning module writes its
 * table within it, and neither side learns anything about the other's schema.
 *
 * Passing one is what lets a rating be recomputed and published atomically, so
 * a slower recomputation cannot commit after a newer one.
 */
export type PodcastRatingWriter = {
  readonly podcast: {
    update(args: {
      where: { id: string };
      data: { rating: number; ratingCount: number };
    }): PromiseLike<unknown>;
  };
};

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
    writer?: PodcastRatingWriter,
  ): Promise<void>;
}
