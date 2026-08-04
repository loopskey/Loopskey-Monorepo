import { YouTubeService } from "@youtube/services/youtbue.service";
import { YouTubeEngagementApiService } from "./youtube-engagement-api.service";

describe("YouTubeEngagementApiService", () => {
  const youtubeService = {
    resolveForEngagement: jest.fn(),
    updateEngagementRating: jest.fn(),
  };
  const service = new YouTubeEngagementApiService(
    youtubeService as unknown as YouTubeService,
  );

  beforeEach(() => jest.clearAllMocks());

  it("delegates engagement reads and rating writes to YouTube", async () => {
    youtubeService.resolveForEngagement.mockResolvedValue({ id: "channel-1" });
    await service.resolveChannel("channel-1");
    await service.updateChannelRating("channel-1", 5, 1);
    expect(youtubeService.resolveForEngagement).toHaveBeenCalledWith(
      "channel-1",
    );
    expect(youtubeService.updateEngagementRating).toHaveBeenCalledWith(
      "channel-1",
      5,
      1,
    );
  });
});
