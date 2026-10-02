import { PodcastCategory, PodcastStatus } from "@prisma/client";
import { Logger } from "@nestjs/common";

import { PrismaService } from "@prisma/prisma.service";
import { PodcastService } from "./podcast.service";

const categoryRow = (value: PodcastCategory, count: number) => ({
  category: value,
  _count: { _all: count },
});

const setup = () => {
  const prisma = { podcast: { groupBy: jest.fn().mockResolvedValue([]) } };
  jest.spyOn(Logger.prototype, "log").mockImplementation();
  jest.spyOn(Logger.prototype, "warn").mockImplementation();
  return {
    prisma,
    service: new PodcastService(prisma as unknown as PrismaService),
  };
};

describe("PodcastService filter facets", () => {
  afterEach(() => jest.restoreAllMocks());

  it("counts only published, non-deleted podcasts", async () => {
    const { service, prisma } = setup();

    await service.findPodcastFilterFacets();

    expect(prisma.podcast.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        by: ["category"],
        where: { status: PodcastStatus.PUBLISHED, deletedAt: null },
      }),
    );
  });

  it("returns one option per category backed by a public podcast", async () => {
    const { service, prisma } = setup();
    prisma.podcast.groupBy.mockResolvedValue([
      categoryRow(PodcastCategory.TECHNOLOGY, 4),
      categoryRow(PodcastCategory.BUSINESS, 1),
    ]);

    await expect(service.findPodcastFilterFacets()).resolves.toEqual({
      categories: [
        { value: PodcastCategory.BUSINESS, count: 1 },
        { value: PodcastCategory.TECHNOLOGY, count: 4 },
      ],
    });
  });

  it("offers nothing for an empty catalogue", async () => {
    const { service } = setup();

    await expect(service.findPodcastFilterFacets()).resolves.toEqual({
      categories: [],
    });
  });
});
