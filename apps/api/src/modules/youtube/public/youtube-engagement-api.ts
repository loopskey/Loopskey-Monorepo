export const YOUTUBE_ENGAGEMENT_API = Symbol("YOUTUBE_ENGAGEMENT_API");

export type YouTubeEngagementProjection = {
  readonly price: 0;
  readonly id: string;
  readonly isFree: true;
  readonly title: string;
  readonly currency: "USD";
};

export interface YouTubeEngagementApi {
  resolveChannel(channelId: string): Promise<YouTubeEngagementProjection>;
  updateChannelRating(
    channelId: string,
    average: number,
    count: number,
  ): Promise<void>;
}
