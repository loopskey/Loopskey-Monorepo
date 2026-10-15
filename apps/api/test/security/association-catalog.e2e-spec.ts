import {
  ContentType,
  CourseCategory,
  CourseLevel,
  CourseStatus,
} from "@prisma/client";
import {
  EventCategory,
  EventDeliveryMode,
  EventStatus,
  EventType,
} from "@prisma/client";
import {
  PodcastCategory,
  PodcastStatus,
  Role,
  YouTubeCategory,
  YouTubeChannelStatus,
} from "@prisma/client";

import { CatalogEndorsementApiService } from "@landing/application/catalog-endorsement-api.service";
import { CatalogSearchPage } from "@landing/public/catalog-endorsement-api";
import {
  bootSecurityApp,
  dataOf,
  errorCode,
  graphql,
  seedUser,
  signIn,
  SecurityApp,
} from "../setup/security";
import { suiteScope } from "../setup/concurrency";

const scope = suiteScope("association-catalog");
const QUERY = `query($input: AssociationCatalogSearchInput!, $associationId: ID) {
  associationCatalogSearch: associationCatalogSearchPage(input: $input, associationId: $associationId) {
    totalCount pageInfo { hasNextPage nextCursor }
    items { contentId contentType title provider isAvailable durationMinutes indicativeCredits }
  }
}`;

