import { INestApplication, ValidationPipe } from "@nestjs/common";
import { CourseStatus, EventStatus } from "@prisma/client";
import { PodcastStatus, YouTubeChannelStatus } from "@prisma/client";
import { PrismaService } from "@prisma/prisma.service";
import { Test } from "@nestjs/testing";
import { AppModule } from "@app/app.module";
import { encodeCatalogCursor } from "@utils/catalog-pagination.util";

import cookieParser from "cookie-parser";
import request from "supertest";

const PAGE_INFO =
  "pageInfo { hasNextPage nextCursor hasPreviousPage previousCursor }";

const documents = {
  course: `query Q($filter: CourseFilterInput, $pagination: CoursePaginationInput, $sort: CourseSortInput) {
    page: courses(filter: $filter, pagination: $pagination, sort: $sort) { items { id } totalCount ${PAGE_INFO} }
  }`,
  event: `query Q($filter: EventFilterInput, $pagination: EventPaginationInput, $sort: EventSortInput) {
    page: events(filter: $filter, pagination: $pagination, sort: $sort) { items { id } totalCount ${PAGE_INFO} }
  }`,
  podcast: `query Q($filter: PodcastFilterInput, $pagination: PodcastPaginationInput, $sort: PodcastSortInput) {
    page: podcasts(filter: $filter, pagination: $pagination, sort: $sort) { items { id } totalCount ${PAGE_INFO} }
  }`,
  youtube: `query Q($filter: YouTubeChannelFilterInput, $pagination: YouTubeChannelPaginationInput, $sort: YouTubeChannelSortInput) {
    page: youtubeChannels(filter: $filter, pagination: $pagination, sort: $sort) { items { id } totalCount ${PAGE_INFO} }
  }`,
} as const;

type Kind = keyof typeof documents;

type PageInfo = {
  hasNextPage: boolean;
  nextCursor: string | null;
  hasPreviousPage: boolean;
  previousCursor: string | null;
};

type Page = {
  items: Array<{ id: string }>;
  totalCount: number;
  pageInfo: PageInfo;
};

const FIXED_DATE = new Date("2031-03-01T10:00:00.000Z");
const ROW_COUNT = 9;
const TITLE_MATCHES = 5;
const TAKE = 4;

