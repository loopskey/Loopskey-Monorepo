import { PodcastEngagementProjection } from "@podcast/public/podcast-engagement-api";
import { PodcastEngagementApi } from "@podcast/public/podcast-engagement-api";
import { PodcastService } from "@podcast/services/podcast.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PodcastEngagementApiService implements PodcastEngagementApi {
  constructor(private readonly podcastService: PodcastService) {}

  resolvePodcast(podcastId: string): Promise<PodcastEngagementProjection> {
    return this.podcastService.resolveForEngagement(podcastId);
  }

  async updatePodcastRating(
    podcastId: string,
    average: number,
    count: number,
  ): Promise<void> {
    await this.podcastService.updateEngagementRating(podcastId, average, count);
  }
}
