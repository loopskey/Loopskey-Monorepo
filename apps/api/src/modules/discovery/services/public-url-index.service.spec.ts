import { NotFoundException } from "@nestjs/common";
import { ContentType } from "@prisma/client";

import { PublicUrlIndexService } from "./public-url-index.service";

import type { PublicUrlApi } from "@utils/public-url-enumeration.util";
import type { PublicUrlShard } from "@utils/public-url-enumeration.util";

const shard = (index: number): PublicUrlShard => ({
  index,
  urlCount: 3,
  lastPublicChangeAt: new Date("2026-02-03T00:00:00.000Z"),
  startCursor: `start-${index}`,
  endCursor: null,
});

const port = (kind: ContentType, shards: PublicUrlShard[] = [shard(0)]) => ({
  kind,
  readShards: jest
    .fn()
    .mockResolvedValue({ shardSize: 10_000, shards, truncated: false }),
  readPage: jest
    .fn()
    .mockResolvedValue({ items: [], nextCursor: null, hasNextPage: false }),
});

const setup = (
  overrides: Partial<Record<ContentType, ReturnType<typeof port>>> = {},
) => {
  const ports = {
    [ContentType.COURSE]: overrides.COURSE ?? port(ContentType.COURSE),
    [ContentType.EVENT]: overrides.EVENT ?? port(ContentType.EVENT),
    [ContentType.PODCAST]: overrides.PODCAST ?? port(ContentType.PODCAST),
    [ContentType.YOUTUBE]: overrides.YOUTUBE ?? port(ContentType.YOUTUBE),
  };
  const service = new PublicUrlIndexService(
    ports.COURSE as unknown as PublicUrlApi,
    ports.EVENT as unknown as PublicUrlApi,
    ports.PODCAST as unknown as PublicUrlApi,
    ports.YOUTUBE as unknown as PublicUrlApi,
  );
  return { ports, service };
};

describe("PublicUrlIndexService", () => {
  it("reads one shard set per content kind", async () => {
    const { service } = setup();

    const sets = await service.readShardSets();

    expect(sets.map((set) => set.kind)).toEqual([
      ContentType.COURSE,
      ContentType.EVENT,
      ContentType.PODCAST,
      ContentType.YOUTUBE,
    ]);
    expect(sets.every((set) => set.isComplete)).toBe(true);
  });

  it("reports an incomplete set when a domain truncates its shards", async () => {
    const truncating = port(ContentType.PODCAST);
    truncating.readShards.mockResolvedValue({
      shardSize: 10_000,
      shards: [shard(0)],
      truncated: true,
    });
    const { service } = setup({ PODCAST: truncating });

    const sets = await service.readShardSets();

    expect(
      sets.find((set) => set.kind === ContentType.PODCAST)?.isComplete,
    ).toBe(false);
  });

  it("fails the whole index when one kind cannot be read", async () => {
    const failing = port(ContentType.EVENT);
    failing.readShards.mockRejectedValue(new Error("upstream"));
    const { service } = setup({ EVENT: failing });

    await expect(service.readShardSets()).rejects.toThrow("upstream");
  });

  it("keeps an empty catalogue out of the index without failing", async () => {
    const empty = port(ContentType.YOUTUBE, []);
    const { service } = setup({ YOUTUBE: empty });

    const sets = await service.readShardSets();

    expect(
      sets.find((set) => set.kind === ContentType.YOUTUBE)?.shards,
    ).toEqual([]);
  });

  it("routes a page read to the requested kind alone", async () => {
    const { ports, service } = setup();

    await service.readPage({
      kind: ContentType.PODCAST,
      startCursor: "start-0",
    });

    expect(ports.PODCAST.readPage).toHaveBeenCalledWith({
      kind: ContentType.PODCAST,
      startCursor: "start-0",
    });
    expect(ports.COURSE.readPage).not.toHaveBeenCalled();
    expect(ports.EVENT.readPage).not.toHaveBeenCalled();
    expect(ports.YOUTUBE.readPage).not.toHaveBeenCalled();
  });

  it("refuses a kind it has no source for", async () => {
    const { service } = setup();

    await expect(
      service.readPage({
        kind: "UNKNOWN" as ContentType,
        startCursor: "start-0",
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
