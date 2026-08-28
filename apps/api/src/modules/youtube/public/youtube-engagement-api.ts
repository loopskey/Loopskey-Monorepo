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
  ): Promise<void>;
}
