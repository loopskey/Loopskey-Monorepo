import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { PodcastStatus, Role } from "@prisma/client";

import { PodcastMessageCode } from "@podcast/enums/message-code.enum";
import { PrismaService } from "@prisma/prisma.service";
import { PodcastService } from "./podcast.service";

const NON_PUBLIC_STATUSES = [PodcastStatus.DRAFT, PodcastStatus.ARCHIVED];
const PUBLIC_VISIBILITY = {
  status: PodcastStatus.PUBLISHED,
  deletedAt: null,
};

const setup = () => {
  const prisma = {
    podcast: {
      findFirst: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    },
    podcastEpisode: { findMany: jest.fn().mockResolvedValue([]) },
    $queryRaw: jest.fn().mockResolvedValue([]),
    $transaction: jest.fn((operations: Promise<unknown>[]) =>
      Promise.all(operations),
    ),
  };
  return {
    prisma,
    service: new PodcastService(prisma as unknown as PrismaService),
  };
};

describe("PodcastService public visibility", () => {
  describe.each([
    ["findPodcastById", "id"],
    ["findPodcastBySlug", "slug"],
  ] as const)("%s", (method, field) => {
    it("filters on published, non-deleted podcasts", async () => {
      const { service, prisma } = setup();

      await expect(service[method]("podcast-1")).rejects.toBeInstanceOf(
        NotFoundException,
      );

      expect(prisma.podcast.findFirst).toHaveBeenCalledWith({
        where: { [field]: "podcast-1", ...PUBLIC_VISIBILITY },
      });
    });

    it("answers a hidden podcast exactly like an unknown one", async () => {
      const { service } = setup();

      const failure = await service[method]("missing").catch(
        (error: unknown) => error,
      );

      expect(failure).toBeInstanceOf(NotFoundException);
      expect((failure as NotFoundException).message).toBe(
        PodcastMessageCode.PODCAST_NOT_FOUND,
      );
    });
  });

  describe("findPodcastEpisodes", () => {
    it("discloses nothing about a hidden parent", async () => {
      const { service, prisma } = setup();

      await expect(
        service.findPodcastEpisodes("podcast-1"),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(prisma.podcastEpisode.findMany).not.toHaveBeenCalled();
    });

    it("lists the episodes of a published podcast", async () => {
      const { service, prisma } = setup();
      prisma.podcast.findFirst.mockResolvedValue({ id: "podcast-1" });

      await service.findPodcastEpisodes("podcast-1");

      expect(prisma.podcastEpisode.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { podcastId: "podcast-1" } }),
      );
    });
  });

  describe("findPodcasts", () => {
    it.each(NON_PUBLIC_STATUSES)(
      "rejects an explicit %s status",
      async (status) => {
        const { service, prisma } = setup();

        await expect(service.findPodcasts({ status })).rejects.toBeInstanceOf(
          ForbiddenException,
        );
        await expect(
          service.findPodcasts({ status, search: "design" }),
        ).rejects.toBeInstanceOf(ForbiddenException);

        expect(prisma.podcast.findMany).not.toHaveBeenCalled();
        expect(prisma.$queryRaw).not.toHaveBeenCalled();
      },
    );

    it.each([undefined, PodcastStatus.PUBLISHED])(
      "lists published podcasts when the status is %s",
      async (status) => {
        const { service, prisma } = setup();

        await service.findPodcasts({ status });

        expect(prisma.podcast.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining(PUBLIC_VISIBILITY),
          }),
        );
      },
    );

    it("searches only published podcasts", async () => {
      const { service, prisma } = setup();

      await service.findPodcasts({ search: "design" });

      const [, ...values] = prisma.$queryRaw.mock.calls[0] as unknown[];
      expect(values).toContain(PodcastStatus.PUBLISHED);
      for (const status of NON_PUBLIC_STATUSES)
        expect(values).not.toContain(status);
    });
  });

  describe("findFeaturedPodcasts", () => {
    it("returns only published, non-deleted podcasts", async () => {
      const { service, prisma } = setup();

      await service.findFeaturedPodcasts();

      expect(prisma.podcast.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { ...PUBLIC_VISIBILITY, isFeatured: true },
        }),
      );
    });
  });

  describe("findMyProviderPodcasts", () => {
    it.each(NON_PUBLIC_STATUSES)(
      "lets the owning provider list their %s podcasts",
      async (status) => {
        const { service, prisma } = setup();

        await service.findMyProviderPodcasts(
          { id: "provider-1", role: Role.PROVIDER },
          { status, providerId: "provider-2" },
        );

        expect(prisma.podcast.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { status, providerId: "provider-1", deletedAt: null },
          }),
        );
      },
    );

    it("lets an admin list any provider's drafts", async () => {
      const { service, prisma } = setup();

      await service.findMyProviderPodcasts(
        { id: "admin-1", role: Role.ADMIN },
        { status: PodcastStatus.DRAFT, providerId: "provider-2" },
      );

      expect(prisma.podcast.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: PodcastStatus.DRAFT,
            providerId: "provider-2",
          }),
        }),
      );
    });

    it.each([Role.PROFESSIONAL, Role.ORGANIZATION])(
      "refuses the %s role",
      async (role) => {
        const { service, prisma } = setup();

        await expect(
          service.findMyProviderPodcasts(
            { id: "user-1", role },
            { status: PodcastStatus.DRAFT },
          ),
        ).rejects.toBeInstanceOf(ForbiddenException);

        expect(prisma.podcast.findMany).not.toHaveBeenCalled();
      },
    );
  });
});
