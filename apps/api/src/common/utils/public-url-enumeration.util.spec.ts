import { BadRequestException } from "@nestjs/common";
import { ContentType, Prisma } from "@prisma/client";

import {
  PUBLIC_URL_DEFAULT_SHARD_SIZE,
  PUBLIC_URL_MAX_SHARD_COUNT,
  PUBLIC_URL_MAX_SHARD_SIZE,
  PUBLIC_URL_MAX_TAKE,
  decodePublicUrlCursor,
  encodePublicUrlCursor,
  publicUrlPageTake,
  publicUrlShardSize,
  readPublicUrlPage,
  readPublicUrlShards,
  toCursorTimestamp,
} from "./public-url-enumeration.util";

import type { PublicUrlSource } from "./public-url-enumeration.util";

const COURSE_SOURCE: PublicUrlSource = {
  kind: ContentType.COURSE,
  table: "Course",
  statusType: "CourseStatus",
  translationTable: "CourseTranslation",
  translationParentColumn: "courseId",
};

const anchor = { createdAt: "2026-01-02T03:04:05.006", id: "course-1" };

const reader = (rows: unknown[]) => {
  const queries: Prisma.Sql[] = [];
  const reads = jest.fn();
  return {
    queries,
    reads,
    $queryRaw: <T>(query: Prisma.Sql): Promise<T> => {
      reads(query);
      queries.push(query);
      return Promise.resolve(rows as T);
    },
  };
};

const shardRow = (index: number, id: string) => ({
  index,
  urlCount: 2,
  lastPublicChangeAt: new Date("2026-02-03T00:00:00.000Z"),
  startId: id,
  startCreatedAt: new Date("2026-01-02T03:04:05.006Z"),
});

describe("public URL cursors", () => {
  it("round-trips an anchor for its own kind", () => {
    const token = encodePublicUrlCursor(ContentType.COURSE, anchor);

    expect(decodePublicUrlCursor(token, ContentType.COURSE)).toEqual(anchor);
  });

  it("rejects a cursor minted for another kind", () => {
    const token = encodePublicUrlCursor(ContentType.EVENT, anchor);

    expect(() => decodePublicUrlCursor(token, ContentType.COURSE)).toThrow(
      BadRequestException,
    );
  });

  it.each([
    ["an oversized token", "a".repeat(300)],
    ["a non-base64url token", "not a cursor!"],
    ["a token that is not JSON", Buffer.from("nonsense").toString("base64url")],
    [
      "a token with an unknown version",
      Buffer.from(
        JSON.stringify({
          v: 99,
          k: "COURSE",
          c: anchor.createdAt,
          i: anchor.id,
        }),
      ).toString("base64url"),
    ],
    [
      "a token with a malformed timestamp",
      Buffer.from(
        JSON.stringify({ v: 1, k: "COURSE", c: "yesterday", i: anchor.id }),
      ).toString("base64url"),
    ],
    [
      "a token with an unusable id",
      Buffer.from(
        JSON.stringify({
          v: 1,
          k: "COURSE",
          c: anchor.createdAt,
          i: "../../etc",
        }),
      ).toString("base64url"),
    ],
  ])("rejects %s", (_name, token) => {
    expect(() => decodePublicUrlCursor(token, ContentType.COURSE)).toThrow(
      BadRequestException,
    );
  });

  it("keeps the millisecond precision the column stores", () => {
    expect(toCursorTimestamp(new Date("2026-01-02T03:04:05.006Z"))).toBe(
      "2026-01-02T03:04:05.006",
    );
  });
});

describe("public URL selector bounds", () => {
  afterEach(() => {
    delete process.env.PUBLIC_URL_SHARD_SIZE;
  });

  it("defaults the shard size and the page size", () => {
    expect(publicUrlShardSize()).toBe(PUBLIC_URL_DEFAULT_SHARD_SIZE);
    expect(publicUrlPageTake()).toBe(PUBLIC_URL_MAX_TAKE);
  });

  it("takes the shard size from the environment when it is set", () => {
    process.env.PUBLIC_URL_SHARD_SIZE = "2500";

    expect(publicUrlShardSize()).toBe(2_500);
  });

  it.each(["0", "abc", "1.5", String(PUBLIC_URL_MAX_SHARD_SIZE + 1)])(
    "refuses to serve with a shard size of %s configured",
    (value) => {
      process.env.PUBLIC_URL_SHARD_SIZE = value;

      expect(() => publicUrlShardSize()).toThrow(/PUBLIC_URL_SHARD_SIZE/);
    },
  );

  it.each([0, -1, 1.5, PUBLIC_URL_MAX_TAKE + 1])(
    "rejects a page size of %s",
    (take) => {
      expect(() => publicUrlPageTake(take)).toThrow(BadRequestException);
    },
  );
});

