import { Role } from "@prisma/client";

import { PrismaService } from "@prisma/prisma.service";
import { YouTubeService } from "./youtbue.service";

const PROVIDER = { id: "provider-1", role: Role.PROVIDER };
const EXISTING = { id: "channel-1", providerId: PROVIDER.id };
const VIDEO = {
  id: "video-1",
  channelId: EXISTING.id,
  views: 12,
  channel: EXISTING,
};

const setup = () => {
  const prisma = {
    youTubeChannel: {
      findFirst: jest.fn().mockResolvedValue(EXISTING),
      findUnique: jest.fn().mockResolvedValue(EXISTING),
      update: jest.fn().mockResolvedValue(EXISTING),
    },
    youTubeVideo: {
      findUnique: jest.fn().mockResolvedValue(VIDEO),
      findFirst: jest.fn().mockResolvedValue(VIDEO),
      create: jest.fn().mockResolvedValue(VIDEO),
      update: jest.fn().mockResolvedValue(VIDEO),
      delete: jest.fn().mockResolvedValue(VIDEO),
    },
    $transaction: jest.fn(),
  };
  prisma.$transaction.mockImplementation(
    (run: (tx: typeof prisma) => Promise<unknown>) => run(prisma),
  );
  return {
    prisma,
    service: new YouTubeService(prisma as unknown as PrismaService),
  };
};

const stampedAt = (prisma: ReturnType<typeof setup>["prisma"]) => {
  const [call] = prisma.youTubeChannel.update.mock.calls;
  return (call[0] as { data: { publicContentUpdatedAt?: Date } }).data
    .publicContentUpdatedAt;
};

describe("YouTubeService public content change timestamp", () => {
  it.each([
    "publishChannel",
    "archiveChannel",
    "softDeleteChannel",
    "restoreChannel",
  ] as const)("moves the timestamp on %s", async (method) => {
    const { service, prisma } = setup();

    await service[method]("channel-1", PROVIDER);

    expect(stampedAt(prisma)).toBeInstanceOf(Date);
  });

  it("moves the timestamp when public content is edited", async () => {
    const { service, prisma } = setup();

    await service.updateChannel(
      { channelId: "channel-1", title: "Renamed" },
      PROVIDER,
    );

    expect(stampedAt(prisma)).toBeInstanceOf(Date);
  });

  it.each([
    [
      "a video is updated",
      (service: YouTubeService) =>
        service.updateVideo({ videoId: "video-1", title: "Renamed" }, PROVIDER),
    ],
    [
      "a video is removed",
      (service: YouTubeService) => service.deleteVideo("video-1", PROVIDER),
    ],
  ])("moves the timestamp when %s", async (_name, act) => {
    const { service, prisma } = setup();

    await act(service);

    expect(stampedAt(prisma)).toBeInstanceOf(Date);
  });

  it("leaves the timestamp alone when only the rating is recomputed", async () => {
    const { service, prisma } = setup();

    await service.updateEngagementRating("channel-1", 4.5, 10);

    expect(stampedAt(prisma)).toBeUndefined();
  });
});
