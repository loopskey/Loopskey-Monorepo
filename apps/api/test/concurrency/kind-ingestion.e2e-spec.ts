import { IngestionContentKind } from "@prisma/client";
import { INestApplication } from "@nestjs/common";
import { IngestionBatchRunnerService } from "@ingestion/services/ingestion-batch-runner.service";
import { EventIngestionService } from "@ingestion/services/event-ingestion.service";
import { PodcastIngestionService } from "@ingestion/services/podcast-ingestion.service";
import { YouTubeIngestionService } from "@ingestion/services/youtube-ingestion.service";
import { KIND_INGESTION_CONTRACT_VERSION } from "@ingestion/enums/kind-ingestion.constant";
import { PrismaService } from "@prisma/prisma.service";

import type { KindIngestionHandler } from "@ingestion/types/kind-ingestion.types";
import type { TIngestionSourceContext } from "@ingestion/types/ingestion.types";

import { bootApp, fulfilled, runTogether } from "../setup/concurrency";

const SLUG_PREFIX = "kind-ingest-e2e";

const unique = () =>
  `${process.pid.toString(36)}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

const EVENT_MAP: Record<string, string> = {
  external_id: "externalId",
  url: "canonicalUrl",
  name: "title",
  summary: "description",
  kind: "type",
  mode: "deliveryMode",
  topic_area: "category",
  starts_at: "startDate",
  ends_at: "endDate",
  tz: "timezone",
  agenda: "scheduleItems",
};

const PODCAST_MAP: Record<string, string> = {
  external_id: "externalId",
  url: "canonicalUrl",
  name: "title",
  summary: "description",
  presenter: "host",
  topic_area: "category",
  items: "episodes",
};

const YOUTUBE_MAP: Record<string, string> = {
  external_id: "externalId",
  url: "canonicalUrl",
  name: "title",
  about: "description",
  channel_url: "channelUrl",
  topic_area: "category",
  clips: "videos",
};

const eventItem = (overrides: Record<string, unknown> = {}) => ({
  external_id: `evt-${unique()}`,
  url: "https://example.com/events/summit",
  name: "Data Summit",
  summary: "A summit about data platforms.",
  kind: "conference",
  mode: "in person",
  topic_area: "technology",
  starts_at: "2026-05-01T09:00:00.000Z",
  ends_at: "2026-05-01T17:00:00.000Z",
  tz: "Europe/Paris",
  ...overrides,
});

const podcastItem = (overrides: Record<string, unknown> = {}) => ({
  external_id: `pod-${unique()}`,
  url: "https://example.com/podcasts/data",
  name: "Data Platform Weekly",
  summary: "Weekly data platform conversations.",
  presenter: "Ada Lovelace",
  topic_area: "technology",
  ...overrides,
});

const youtubeItem = (overrides: Record<string, unknown> = {}) => ({
  external_id: `chan-${unique()}`,
  url: "https://example.com/channels/data",
  name: "Data Platform Weekly",
  about: "Tutorials about data platforms.",
  channel_url: "https://youtube.com/@dpw",
  topic_area: "technology",
  ...overrides,
});

const envelope = (kind: IngestionContentKind, items: unknown[]) => ({
  contractVersion: KIND_INGESTION_CONTRACT_VERSION,
  kind,
  mode: "INCREMENTAL",
  items,
});

describe("Additional content kinds ingestion (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let runner: IngestionBatchRunnerService;
  let events: EventIngestionService;
  let podcasts: PodcastIngestionService;
  let channels: YouTubeIngestionService;

  const cleanup = async () => {
    const sources = await prisma.ingestionSource.findMany({
      where: { slug: { startsWith: SLUG_PREFIX } },
      select: { id: true },
    });
    const ids = sources.map((source) => source.id);
    if (ids.length) {
      const items = await prisma.ingestionItem.findMany({
        where: { sourceId: { in: ids } },
        select: { catalogId: true, source: { select: { kind: true } } },
      });
      const byKind = (kind: IngestionContentKind) =>
        items
          .filter((item) => item.source.kind === kind && item.catalogId)
          .map((item) => item.catalogId as string);
      await prisma.event.deleteMany({
        where: { id: { in: byKind(IngestionContentKind.EVENT) } },
      });
      await prisma.podcast.deleteMany({
        where: { id: { in: byKind(IngestionContentKind.PODCAST) } },
      });
      await prisma.youTubeChannel.deleteMany({
        where: { id: { in: byKind(IngestionContentKind.YOUTUBE) } },
      });
      await prisma.ingestionSource.deleteMany({ where: { id: { in: ids } } });
    }
    await prisma.outboxEvent.deleteMany({
      where: {
        eventName: "ingestion.item.published",
        aggregateType: "IngestionItem",
      },
    });
  };

  const createSource = async (
    kind: IngestionContentKind,
    fieldMap: Record<string, string>,
    autoPublish = false,
  ): Promise<TIngestionSourceContext> => {
    const source = await prisma.ingestionSource.create({
      data: {
        slug: `${SLUG_PREFIX}-${kind.toLowerCase()}-${unique()}`,
        name: `${kind} source`,
        kind,
        autoPublish,
        fieldMap,
      },
    });
    return {
      keyId: `key-${source.id}`,
      keyPrefix: "aaaaaaaaaaaa",
      sourceId: source.id,
      sourceSlug: source.slug,
      kind: source.kind,
      autoPublish: source.autoPublish,
      stalenessWindowDays: source.stalenessWindowDays,
      fieldMap: source.fieldMap,
    };
  };

  const submit = <T>(
    handler: KindIngestionHandler<T>,
    source: TIngestionSourceContext,
    kind: IngestionContentKind,
    items: unknown[],
  ) =>
    runner.run({
      handler,
      source,
      envelope: envelope(kind, items),
      idempotencyKey: `idem-${unique()}`,
    });

  beforeAll(async () => {
    ({ app, prisma } = (await bootApp()) as unknown as {
      app: INestApplication;
      prisma: PrismaService;
    });
    runner = app.get(IngestionBatchRunnerService);
    events = app.get(EventIngestionService);
    podcasts = app.get(PodcastIngestionService);
    channels = app.get(YouTubeIngestionService);
    await cleanup();
  }, 120000);

  afterAll(async () => {
    await cleanup();
    await app.close();
  }, 60000);

  it("creates each kind's row and its child rows and names each item", async () => {
    const eventSource = await createSource(
      IngestionContentKind.EVENT,
      EVENT_MAP,
    );
    const podcastSource = await createSource(
      IngestionContentKind.PODCAST,
      PODCAST_MAP,
    );
    const youtubeSource = await createSource(
      IngestionContentKind.YOUTUBE,
      YOUTUBE_MAP,
    );

    const eventReceipt = await submit(
      events,
      eventSource,
      IngestionContentKind.EVENT,
      [
        eventItem({
          agenda: [
            {
              dayNumber: 1,
              startTime: "2026-05-01T09:00:00.000Z",
              endTime: "2026-05-01T10:00:00.000Z",
              title: "Opening keynote",
            },
          ],
        }),
      ],
    );
    expect(eventReceipt.createdCount).toBe(1);
    expect(eventReceipt.items[0].externalId).toEqual(expect.any(String));
    const eventRow = await prisma.event.findUniqueOrThrow({
      where: { id: eventReceipt.items[0].catalogId as string },
      include: { scheduleItems: true },
    });
    expect(eventRow.scheduleItems).toHaveLength(1);
    expect(eventRow.registrationEnabled).toBe(false);

    const podcastReceipt = await submit(
      podcasts,
      podcastSource,
      IngestionContentKind.PODCAST,
      [
        podcastItem({
          items: [
            { episodeNumber: 1, title: "One" },
            { episodeNumber: 2, title: "Two" },
          ],
        }),
      ],
    );
    expect(podcastReceipt.createdCount).toBe(1);
    const podcastRow = await prisma.podcast.findUniqueOrThrow({
      where: { id: podcastReceipt.items[0].catalogId as string },
      include: { episodes: true },
    });
    expect(podcastRow.episodes).toHaveLength(2);
    expect(podcastRow.episodeCount).toBe(2);

    const youtubeReceipt = await submit(
      channels,
      youtubeSource,
      IngestionContentKind.YOUTUBE,
      [
        youtubeItem({
          clips: [
            { externalId: "vid-1", title: "Warehouses 101" },
            { externalId: "vid-2", title: "Lakehouses 101" },
          ],
        }),
      ],
    );
    expect(youtubeReceipt.createdCount).toBe(1);
    const channelRow = await prisma.youTubeChannel.findUniqueOrThrow({
      where: { id: youtubeReceipt.items[0].catalogId as string },
      include: { videos: true },
    });
    expect(channelRow.videos).toHaveLength(2);
  }, 120000);

  it("reports unchanged on a re-submission and duplicates no child rows", async () => {
    const source = await createSource(
      IngestionContentKind.PODCAST,
      PODCAST_MAP,
    );
    const item = podcastItem({
      items: [
        { episodeNumber: 1, title: "One" },
        { episodeNumber: 2, title: "Two" },
      ],
    });

    const first = await submit(podcasts, source, IngestionContentKind.PODCAST, [
      item,
    ]);
    const second = await submit(
      podcasts,
      source,
      IngestionContentKind.PODCAST,
      [item],
    );

    expect(second.unchangedCount).toBe(1);
    expect(
      await prisma.podcastEpisode.count({
        where: { podcastId: first.items[0].catalogId as string },
      }),
    ).toBe(2);
  }, 120000);

  it("rejects a podcast key used on the event route", async () => {
    const podcastSource = await createSource(
      IngestionContentKind.PODCAST,
      PODCAST_MAP,
    );
    await expect(
      runner.run({
        handler: events,
        source: podcastSource,
        envelope: envelope(IngestionContentKind.EVENT, [eventItem()]),
        idempotencyKey: `idem-${unique()}`,
      }),
    ).rejects.toMatchObject({
      response: { code: "INGESTION_KIND_MISMATCH" },
    });
  }, 120000);

  it("rejects an event with end before start and lands the rest of the batch", async () => {
    const source = await createSource(IngestionContentKind.EVENT, EVENT_MAP);
    const receipt = await submit(events, source, IngestionContentKind.EVENT, [
      eventItem({ ends_at: "2026-04-30T09:00:00.000Z" }),
      eventItem(),
    ]);
    expect(receipt.rejectedCount).toBe(1);
    expect(receipt.createdCount).toBe(1);
    const rejected = receipt.items.find((item) => item.state === "rejected");
    expect(rejected?.reason).toContain("INGESTION_EVENT_DATE_RANGE_INVALID");
  }, 120000);

  it("leaves podcast episodes on omission and clears them on an empty array", async () => {
    const source = await createSource(
      IngestionContentKind.PODCAST,
      PODCAST_MAP,
    );
    const externalId = `pod-${unique()}`;
    const base = { external_id: externalId };

    await submit(podcasts, source, IngestionContentKind.PODCAST, [
      podcastItem({ ...base, items: [{ episodeNumber: 1, title: "One" }] }),
    ]);
    const podcastId = (
      await prisma.ingestionItem.findFirstOrThrow({
        where: { sourceId: source.sourceId },
      })
    ).catalogId as string;

    // Omitting `items` leaves the stored episode.
    await submit(podcasts, source, IngestionContentKind.PODCAST, [
      podcastItem({ ...base, name: "Renamed" }),
    ]);
    expect(await prisma.podcastEpisode.count({ where: { podcastId } })).toBe(1);

    // An explicit empty array clears the set.
    await submit(podcasts, source, IngestionContentKind.PODCAST, [
      podcastItem({ ...base, items: [] }),
    ]);
    expect(await prisma.podcastEpisode.count({ where: { podcastId } })).toBe(0);
    expect(
      (await prisma.podcast.findUniqueOrThrow({ where: { id: podcastId } }))
        .episodeCount,
    ).toBe(0);
  }, 120000);

  it("skips a numberless episode while the podcast and its numbered episodes land", async () => {
    const source = await createSource(
      IngestionContentKind.PODCAST,
      PODCAST_MAP,
    );
    const receipt = await submit(
      podcasts,
      source,
      IngestionContentKind.PODCAST,
      [
        podcastItem({
          items: [
            { episodeNumber: 1, title: "One" },
            { title: "No number" },
            { episodeNumber: 2, title: "Two" },
          ],
        }),
      ],
    );
    expect(receipt.createdCount).toBe(1);
    const podcastId = receipt.items[0].catalogId as string;
    const episodes = await prisma.podcastEpisode.findMany({
      where: { podcastId },
      orderBy: { episodeNumber: "asc" },
    });
    expect(episodes.map((episode) => episode.episodeNumber)).toEqual([1, 2]);
    expect(
      (await prisma.podcast.findUniqueOrThrow({ where: { id: podcastId } }))
        .episodeCount,
    ).toBe(2);
  }, 120000);

  it("rejects a payload that sets a platform-owned field rather than ignoring it", async () => {
    const source = await createSource(IngestionContentKind.EVENT, EVENT_MAP);
    const receipt = await submit(events, source, IngestionContentKind.EVENT, [
      eventItem({ capacity: 500 }),
      eventItem({ isFeatured: true }),
      eventItem({ attendees: 12 }),
    ]);
    expect(receipt.rejectedCount).toBe(3);
    expect(receipt.createdCount).toBe(0);
    for (const item of receipt.items)
      expect(item.reason).toMatch(/owned by the platform/);
  }, 120000);

  it("converges on one episode set when two crawls of one podcast race", async () => {
    const source = await createSource(
      IngestionContentKind.PODCAST,
      PODCAST_MAP,
    );
    const externalId = `pod-race-${unique()}`;

    // Seed the podcast so both racing crawls contend on one IngestionItem row.
    await submit(podcasts, source, IngestionContentKind.PODCAST, [
      podcastItem({
        external_id: externalId,
        items: [{ episodeNumber: 1, title: "Seed" }],
      }),
    ]);
    const podcastId = (
      await prisma.ingestionItem.findFirstOrThrow({
        where: { sourceId: source.sourceId, externalId },
      })
    ).catalogId as string;

    const setA = [
      { episodeNumber: 1, title: "A1" },
      { episodeNumber: 2, title: "A2" },
      { episodeNumber: 3, title: "A3" },
    ];
    const setB = [
      { episodeNumber: 10, title: "B10" },
      { episodeNumber: 11, title: "B11" },
    ];

    const results = await runTogether(2, (index) =>
      submit(podcasts, source, IngestionContentKind.PODCAST, [
        podcastItem({
          external_id: externalId,
          name: `Race ${index}`,
          items: index === 0 ? setA : setB,
        }),
      ]),
    );

    expect(fulfilled(results)).toHaveLength(2);
    const episodes = await prisma.podcastEpisode.findMany({
      where: { podcastId },
      orderBy: { episodeNumber: "asc" },
    });
    const numbers = episodes.map((episode) => episode.episodeNumber);
    const isSetA = numbers.join(",") === "1,2,3";
    const isSetB = numbers.join(",") === "10,11";
    expect(isSetA || isSetB).toBe(true);
    expect(
      (await prisma.podcast.findUniqueOrThrow({ where: { id: podcastId } }))
        .episodeCount,
    ).toBe(numbers.length);
    expect(
      await prisma.ingestionItem.count({
        where: { sourceId: source.sourceId, externalId },
      }),
    ).toBe(1);
  }, 120000);
});
