import { YouTubeCategory, YouTubeChannelStatus } from "@prisma/client";
import { Logger } from "@nestjs/common";

import { PrismaService } from "@prisma/prisma.service";
import { YouTubeService } from "./youtbue.service";

const categoryRow = (value: YouTubeCategory, count: number) => ({
  category: value,
  _count: { _all: count },
});

const setup = () => {
  const prisma = {
    youTubeChannel: { groupBy: jest.fn().mockResolvedValue([]) },
  };
  jest.spyOn(Logger.prototype, "log").mockImplementation();
  jest.spyOn(Logger.prototype, "warn").mockImplementation();
  return {
    prisma,
    service: new YouTubeService(prisma as unknown as PrismaService),
  };
};

describe("YouTubeService filter facets", () => {
  afterEach(() => jest.restoreAllMocks());

  it("counts only published, non-deleted channels", async () => {
    const { service, prisma } = setup();

    await service.findYouTubeChannelFilterFacets();

    expect(prisma.youTubeChannel.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        by: ["category"],
        where: { status: YouTubeChannelStatus.PUBLISHED, deletedAt: null },
      }),
    );
  });

  it("returns one option per category backed by a public channel", async () => {
    const { service, prisma } = setup();
    prisma.youTubeChannel.groupBy.mockResolvedValue([
      categoryRow(YouTubeCategory.TECHNOLOGY, 6),
      categoryRow(YouTubeCategory.BUSINESS, 2),
    ]);

    await expect(service.findYouTubeChannelFilterFacets()).resolves.toEqual({
      categories: [
        { value: YouTubeCategory.BUSINESS, count: 2 },
        { value: YouTubeCategory.TECHNOLOGY, count: 6 },
      ],
    });
  });

  it("offers nothing for an empty catalogue", async () => {
    const { service } = setup();

    await expect(service.findYouTubeChannelFilterFacets()).resolves.toEqual({
      categories: [],
    });
  });
});
