import { PodcastEngagementProjection } from "@podcast/public/podcast-engagement-api";
import { PodcastEngagementApi } from "@podcast/public/podcast-engagement-api";
import { PodcastRatingWriter } from "@podcast/public/podcast-engagement-api";
import { PodcastService } from "@podcast/services/podcast.service";
import { Injectable } from "@nestjs/common";

import type { RoadmapCandidateQuery } from "@podcast/public/podcast-engagement-api";

@Injectable()
export class PodcastEngagementApiService implements PodcastEngagementApi {
  constructor(private readonly podcastService: PodcastService) {}

  resolvePodcast(podcastId: string): Promise<PodcastEngagementProjection> {
    return this.podcastService.resolveForEngagement(podcastId);
  }

  /**
   * `writer` lets the caller recompute and publish the aggregate inside one
   * transaction, which is what keeps a slower recomputation from landing after
   * a newer one. It defaults to the ambient client for callers with no
   * transaction of their own.
   */
  async updatePodcastRating(
    podcastId: string,
    average: number,
    count: number,
    writer?: PodcastRatingWriter,
  ): Promise<void> {
    await this.podcastService.updateEngagementRating(
      podcastId,
      average,
      count,
      writer,
    );
  }

  roadmapCandidatePodcasts(query: RoadmapCandidateQuery) {
    return this.podcastService.roadmapCandidates(query);
  }
}
