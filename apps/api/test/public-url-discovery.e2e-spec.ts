import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { ContentType } from "@prisma/client";
import { PrismaService } from "@prisma/prisma.service";
import { AppModule } from "@app/app.module";

import request from "supertest";

type Shard = {
  index: number;
  urlCount: number;
  lastPublicChangeAt: string;
  startCursor: string;
  endCursor: string | null;
};

type ShardSet = {
  kind: ContentType;
  shardSize: number;
  isComplete: boolean;
  shards: Shard[];
};

type UrlItem = { slug: string; publicChangeAt: string };

type Page = {
  items: UrlItem[];
  nextCursor: string | null;
  hasNextPage: boolean;
};

const SHARDS_QUERY = `query {
  publicUrlShards {
    kind
    shardSize
    isComplete
    shards { index urlCount lastPublicChangeAt startCursor endCursor }
  }
}`;

const PAGE_QUERY = `query Page($input: PublicUrlPageInput!) {
  publicUrlPage(input: $input) {
    hasNextPage
    nextCursor
    items { slug publicChangeAt }
  }
}`;

const SHARD_SIZE = 2;

describe("Public URL discovery (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const token = `zzqxurl${Date.now()}`;
  const previousShardSize = process.env.PUBLIC_URL_SHARD_SIZE;

  const post = (query: string, variables?: Record<string, unknown>) =>
    request(app.getHttpServer())
      .post("/graphql")
      .send({ query, variables })
      .expect(200);

  const readShardSets = async (): Promise<ShardSet[]> => {
    const response = await post(SHARDS_QUERY);
    expect(response.body.errors).toBeUndefined();
    return response.body.data.publicUrlShards;
  };

  const setOf = async (kind: ContentType) => {
    const sets = await readShardSets();
    const set = sets.find((candidate) => candidate.kind === kind);
    expect(set).toBeDefined();
    return set!;
  };

  const readPage = async (input: Record<string, unknown>): Promise<Page> => {
    const response = await post(PAGE_QUERY, { input });
    expect(response.body.errors).toBeUndefined();
    return response.body.data.publicUrlPage;
  };

  const readShard = async (kind: ContentType, shard: Shard, take = 1) => {
    const slugs: string[] = [];
    let after: string | null = null;
    for (let request = 0; request < 50; request += 1) {
      const page: Page = await readPage({
        kind,
        take,
        after,
        startCursor: shard.startCursor,
        endCursor: shard.endCursor,
      });
      slugs.push(...page.items.map((item) => item.slug));
      if (!page.hasNextPage || !page.nextCursor) return slugs;
      after = page.nextCursor;
    }
    throw new Error("shard traversal did not terminate");
  };

  const readKind = async (kind: ContentType, take = 1) => {
    const set = await setOf(kind);
    const slugs: string[] = [];
    for (const shard of set.shards)
      slugs.push(...(await readShard(kind, shard, take)));
    return slugs;
  };

  const ownSlugs = (slugs: string[]) =>
    slugs.filter((slug) => slug.startsWith(token));

  const courseData = (
    name: string,
    overrides: Record<string, unknown> = {},
  ) => ({
    slug: `${token}-course-${name}`,
    title: `${token} course ${name}`,
    description: "A course used by the public URL discovery suite.",
    instructor: "Discovery Instructor",
    category: "TECHNOLOGY" as const,
    status: "PUBLISHED" as const,
    ...overrides,
  });

  beforeAll(async () => {
    process.env.PUBLIC_URL_SHARD_SIZE = String(SHARD_SIZE);
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    prisma = app.get(PrismaService);

    for (const name of ["one", "two", "three", "four", "five"])
      await prisma.course.create({ data: courseData(name) });

    await prisma.course.create({
      data: courseData("draft", { status: "DRAFT" }),
    });
    await prisma.course.create({
      data: courseData("archived", { status: "ARCHIVED" }),
    });
    await prisma.course.create({
      data: courseData("deleted", { deletedAt: new Date() }),
    });

    await prisma.event.create({
      data: {
        slug: `${token}-event-one`,
        title: `${token} event one`,
        description: "An event used by the public URL discovery suite.",
        type: "WEBINAR",
        deliveryMode: "LIVE_ONLINE",
        category: "TECHNOLOGY",
        status: "PUBLISHED",
        startDate: new Date("2031-01-01T10:00:00.000Z"),
        isFree: true,
      },
    });
    await prisma.event.create({
      data: {
        slug: `${token}-event-cancelled`,
        title: `${token} event cancelled`,
        description:
          "A cancelled event used by the public URL discovery suite.",
        type: "WEBINAR",
        deliveryMode: "LIVE_ONLINE",
        category: "TECHNOLOGY",
        status: "CANCELLED",
        startDate: new Date("2031-01-01T10:00:00.000Z"),
        isFree: true,
      },
    });
    await prisma.podcast.create({
      data: {
        slug: `${token}-podcast-one`,
        title: `${token} podcast one`,
        description: "A podcast used by the public URL discovery suite.",
        host: "Discovery Host",
        category: "AI",
        status: "PUBLISHED",
      },
    });
    await prisma.youTubeChannel.create({
      data: {
        slug: `${token}-youtube-one`,
        title: `${token} youtube one`,
        description: "A channel used by the public URL discovery suite.",
        category: "AI",
        status: "PUBLISHED",
      },
    });
  });

  afterAll(async () => {
    if (previousShardSize === undefined)
      delete process.env.PUBLIC_URL_SHARD_SIZE;
    else process.env.PUBLIC_URL_SHARD_SIZE = previousShardSize;
    if (prisma) {
      const where = { slug: { startsWith: token } };
      await prisma.course.deleteMany({ where });
      await prisma.event.deleteMany({ where });
      await prisma.podcast.deleteMany({ where });
      await prisma.youTubeChannel.deleteMany({ where });
    }
    await app?.close();
  }, 60_000);

  it("answers anonymously with one shard set per content kind", async () => {
    const sets = await readShardSets();

    expect(sets.map((set) => set.kind).sort()).toEqual([
      ContentType.COURSE,
      ContentType.EVENT,
      ContentType.PODCAST,
      ContentType.YOUTUBE,
    ]);
    expect(sets.every((set) => set.shardSize === SHARD_SIZE)).toBe(true);
    expect(sets.every((set) => set.isComplete)).toBe(true);
  });

  it("splits a kind into bounded shards and chains their cursors", async () => {
    const set = await setOf(ContentType.COURSE);

    expect(set.shards.length).toBeGreaterThanOrEqual(3);
    expect(set.shards.every((shard) => shard.urlCount <= SHARD_SIZE)).toBe(
      true,
    );
    expect(set.shards.map((shard) => shard.index)).toEqual(
      set.shards.map((_shard, index) => index),
    );
    for (const [position, shard] of set.shards.entries()) {
      const next = set.shards[position + 1];
      expect(shard.endCursor).toBe(next ? next.startCursor : null);
    }
  });

  it("covers every eligible URL exactly once and excludes hidden rows", async () => {
    const slugs = await readKind(ContentType.COURSE);

    expect(ownSlugs(slugs).sort()).toEqual([
      `${token}-course-five`,
      `${token}-course-four`,
      `${token}-course-one`,
      `${token}-course-three`,
      `${token}-course-two`,
    ]);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("returns the same rows whatever the page size", async () => {
    const byOne = await readKind(ContentType.COURSE, 1);
    const byMany = await readKind(ContentType.COURSE, 2_500);

    expect(byOne).toEqual(byMany);
  });

  it("keeps the other three kinds publication-filtered too", async () => {
    expect(ownSlugs(await readKind(ContentType.EVENT))).toEqual([
      `${token}-event-one`,
    ]);
    expect(ownSlugs(await readKind(ContentType.PODCAST))).toEqual([
      `${token}-podcast-one`,
    ]);
    expect(ownSlugs(await readKind(ContentType.YOUTUBE))).toEqual([
      `${token}-youtube-one`,
    ]);
  });

  const crawlAllButLast = async (shards: Shard[]) => {
    const slugs: string[] = [];
    for (const shard of shards.slice(0, -1))
      slugs.push(...(await readShard(ContentType.COURSE, shard, 2_500)));
    return slugs;
  };

  it("covers a row inserted mid-crawl exactly once", async () => {
    const { shards } = await setOf(ContentType.COURSE);
    const crawled = await crawlAllButLast(shards);

    await prisma.course.create({ data: courseData("inserted") });

    const seen = [
      ...crawled,
      ...(await readShard(
        ContentType.COURSE,
        shards[shards.length - 1],
        2_500,
      )),
    ];

    expect(new Set(seen).size).toBe(seen.length);
    expect(seen).toContain(`${token}-course-inserted`);

    await prisma.course.delete({ where: { slug: `${token}-course-inserted` } });
  });

  it("loses no other row when one is withdrawn mid-crawl", async () => {
    const { shards } = await setOf(ContentType.COURSE);
    const crawled = await crawlAllButLast(shards);

    await prisma.course.update({
      where: { slug: `${token}-course-five` },
      data: { deletedAt: new Date(), publicContentUpdatedAt: new Date() },
    });

    const seen = [
      ...crawled,
      ...(await readShard(
        ContentType.COURSE,
        shards[shards.length - 1],
        2_500,
      )),
    ];

    expect(new Set(seen).size).toBe(seen.length);
    expect(seen).not.toContain(`${token}-course-five`);
    expect(ownSlugs(seen).sort()).toEqual([
      `${token}-course-four`,
      `${token}-course-one`,
      `${token}-course-three`,
      `${token}-course-two`,
    ]);

    await prisma.course.update({
      where: { slug: `${token}-course-five` },
      data: { deletedAt: null, publicContentUpdatedAt: new Date() },
    });
  });

  describe("publication lifecycle", () => {
    const slug = `${token}-course-lifecycle`;

    const isListed = async () => {
      const page = await readPage({
        kind: ContentType.COURSE,
        take: 2_500,
        startCursor: (await setOf(ContentType.COURSE)).shards[0].startCursor,
      });
      return page.items.some((item) => item.slug === slug);
    };

    it("adds a URL on publication and removes it on withdrawal", async () => {
      const course = await prisma.course.create({
        data: courseData("lifecycle", { status: "DRAFT" }),
      });
      expect(await isListed()).toBe(false);

      await prisma.course.update({
        where: { id: course.id },
        data: { status: "PUBLISHED", publicContentUpdatedAt: new Date() },
      });
      expect(await isListed()).toBe(true);

      await prisma.course.update({
        where: { id: course.id },
        data: { status: "ARCHIVED", publicContentUpdatedAt: new Date() },
      });
      expect(await isListed()).toBe(false);

      await prisma.course.update({
        where: { id: course.id },
        data: { status: "PUBLISHED", publicContentUpdatedAt: new Date() },
      });
      expect(await isListed()).toBe(true);

      await prisma.course.update({
        where: { id: course.id },
        data: { deletedAt: new Date() },
      });
      expect(await isListed()).toBe(false);

      await prisma.course.update({
        where: { id: course.id },
        data: { deletedAt: null },
      });
      expect(await isListed()).toBe(true);

      await prisma.course.delete({ where: { id: course.id } });
      expect(await isListed()).toBe(false);
    });
  });

  describe("lastmod", () => {
    const changeAtOf = async (kind: ContentType, slug: string) => {
      const page = await readPage({
        kind,
        take: 2_500,
        startCursor: (await setOf(kind)).shards[0].startCursor,
      });
      const listed = page.items.find((item) => item.slug === slug);
      if (!listed) throw new Error(`${slug} is not listed`);
      return new Date(listed.publicChangeAt).getTime();
    };

    it("reports the public change timestamp, not the row's last write", async () => {
      const event = await prisma.event.findFirstOrThrow({
        where: { slug: `${token}-event-one` },
      });
      const before = await changeAtOf(ContentType.EVENT, event.slug);

      await request(app.getHttpServer())
        .post("/graphql")
        .send({
          query: `mutation { recordEventView(eventId: "${event.id}") }`,
        })
        .expect(200);

      const after = await changeAtOf(ContentType.EVENT, event.slug);
      const stored = await prisma.event.findUniqueOrThrow({
        where: { id: event.id },
      });

      expect(stored.views).toBe(event.views + 1);
      expect(stored.updatedAt.getTime()).toBeGreaterThan(
        event.updatedAt.getTime(),
      );
      expect(after).toBe(before);
    });

    it("moves when the public content actually changes", async () => {
      const slug = `${token}-podcast-one`;
      const before = await changeAtOf(ContentType.PODCAST, slug);

      await prisma.podcast.update({
        where: { slug },
        data: {
          title: `${token} podcast renamed`,
          publicContentUpdatedAt: new Date(),
        },
      });

      expect(await changeAtOf(ContentType.PODCAST, slug)).toBeGreaterThan(
        before,
      );
    });
  });

  describe("selector validation", () => {
    it("rejects a cursor minted for another kind", async () => {
      const courseShard = (await setOf(ContentType.COURSE)).shards[0];

      const response = await post(PAGE_QUERY, {
        input: {
          kind: ContentType.PODCAST,
          startCursor: courseShard.startCursor,
        },
      });

      expect(response.body.data).toBeNull();
      expect(response.body.errors[0].extensions.code).toBe(
        "PUBLIC_URL_CURSOR_INVALID",
      );
    });

    it.each([
      ["a malformed cursor", { startCursor: "not a cursor" }],
      ["an oversized cursor", { startCursor: "a".repeat(300) }],
      ["an unusable page size", { startCursor: "unused", take: 10_000 }],
    ])("rejects %s as a bad request", async (_name, overrides) => {
      const response = await post(PAGE_QUERY, {
        input: { kind: ContentType.COURSE, ...overrides },
      });

      expect(response.body.data ?? null).toBeNull();
      expect(response.body.errors).toBeDefined();
    });
  });
});