describe("Catalogue cursor pagination (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const token = `zzqxpage${Date.now()}`;
  const ids: Record<Kind, string[]> = {
    course: [],
    event: [],
    podcast: [],
    youtube: [],
  };
  const hiddenIds: Record<Kind, string[]> = {
    course: [],
    event: [],
    podcast: [],
    youtube: [],
  };

  const titleFor = (index: number) =>
    index < TITLE_MATCHES ? `${token} Item ${index}` : `Plain Item ${index}`;
  const descriptionFor = (index: number) =>
    index < TITLE_MATCHES
      ? "Ordinary description."
      : `Mentions ${token} only here ${index}.`;

  const createRow: Record<
    Kind,
    (index: number, hidden?: "draft" | "deleted") => Promise<string>
  > = {
    course: async (index, hidden) =>
      (
        await prisma.course.create({
          data: {
            slug: `${token}-course-${index}-${hidden ?? "live"}`,
            title: titleFor(index),
            instructor: "Fixture Instructor",
            description: descriptionFor(index),
            category: "TECHNOLOGY",
            rating: index % 2 === 0 ? 4.5 : 2,
            status:
              hidden === "draft" ? CourseStatus.DRAFT : CourseStatus.PUBLISHED,
            deletedAt: hidden === "deleted" ? new Date() : null,
            createdAt: FIXED_DATE,
          },
        })
      ).id,
    event: async (index, hidden) =>
      (
        await prisma.event.create({
          data: {
            slug: `${token}-event-${index}-${hidden ?? "live"}`,
            title: titleFor(index),
            type: "WORKSHOP",
            deliveryMode: "LIVE_ONLINE",
            category: "TECHNOLOGY",
            description: descriptionFor(index),
            startDate: FIXED_DATE,
            isFree: true,
            status:
              hidden === "draft" ? EventStatus.DRAFT : EventStatus.PUBLISHED,
            deletedAt: hidden === "deleted" ? new Date() : null,
            createdAt: FIXED_DATE,
          },
        })
      ).id,
    podcast: async (index, hidden) =>
      (
        await prisma.podcast.create({
          data: {
            slug: `${token}-podcast-${index}-${hidden ?? "live"}`,
            title: titleFor(index),
            host: "Fixture Host",
            description: descriptionFor(index),
            category: "AI",
            status:
              hidden === "draft"
                ? PodcastStatus.DRAFT
                : PodcastStatus.PUBLISHED,
            deletedAt: hidden === "deleted" ? new Date() : null,
            createdAt: FIXED_DATE,
          },
        })
      ).id,
    youtube: async (index, hidden) =>
      (
        await prisma.youTubeChannel.create({
          data: {
            slug: `${token}-channel-${index}-${hidden ?? "live"}`,
            title: titleFor(index),
            provider: "Fixture Provider",
            description: descriptionFor(index),
            category: "DATA",
            status:
              hidden === "draft"
                ? YouTubeChannelStatus.DRAFT
                : YouTubeChannelStatus.PUBLISHED,
            deletedAt: hidden === "deleted" ? new Date() : null,
            createdAt: FIXED_DATE,
          },
        })
      ).id,
  };

  const softDelete: Record<Kind, (id: string) => Promise<unknown>> = {
    course: (id) =>
      prisma.course.update({ where: { id }, data: { deletedAt: new Date() } }),
    event: (id) =>
      prisma.event.update({ where: { id }, data: { deletedAt: new Date() } }),
    podcast: (id) =>
      prisma.podcast.update({ where: { id }, data: { deletedAt: new Date() } }),
    youtube: (id) =>
      prisma.youTubeChannel.update({
        where: { id },
        data: { deletedAt: new Date() },
      }),
  };

  const restore: Record<Kind, (id: string) => Promise<unknown>> = {
    course: (id) =>
      prisma.course.update({ where: { id }, data: { deletedAt: null } }),
    event: (id) =>
      prisma.event.update({ where: { id }, data: { deletedAt: null } }),
    podcast: (id) =>
      prisma.podcast.update({ where: { id }, data: { deletedAt: null } }),
    youtube: (id) =>
      prisma.youTubeChannel.update({
        where: { id },
        data: { deletedAt: null },
      }),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    prisma = app.get(PrismaService);

    for (const kind of Object.keys(documents) as Kind[]) {
      for (let index = 0; index < ROW_COUNT; index += 1)
        ids[kind].push(await createRow[kind](index));
      hiddenIds[kind].push(await createRow[kind](0, "draft"));
      hiddenIds[kind].push(await createRow[kind](1, "deleted"));
    }
  }, 120_000);

  afterAll(async () => {
    if (prisma) {
      await prisma.course.deleteMany({
        where: { slug: { startsWith: token } },
      });
      await prisma.event.deleteMany({ where: { slug: { startsWith: token } } });
      await prisma.podcast.deleteMany({
        where: { slug: { startsWith: token } },
      });
      await prisma.youTubeChannel.deleteMany({
        where: { slug: { startsWith: token } },
      });
    }
    await app?.close();
  }, 60_000);

  const run = (kind: Kind, variables: Record<string, unknown>) =>
    request(app.getHttpServer())
      .post("/graphql")
      .send({ query: documents[kind], variables });

  const readPage = async (
    kind: Kind,
    cursor: string | null,
    options: { search?: boolean; sort?: Record<string, string> } = {},
  ): Promise<Page> => {
    const response = await run(kind, {
      filter: options.search
        ? { search: token }
        : { category: LISTING_CATEGORY[kind] },
      pagination: { take: TAKE, cursor: cursor ?? undefined },
      sort: options.sort,
    });
    expect(response.body.errors).toBeUndefined();
    return response.body.data.page;
  };

  const walkForward = async (
    kind: Kind,
    options: { search?: boolean; sort?: Record<string, string> } = {},
  ) => {
    const pages: Page[] = [];
    let cursor: string | null = null;
    do {
      const page: Page = await readPage(kind, cursor, options);
      pages.push(page);
      cursor = page.pageInfo.nextCursor;
    } while (cursor && pages.length < 10);
    return pages;
  };

  const idsOf = (pages: Page[]) =>
    pages.flatMap((page) => page.items.map((item) => item.id));

  const LISTING_CATEGORY = {
    course: "TECHNOLOGY",
    event: "TECHNOLOGY",
    podcast: "AI",
    youtube: "DATA",
  } as const;

  const expectedIds = async (kind: Kind, search: boolean) => {
    if (search) return ids[kind];
    const where = {
      category: LISTING_CATEGORY[kind],
      deletedAt: null,
      status: "PUBLISHED",
    } as never;
    const select = { id: true };
    const rows = {
      course: () => prisma.course.findMany({ where, select }),
      event: () => prisma.event.findMany({ where, select }),
      podcast: () => prisma.podcast.findMany({ where, select }),
      youtube: () => prisma.youTubeChannel.findMany({ where, select }),
    }[kind]();
    return (await rows).map((row) => row.id);
  };

  describe.each(["course", "event", "podcast", "youtube"] as Kind[])(
    "%s",
    (kind) => {
      it.each([
        ["listing", { search: false }],
        ["search", { search: true }],
      ])(
        "walks every %s row once with equal sort values",
        async (_, options) => {
          const pages = await walkForward(kind, options);
          const seen = idsOf(pages);
          const expected = await expectedIds(kind, options.search === true);
          expect(expected.length).toBeGreaterThanOrEqual(ROW_COUNT);
          expect(new Set(seen).size).toBe(seen.length);
          expect([...seen].sort()).toEqual([...expected].sort());
          expect(
            pages.slice(0, -1).every((page) => page.items.length === TAKE),
          ).toBe(true);
          expect(
            pages.every((page) => page.totalCount === expected.length),
          ).toBe(true);
          expect(pages[0].pageInfo.hasPreviousPage).toBe(false);
          expect(pages[0].pageInfo.previousCursor).toBeNull();
          const last = pages[pages.length - 1];
          expect(last.pageInfo.hasNextPage).toBe(false);
          expect(last.pageInfo.nextCursor).toBeNull();
        },
      );

      it.each([
        ["listing", { search: false }],
        ["search", { search: true }],
      ])(
        "rebuilds earlier %s pages from previous cursors",
        async (_, options) => {
          const pages = await walkForward(kind, options);
          expect(pages.length).toBeGreaterThanOrEqual(3);

          expect(pages[1].pageInfo.hasPreviousPage).toBe(true);
          expect(pages[1].pageInfo.previousCursor).toBeNull();
          const firstAgain = await readPage(kind, null, options);
          expect(idsOf([firstAgain])).toEqual(idsOf([pages[0]]));

          for (let index = 2; index < pages.length; index += 1) {
            expect(pages[index].pageInfo.hasPreviousPage).toBe(true);
            const previous = pages[index].pageInfo.previousCursor;
            expect(previous).toBeTruthy();
            const earlier = await readPage(kind, previous, options);
            expect(idsOf([earlier])).toEqual(idsOf([pages[index - 1]]));
            expect(earlier.pageInfo.nextCursor).toBe(
              pages[index - 1].pageInfo.nextCursor,
            );
            expect(earlier.pageInfo.previousCursor).toBe(
              pages[index - 1].pageInfo.previousCursor,
            );
          }
        },
      );

      it("rejects a malformed cursor with a stable validation code", async () => {
        const response = await run(kind, {
          pagination: { take: TAKE, cursor: "not-a-valid-cursor" },
        });
        expect(response.body.errors?.[0]?.extensions?.code).toBe(
          "CATALOG_CURSOR_INVALID",
        );
        expect(response.body.data).toBeNull();
      });

      it("rejects an oversized cursor", async () => {
        const response = await run(kind, {
          pagination: { take: TAKE, cursor: "A".repeat(600) },
        });
        expect(response.body.errors?.[0]?.extensions?.code).toBe(
          "CATALOG_CURSOR_INVALID",
        );
      });

      it("rejects a cursor minted for a different kind", async () => {
        const otherKind: Kind = kind === "course" ? "event" : "course";
        const foreign = await readPage(otherKind, null);
        const response = await run(kind, {
          pagination: { take: TAKE, cursor: foreign.pageInfo.nextCursor },
        });
        expect(response.body.errors?.[0]?.extensions?.code).toBe(
          "CATALOG_CURSOR_INVALID",
        );
      });

      it("rejects a listing cursor on a search request and the reverse", async () => {
        const listing = await readPage(kind, null);
        const searchPage = await readPage(kind, null, { search: true });
        const listingOnSearch = await run(kind, {
          filter: { search: token },
          pagination: { take: TAKE, cursor: listing.pageInfo.nextCursor },
        });
        const searchOnListing = await run(kind, {
          pagination: { take: TAKE, cursor: searchPage.pageInfo.nextCursor },
        });
        expect(listingOnSearch.body.errors?.[0]?.extensions?.code).toBe(
          "CATALOG_CURSOR_INVALID",
        );
        expect(searchOnListing.body.errors?.[0]?.extensions?.code).toBe(
          "CATALOG_CURSOR_INVALID",
        );
      });

      it("rejects a cursor minted for another sort", async () => {
        const sortField = "TITLE";
        const response = await run(kind, {
          sort: { field: sortField, direction: "ASC" },
          pagination: {
            take: TAKE,
            cursor: (await readPage(kind, null)).pageInfo.nextCursor,
          },
        });
        expect(response.body.errors?.[0]?.extensions?.code).toBe(
          "CATALOG_CURSOR_INVALID",
        );
      });

      it.each([
        ["listing", { search: false }],
        ["search", { search: true }],
      ])(
        "reports an expired %s cursor when its row disappears",
        async (_, options) => {
          const first = await readPage(kind, null, options);
          const cursor = first.pageInfo.nextCursor as string;
          const anchorId = first.items[first.items.length - 1].id;

          await softDelete[kind](anchorId);
          try {
            const response = await run(kind, {
              filter: options.search ? { search: token } : undefined,
              pagination: { take: TAKE, cursor },
            });
            expect(response.body.errors?.[0]?.extensions?.code).toBe(
              "CATALOG_CURSOR_EXPIRED",
            );
          } finally {
            await restore[kind](anchorId);
          }
        },
      );

      it("treats a cursor naming a hidden row as expired", async () => {
        const draftId = hiddenIds[kind][0];
        const response = await run(kind, {
          pagination: {
            take: TAKE,
            cursor: encodeCatalogCursor(
              {
                kind,
                order: kind === "event" ? "startDate:asc" : "createdAt:desc",
              },
              draftId,
            ),
          },
        });
        expect(response.body.errors?.[0]?.extensions?.code).toBe(
          "CATALOG_CURSOR_EXPIRED",
        );
      });

      it("never returns draft or deleted rows", async () => {
        const seen = new Set([
          ...idsOf(await walkForward(kind)),
          ...idsOf(await walkForward(kind, { search: true })),
        ]);
        for (const hidden of hiddenIds[kind])
          expect(seen.has(hidden)).toBe(false);
      });

      it("keeps a deterministic order across sort fields", async () => {
        const sort = {
          course: { field: "PROFESSIONALS", direction: "DESC" },
          event: { field: "ATTENDEES", direction: "DESC" },
          podcast: { field: "LISTENERS", direction: "DESC" },
          youtube: { field: "SUBSCRIBERS", direction: "DESC" },
        }[kind];
        const pages = await walkForward(kind, { sort });
        const seen = idsOf(pages);
        expect(new Set(seen).size).toBe(seen.length);
        expect([...seen].sort()).toEqual([...ids[kind]].sort());
      });
    },
  );

  describe("course search filters", () => {
    it("applies minRating to the search path", async () => {
      const response = await run("course", {
        filter: { search: token, minRating: 4 },
        pagination: { take: 20 },
      });
      expect(response.body.errors).toBeUndefined();
      const page: Page = response.body.data.page;
      expect(page.items.length).toBe(Math.ceil(ROW_COUNT / 2));
      expect(page.totalCount).toBe(Math.ceil(ROW_COUNT / 2));
    });
  });

  describe("search input bounds", () => {
    it("rejects an over-long search term", async () => {
      const response = await run("course", {
        filter: { search: "x".repeat(300) },
        pagination: { take: 5 },
      });
      expect(response.body.errors?.length).toBeGreaterThan(0);
    });
  });
});