describe("Association library search (GraphQL e2e)", () => {
  let ctx: SecurityApp;
  let cookies: string[];
  let professionalCookies: string[];
  let associationId: string;
  let catalog: CatalogEndorsementApiService;
  const courseIds: string[] = [];
  const eventIds: string[] = [];
  const podcastIds: string[] = [];
  const channelIds: string[] = [];

  const search = async (input: Record<string, unknown>) => {
    const response = await graphql(ctx.app, QUERY, { input }, cookies);
    expect(response.body.errors).toBeUndefined();
    return dataOf<CatalogSearchPage>(response, "associationCatalogSearch")!;
  };

  beforeAll(async () => {
    ctx = await bootSecurityApp();
    catalog = ctx.app.get(CatalogEndorsementApiService);
    const owner = await seedUser(ctx.prisma, scope.email("owner"), {
      role: Role.ASSOCIATION,
    });
    associationId = (
      await ctx.prisma.association.create({
        data: { ownerId: owner.id, name: "Catalogue test association" },
      })
    ).id;
    const professional = await seedUser(
      ctx.prisma,
      scope.email("professional"),
    );
    cookies = await signIn(ctx.app, owner.email!);
    professionalCookies = await signIn(ctx.app, professional.email!);

    const courses = await ctx.prisma.course.createManyAndReturn({
      data: Array.from({ length: 65 }, (_, index) => ({
        slug: scope.eventSlug(`course-${index}`),
        title:
          index < 40 || index >= 63
            ? `Product manager ${index}`
            : `Practical skills ${index}`,
        description:
          index < 40
            ? "Professional development"
            : "Training for a product manager",
        instructor: "Catalogue instructor",
        category: CourseCategory.BUSINESS,
        level: CourseLevel.ALL_LEVELS,
        status: index === 63 ? CourseStatus.DRAFT : CourseStatus.PUBLISHED,
        deletedAt: index === 64 ? new Date() : null,
        lastUpdatedAt: new Date(),
        createdAt: new Date("2026-01-01"),
      })),
      select: { id: true },
    });
    courseIds.push(...courses.map((course) => course.id));
    const event = await ctx.prisma.event.create({
      data: {
        slug: scope.eventSlug("event"),
        title: "Product manager conference",
        description: "An event",
        type: EventType.WEBINAR,
        category: EventCategory.BUSINESS,
        deliveryMode: EventDeliveryMode.LIVE_ONLINE,
        status: EventStatus.PUBLISHED,
        startDate: new Date(),
      },
    });
    eventIds.push(event.id);
    const podcast = await ctx.prisma.podcast.create({
      data: {
        slug: scope.eventSlug("podcast"),
        title: "Product manager conversations",
        description: "A podcast",
        host: "A host",
        category: PodcastCategory.BUSINESS,
        status: PodcastStatus.PUBLISHED,
      },
    });
    podcastIds.push(podcast.id);
    for (const published of [true, false]) {
      const channel = await ctx.prisma.youTubeChannel.create({
        data: {
          slug: scope.eventSlug(`channel-${published}`),
          title: "Management videos",
          category: YouTubeCategory.BUSINESS,
          status: published
            ? YouTubeChannelStatus.PUBLISHED
            : YouTubeChannelStatus.DRAFT,
          videos: {
            create: { title: "Product manager video", description: "A talk" },
          },
        },
      });
      channelIds.push(channel.id);
    }
  }, 120_000);

  afterAll(async () => {
    if (ctx) {
      await ctx.prisma.course.deleteMany({ where: { id: { in: courseIds } } });
      await ctx.prisma.event.deleteMany({ where: { id: { in: eventIds } } });
      await ctx.prisma.podcast.deleteMany({
        where: { id: { in: podcastIds } },
      });
      await ctx.prisma.youTubeChannel.deleteMany({
        where: { id: { in: channelIds } },
      });
      await scope.cleanup(ctx.prisma);
    }
    await ctx?.app.close();
  }, 60_000);

  it("matches the public course count and traverses all 63 courses without duplicates", async () => {
    const publicResult = await graphql(
      ctx.app,
      `
        query {
          courses(filter: { search: "product manager" }) {
            totalCount
          }
        }
      `,
    );
    expect(publicResult.body.errors).toBeUndefined();
    expect(publicResult.body.data.courses.totalCount).toBe(63);
    const ids: string[] = [];
    let cursor: string | undefined;
    do {
      const page = await search({
        search: "product manager",
        contentType: ContentType.COURSE,
        take: 20,
        cursor,
      });
      expect(page.totalCount).toBe(63);
      ids.push(...page.items.map((item) => item.contentId));
      cursor = page.pageInfo.nextCursor ?? undefined;
    } while (cursor);
    expect(ids).toHaveLength(63);
    expect(new Set(ids).size).toBe(63);
  });

  it("ranks mixed types globally and makes every match reachable", async () => {
    const first = await search({ search: "product manager", take: 20 });
    expect(first.totalCount).toBe(66);
    expect(new Set(first.items.map((item) => item.contentType))).toEqual(
      new Set(Object.values(ContentType)),
    );
    const again = await search({ search: "product manager", take: 20 });
    expect(again.items).toEqual(first.items);
    const ids = first.items.map(
      (item) => `${item.contentType}:${item.contentId}`,
    );
    let cursor = first.pageInfo.nextCursor;
    while (cursor) {
      const page = await search({
        search: "product manager",
        take: 20,
        cursor,
      });
      ids.push(
        ...page.items.map((item) => `${item.contentType}:${item.contentId}`),
      );
      cursor = page.pageInfo.nextCursor;
    }
    expect(new Set(ids).size).toBe(66);
    expect(ids).toHaveLength(66);
  });

  it("rejects malformed cursors and cursors belonging to another filter", async () => {
    const first = await search({ search: "product manager", take: 1 });
    for (const input of [
      { search: "product manager", cursor: "malformed" },
      { search: "different query", cursor: first.pageInfo.nextCursor },
      {
        search: "product manager",
        contentType: ContentType.COURSE,
        cursor: first.pageInfo.nextCursor,
      },
    ]) {
      expect(errorCode(await graphql(ctx.app, QUERY, { input }, cookies))).toBe(
        "CATALOG_CURSOR_INVALID",
      );
    }
  });

  it("expires a cursor when its anchor is no longer available", async () => {
    const page = await search({
      search: "product manager",
      contentType: ContentType.COURSE,
      take: 1,
    });
    const id = page.items[0].contentId;
    await ctx.prisma.course.update({
      where: { id },
      data: { status: CourseStatus.DRAFT },
    });
    try {
      const response = await graphql(
        ctx.app,
        QUERY,
        {
          input: {
            search: "product manager",
            contentType: ContentType.COURSE,
            cursor: page.pageInfo.nextCursor,
          },
        },
        cookies,
      );
      expect(errorCode(response)).toBe("CATALOG_CURSOR_EXPIRED");
    } finally {
      await ctx.prisma.course.update({
        where: { id },
        data: { status: CourseStatus.PUBLISHED },
      });
    }
  });

  it("supports browsing, rejects one-character searches and reports empty results", async () => {
    expect((await search({ take: 20 })).totalCount).toBe(66);
    expect((await search({ search: "zzzzunmatchablezzzz" })).items).toEqual([]);
    const response = await graphql(
      ctx.app,
      QUERY,
      { input: { search: "p" } },
      cookies,
    );
    expect(response.body.errors).toBeDefined();
    await expect(
      catalog.searchCatalog({ search: "p", take: 20 }),
    ).rejects.toThrow();
  });

  it("browses every type with stable cursors and supports returning to the previous page", async () => {
    const ids: string[] = [];
    let cursor: string | undefined;
    do {
      const page = await search({ take: 20, cursor });
      expect(page.totalCount).toBe(66);
      ids.push(
        ...page.items.map((item) => `${item.contentType}:${item.contentId}`),
      );
      cursor = page.pageInfo.nextCursor ?? undefined;
    } while (cursor);
    expect(ids).toHaveLength(66);
    expect(new Set(ids).size).toBe(66);
    const first = await catalog.searchCatalog({ take: 20 });
    const second = await catalog.searchCatalog({
      take: 20,
      cursor: first.pageInfo.nextCursor,
    });
    const third = await catalog.searchCatalog({
      take: 20,
      cursor: second.pageInfo.nextCursor,
    });
    const previous = await catalog.searchCatalog({
      take: 20,
      cursor: third.pageInfo.previousCursor,
    });
    expect(previous.items).toEqual(second.items);
  });

  it("uses the public course matching rules for a misspelled term", async () => {
    const publicResult = await graphql(
      ctx.app,
      `
        query {
          courses(filter: { search: "product manger" }) {
            totalCount
          }
        }
      `,
    );
    expect(publicResult.body.errors).toBeUndefined();
    const page = await search({
      search: "product manger",
      contentType: ContentType.COURSE,
    });
    expect(page.totalCount).toBeGreaterThan(0);
    expect(page.totalCount).toBe(publicResult.body.data.courses.totalCount);
  });

  it("requires authentication, an allowed role and the correct association context", async () => {
    for (const response of [
      await graphql(ctx.app, QUERY, { input: {} }),
      await graphql(ctx.app, QUERY, { input: {} }, professionalCookies),
      await graphql(ctx.app, QUERY, { input: {}, associationId }, cookies),
    ])
      expect(response.body.errors).toBeDefined();
  });
});
