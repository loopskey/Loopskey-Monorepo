import { Role } from "@prisma/client";

import { PrismaService } from "@prisma/prisma.service";
import { PodcastService } from "./podcast.service";

const PROVIDER = { id: "provider-1", role: Role.PROVIDER };
const EXISTING = { id: "podcast-1", providerId: PROVIDER.id };
const EPISODE = {
  id: "episode-1",
  podcastId: EXISTING.id,
  durationMinutes: 30,
  podcast: EXISTING,
};

const setup = () => {
  const prisma = {
    podcast: {
      findFirst: jest.fn().mockResolvedValue(EXISTING),
      findUnique: jest.fn().mockResolvedValue(EXISTING),
      update: jest.fn().mockResolvedValue(EXISTING),
    },
    podcastEpisode: {
      findUnique: jest.fn().mockResolvedValue(EPISODE),
      findFirst: jest.fn().mockResolvedValue(EPISODE),
      create: jest.fn().mockResolvedValue(EPISODE),
      update: jest.fn().mockResolvedValue(EPISODE),
      delete: jest.fn().mockResolvedValue(EPISODE),
      count: jest.fn().mockResolvedValue(1),
    },
    $transaction: jest.fn(),
  };
  prisma.$transaction.mockImplementation(
    (run: (tx: typeof prisma) => Promise<unknown>) => run(prisma),
  );
  return {
    prisma,
    service: new PodcastService(prisma as unknown as PrismaService),
  };
};

const stampedAt = (prisma: ReturnType<typeof setup>["prisma"]) => {
  const [call] = prisma.podcast.update.mock.calls;
  return (call[0] as { data: { publicContentUpdatedAt?: Date } }).data
    .publicContentUpdatedAt;
};

describe("PodcastService public content change timestamp", () => {
  it.each([
    "publishPodcast",
    "archivePodcast",
    "softDeletePodcast",
    "restorePodcast",
  ] as const)("moves the timestamp on %s", async (method) => {
    const { service, prisma } = setup();

    await service[method]("podcast-1", PROVIDER);

    expect(stampedAt(prisma)).toBeInstanceOf(Date);
  });

  it("moves the timestamp when public content is edited", async () => {
    const { service, prisma } = setup();

    await service.updatePodcast(
      { podcastId: "podcast-1", title: "Renamed" },
      PROVIDER,
    );

    expect(stampedAt(prisma)).toBeInstanceOf(Date);
  });

  it.each([
    [
      "an episode is updated",
      (service: PodcastService) =>
        service.updatePodcastEpisode(
          { episodeId: "episode-1", title: "Renamed" },
          PROVIDER,
        ),
    ],
    [
      "an episode is removed",
      (service: PodcastService) =>
        service.deletePodcastEpisode("episode-1", PROVIDER),
    ],
  ])("moves the timestamp when %s", async (_name, act) => {
    const { service, prisma } = setup();

    await act(service);

    expect(stampedAt(prisma)).toBeInstanceOf(Date);
  });

  it("leaves the timestamp alone when only the rating is recomputed", async () => {
    const { service, prisma } = setup();

    await service.updateEngagementRating("podcast-1", 4.5, 10);

    expect(stampedAt(prisma)).toBeUndefined();
  });
});