describe("readPublicUrlShards", () => {
  it("reads only published, undeleted rows of its own table", async () => {
    const source = reader([shardRow(0, "course-1")]);

    await readPublicUrlShards(source, COURSE_SOURCE);

    const [query] = source.queries;
    expect(query.sql).toContain('FROM "Course"');
    expect(query.sql).toContain('"deletedAt" IS NULL');
    expect(query.sql).toContain('"status" = ?::"CourseStatus"');
    expect(query.values).toContain("PUBLISHED");
    expect(query.values).toContain(PUBLIC_URL_DEFAULT_SHARD_SIZE);
  });

  it("chains each shard's end cursor to the next shard's start", async () => {
    const source = reader([shardRow(0, "course-1"), shardRow(1, "course-2")]);

    const { shards } = await readPublicUrlShards(source, COURSE_SOURCE);

    expect(shards[0].endCursor).toBe(shards[1].startCursor);
    expect(shards[1].endCursor).toBeNull();
    expect(
      decodePublicUrlCursor(shards[0].startCursor, ContentType.COURSE),
    ).toEqual({
      id: "course-1",
      createdAt: "2026-01-02T03:04:05.006",
    });
  });

  it("reports truncation when the shard cap is exceeded", async () => {
    const rows = Array.from(
      { length: PUBLIC_URL_MAX_SHARD_COUNT + 1 },
      (_row, index) => shardRow(index, `course-${index}`),
    );
    const source = reader(rows);

    const { shards, truncated } = await readPublicUrlShards(
      source,
      COURSE_SOURCE,
    );

    expect(truncated).toBe(true);
    expect(shards).toHaveLength(PUBLIC_URL_MAX_SHARD_COUNT);
  });

  it("refuses a source whose table is not a bare identifier", async () => {
    const source = reader([]);

    await expect(
      readPublicUrlShards(source, { ...COURSE_SOURCE, table: 'Course" --' }),
    ).rejects.toThrow(BadRequestException);
    expect(source.reads).not.toHaveBeenCalled();
  });
});

describe("readPublicUrlPage", () => {
  const urlRow = (id: string, slug: string) => ({
    id,
    slug,
    createdAt: new Date("2026-01-02T03:04:05.006Z"),
    publicChangeAt: new Date("2026-02-03T00:00:00.000Z"),
    sourceLanguage: null,
    publishedLocales: [],
  });

  it("bounds the window by the shard's own anchors", async () => {
    const source = reader([urlRow("course-1", "alpha")]);
    const startCursor = encodePublicUrlCursor(ContentType.COURSE, anchor);
    const endCursor = encodePublicUrlCursor(ContentType.COURSE, {
      createdAt: "2026-03-04T05:06:07.008",
      id: "course-9",
    });

    const page = await readPublicUrlPage(source, COURSE_SOURCE, {
      startCursor,
      endCursor,
      take: 10,
    });

    const [query] = source.queries;
    expect(query.sql).toContain('("createdAt", "id") >=');
    expect(query.sql).toContain('("createdAt", "id") <');
    expect(query.values).toContain("2026-01-02T03:04:05.006");
    expect(query.values).toContain("course-9");
    expect(query.values).toContain(11);
    expect(page.items).toEqual([
      {
        slug: "alpha",
        publicChangeAt: new Date("2026-02-03T00:00:00.000Z"),
        availableLocales: [],
      },
    ]);
    expect(page.hasNextPage).toBe(false);
    expect(page.nextCursor).toBeNull();
  });

  it("continues past a cursor exclusively and offers the next one", async () => {
    const source = reader([
      urlRow("course-1", "alpha"),
      urlRow("course-2", "beta"),
    ]);
    const startCursor = encodePublicUrlCursor(ContentType.COURSE, anchor);

    const page = await readPublicUrlPage(source, COURSE_SOURCE, {
      startCursor,
      after: startCursor,
      take: 1,
    });

    const [query] = source.queries;
    expect(query.sql).toContain('("createdAt", "id") >');
    expect(query.sql).not.toContain('("createdAt", "id") >=');
    expect(page.items).toHaveLength(1);
    expect(page.hasNextPage).toBe(true);
    expect(decodePublicUrlCursor(page.nextCursor!, ContentType.COURSE)).toEqual(
      {
        id: "course-1",
        createdAt: "2026-01-02T03:04:05.006",
      },
    );
  });

  it("refuses a cursor that belongs to another kind", async () => {
    const source = reader([]);

    await expect(
      readPublicUrlPage(source, COURSE_SOURCE, {
        startCursor: encodePublicUrlCursor(ContentType.PODCAST, anchor),
      }),
    ).rejects.toThrow(BadRequestException);
    expect(source.reads).not.toHaveBeenCalled();
  });
});
