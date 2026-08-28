import { PodcastService } from "@podcast/services/podcast.service";
import { PodcastEngagementApiService } from "./podcast-engagement-api.service";

describe("PodcastEngagementApiService", () => {
  const podcastService = {
    resolveForEngagement: jest.fn(),
    updateEngagementRating: jest.fn(),
  };
  const service = new PodcastEngagementApiService(
    podcastService as unknown as PodcastService,
  );

  beforeEach(() => jest.clearAllMocks());

  it("delegates engagement reads and rating writes to Podcast", async () => {
    podcastService.resolveForEngagement.mockResolvedValue({ id: "podcast-1" });
    await service.resolvePodcast("podcast-1");
    await service.updatePodcastRating("podcast-1", 4, 3);
    expect(podcastService.resolveForEngagement).toHaveBeenCalledWith(
      "podcast-1",
    );
    expect(podcastService.updateEngagementRating).toHaveBeenCalledWith(
      "podcast-1",
      4,
      3,
      undefined,
    );
  });
});
