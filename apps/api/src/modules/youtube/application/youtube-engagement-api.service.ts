import { YouTubeEngagementProjection } from "@youtube/public/youtube-engagement-api";
import { YouTubeEngagementApi } from "@youtube/public/youtube-engagement-api";
import { YouTubeRatingWriter } from "@youtube/public/youtube-engagement-api";
import { YouTubeService } from "@youtube/services/youtbue.service";
import { Injectable } from "@nestjs/common";

import type { RoadmapCandidateQuery } from "@youtube/public/youtube-engagement-api";

@Injectable()
export class YouTubeEngagementApiService implements YouTubeEngagementApi {
  constructor(private readonly youtubeService: YouTubeService) {}

  resolveChannel(channelId: string): Promise<YouTubeEngagementProjection> {
    return this.youtubeService.resolveForEngagement(channelId);
  }

  /**
   * `writer` lets the caller recompute and publish the aggregate inside one
   * transaction, which is what keeps a slower recomputation from landing after
   * a newer one. It defaults to the ambient client for callers with no
   * transaction of their own.
   */
  async updateChannelRating(
    channelId: string,
    average: number,
    count: number,
    writer?: YouTubeRatingWriter,
  ): Promise<void> {
    await this.youtubeService.updateEngagementRating(
      channelId,
      average,
      count,
      writer,
    );
  }

  roadmapCandidateChannels(query: RoadmapCandidateQuery) {
    return this.youtubeService.roadmapCandidates(query);
  }
}
