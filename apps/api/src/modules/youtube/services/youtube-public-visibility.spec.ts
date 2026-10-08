import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { Role, YouTubeChannelStatus, YouTubeVideoStatus } from "@prisma/client";

import { YouTubeMessageCode } from "@youtube/enums/message-code.enum";
import { PrismaService } from "@prisma/prisma.service";
import { YouTubeService } from "./youtbue.service";

const NON_PUBLIC_STATUSES = [
  YouTubeChannelStatus.DRAFT,
  YouTubeChannelStatus.ARCHIVED,
];
const PUBLIC_VISIBILITY = {
  status: YouTubeChannelStatus.PUBLISHED,
  deletedAt: null,
};

const setup = () => {
  const prisma = {
    youTubeChannel: {
      findFirst: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    },
    youTubeVideo: { findMany: jest.fn().mockResolvedValue([]) },
    $queryRaw: jest.fn().mockResolvedValue([]),
    $transaction: jest.fn((operations: Promise<unknown>[]) =>
      Promise.all(operations),
    ),
  };
  return {
    prisma,
    service: new YouTubeService(prisma as unknown as PrismaService),
  };
};

describe("YouTubeService public visibility", () => {
  describe.each([
    ["findChannelById", "id"],
    ["findChannelBySlug", "slug"],
  ] as const)("%s", (method, field) => {
    it("filters on published, non-deleted channels", async () => {
      const { service, prisma } = setup();

      await expect(service[method]("channel-1")).rejects.toBeInstanceOf(
        NotFoundException,
      );

      expect(prisma.youTubeChannel.findFirst).toHaveBeenCalledWith({
        where: { [field]: "channel-1", ...PUBLIC_VISIBILITY },
      });
    });

    it("answers a hidden channel exactly like an unknown one", async () => {
      const { service } = setup();

      const failure = await service[method]("missing").catch(
        (error: unknown) => error,
      );

      expect(failure).toBeInstanceOf(NotFoundException);
      expect((failure as NotFoundException).message).toBe(
        YouTubeMessageCode.YOUTUBE_CHANNEL_NOT_FOUND,
      );
    });
  });

  describe("findVideos", () => {
    it("discloses nothing about a hidden parent", async () => {
      const { service, prisma } = setup();

      await expect(service.findVideos("channel-1")).rejects.toBeInstanceOf(
        NotFoundException,
      );

      expect(prisma.youTubeVideo.findMany).not.toHaveBeenCalled();
    });

    it("lists only published videos of a published channel", async () => {
      const { service, prisma } = setup();
      prisma.youTubeChannel.findFirst.mockResolvedValue({ id: "channel-1" });

      await service.findVideos("channel-1");

      expect(prisma.youTubeVideo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            channelId: "channel-1",
            status: YouTubeVideoStatus.PUBLISHED,
          },
        }),
      );
    });
  });

  describe("findChannels", () => {
    it.each(NON_PUBLIC_STATUSES)(
      "rejects an explicit %s status",
      async (status) => {
        const { service, prisma } = setup();

        await expect(service.findChannels({ status })).rejects.toBeInstanceOf(
          ForbiddenException,
        );
        await expect(
          service.findChannels({ status, search: "design" }),
        ).rejects.toBeInstanceOf(ForbiddenException);

        expect(prisma.youTubeChannel.findMany).not.toHaveBeenCalled();
        expect(prisma.$queryRaw).not.toHaveBeenCalled();
      },
    );

    it.each([undefined, YouTubeChannelStatus.PUBLISHED])(
      "lists published channels when the status is %s",
      async (status) => {
        const { service, prisma } = setup();

        await service.findChannels({ status });

        expect(prisma.youTubeChannel.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining(PUBLIC_VISIBILITY),
          }),
        );
      },
    );

    it("searches only published channels", async () => {
      const { service, prisma } = setup();

      await service.findChannels({ search: "design" });

      const [, ...values] = prisma.$queryRaw.mock.calls[0] as unknown[];
      expect(values).toContain(YouTubeChannelStatus.PUBLISHED);
      for (const status of NON_PUBLIC_STATUSES)
        expect(values).not.toContain(status);
    });
  });

  describe("findFeaturedChannels", () => {
    it("returns only published, non-deleted channels", async () => {
      const { service, prisma } = setup();

      await service.findFeaturedChannels();

      expect(prisma.youTubeChannel.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { ...PUBLIC_VISIBILITY, isFeatured: true },
        }),
      );
    });
  });

  describe("findMyProviderChannels", () => {
    it.each(NON_PUBLIC_STATUSES)(
      "lets the owning provider list their %s channels",
      async (status) => {
        const { service, prisma } = setup();

        await service.findMyProviderChannels(
          { id: "provider-1", role: Role.PROVIDER },
          { status, providerId: "provider-2" },
        );

        expect(prisma.youTubeChannel.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { status, providerId: "provider-1", deletedAt: null },
          }),
        );
      },
    );

    it("lets an admin list any provider's drafts", async () => {
      const { service, prisma } = setup();

      await service.findMyProviderChannels(
        { id: "admin-1", role: Role.ADMIN },
        { status: YouTubeChannelStatus.DRAFT, providerId: "provider-2" },
      );

      expect(prisma.youTubeChannel.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: YouTubeChannelStatus.DRAFT,
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
          service.findMyProviderChannels(
            { id: "user-1", role },
            { status: YouTubeChannelStatus.DRAFT },
          ),
        ).rejects.toBeInstanceOf(ForbiddenException);

        expect(prisma.youTubeChannel.findMany).not.toHaveBeenCalled();
      },
    );
  });
});
