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
export type YouTubeRatingWriter = {
  readonly youTubeChannel: {
    update(args: {
      where: { id: string };
      data: { rating: number; ratingCount: number };
    }): PromiseLike<unknown>;
  };
};

export const YOUTUBE_ENGAGEMENT_API = Symbol("YOUTUBE_ENGAGEMENT_API");

export type YouTubeEngagementProjection = {
  readonly price: 0;
  readonly id: string;
  readonly isFree: true;
  readonly title: string;
  readonly currency: "USD";
};

export type RoadmapCandidateChannelProjection = {
  readonly id: string;
  readonly title: string;
  readonly rating: number;
  readonly category: string;
  readonly ratingCount: number;
  readonly subscribers: number;
  readonly isFeatured: boolean;
  readonly description: string | null;
};

export type RoadmapCandidateQuery = {
  readonly take: number;
  readonly subjects: readonly string[];
};

export interface YouTubeEngagementApi {
  resolveChannel(channelId: string): Promise<YouTubeEngagementProjection>;
  roadmapCandidateChannels(
    query: RoadmapCandidateQuery,
  ): Promise<RoadmapCandidateChannelProjection[]>;
  updateChannelRating(
    channelId: string,
    average: number,
    count: number,
    writer?: YouTubeRatingWriter,
  ): Promise<void>;
}
