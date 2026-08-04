export const PODCAST_ENGAGEMENT_API = Symbol("PODCAST_ENGAGEMENT_API");

export type PodcastEngagementProjection = {
  readonly price: 0;
  readonly id: string;
  readonly isFree: true;
  readonly title: string;
  readonly currency: "USD";
};

export interface PodcastEngagementApi {
  resolvePodcast(podcastId: string): Promise<PodcastEngagementProjection>;
  updatePodcastRating(
    podcastId: string,
    average: number,
    count: number,
  ): Promise<void>;
}
