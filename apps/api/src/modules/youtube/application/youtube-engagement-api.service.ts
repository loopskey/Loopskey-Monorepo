import { YouTubeEngagementProjection } from "@youtube/public/youtube-engagement-api";
import { YouTubeEngagementApi } from "@youtube/public/youtube-engagement-api";
import { YouTubeService } from "@youtube/services/youtbue.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class YouTubeEngagementApiService implements YouTubeEngagementApi {
  constructor(private readonly youtubeService: YouTubeService) {}

  resolveChannel(channelId: string): Promise<YouTubeEngagementProjection> {
    return this.youtubeService.resolveForEngagement(channelId);
  }

  async updateChannelRating(
    channelId: string,
    average: number,
    count: number,
  ): Promise<void> {
    await this.youtubeService.updateEngagementRating(channelId, average, count);
  }
}
