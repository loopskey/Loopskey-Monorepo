import { INestApplication, ValidationPipe } from "@nestjs/common";
import { CourseStatus, EventStatus } from "@prisma/client";
import { PodcastStatus, YouTubeChannelStatus } from "@prisma/client";
import { PrismaService } from "@prisma/prisma.service";
import { Test } from "@nestjs/testing";
import { AppModule } from "@app/app.module";

import cookieParser from "cookie-parser";
import request from "supertest";

// The /content filters are built from these queries instead of the GraphQL
// enums, so what matters here is that they see the whole public catalogue and
// nothing else: no drafts, no archived or cancelled rows, no soft-deleted
// rows, and no dependence on the caller's current page.

const COURSE_FACETS = `
  query CourseFilterFacets {
    courseFilterFacets {
      categories { value count }
      levels { value count }
      ratings { minimum count }
    }
  }
`;

const EVENT_FACETS = `
  query EventFilterFacets {
    eventFilterFacets {
      categories { value count }
      types { value count }
    }
  }
`;

const PODCAST_FACETS = `
  query PodcastFilterFacets {
    podcastFilterFacets {
      categories { value count }
    }
  }
`;

const YOUTUBE_FACETS = `
  query YoutubeChannelFilterFacets {
    youtubeChannelFilterFacets {
      categories { value count }
    }
  }
`;

const COURSES_PAGE = `
  query Courses($pagination: CoursePaginationInput) {
    courses(pagination: $pagination) {
      items { id }
      totalCount
    }
  }
`;

type Facet = { value: string; count: number };
type RatingFacet = { minimum: number; count: number };

describe("Content filter facets (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const token = `zzqxfacet${Date.now()}`;
  const courseIds: string[] = [];
  const eventIds: string[] = [];
  const podcastIds: string[] = [];
  const channelIds: string[] = [];

  const post = (query: string, variables?: Record<string, unknown>) =>
    request(app.getHttpServer())
      .post("/graphql")
      .send({ query, variables })
      .expect(200);

  const countOf = (facets: Facet[], value: string) =>
    facets.find((facet) => facet.value === value)?.count ?? 0;

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

    const course = (
      index: number,
      data: Partial<{
        category: "TECHNOLOGY" | "BUSINESS" | "DESIGN";
        level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
        status: CourseStatus;
        deletedAt: Date | null;
        rating: number;
        ratingCount: number;
      }>,
    ) =>
      prisma.course.create({
        data: {
          slug: `${token}-course-${index}`,
          title: `${token} Course ${index}`,
          instructor: "Facet Instructor",
          description: "A course used by the facet e2e suite.",
          category: data.category ?? "TECHNOLOGY",
          level: data.level ?? "BEGINNER",
          status: data.status ?? CourseStatus.PUBLISHED,
          deletedAt: data.deletedAt ?? null,
          rating: data.rating ?? 0,
          ratingCount: data.ratingCount ?? 0,
        },
      });

    // Two public technology courses, one public business course, and one
    // public course per level the suite asserts on. Ratings: 4.6 and 4.5 fall
    // in the 4.5 bucket, 4.2 in the 4.0 bucket.
    const published = await Promise.all([
      course(1, { category: "TECHNOLOGY", rating: 4.6, ratingCount: 10 }),
      course(2, { category: "TECHNOLOGY", rating: 4.5, ratingCount: 4 }),
      course(3, {
        category: "BUSINESS",
        level: "INTERMEDIATE",
        rating: 4.2,
        ratingCount: 2,
      }),
      // Reviewed-but-unrated and unreviewed rows must not create a 0+ option.
      course(4, { category: "TECHNOLOGY", rating: 0, ratingCount: 0 }),
      course(5, { category: "TECHNOLOGY", rating: 4.9, ratingCount: 0 }),
    ]);
    const hidden = await Promise.all([
      course(6, { category: "DESIGN", status: CourseStatus.DRAFT }),
      course(7, { category: "DESIGN", status: CourseStatus.ARCHIVED }),
      course(8, {
        category: "DESIGN",
        level: "ADVANCED",
        deletedAt: new Date(),
        rating: 5,
        ratingCount: 9,
      }),
    ]);
    courseIds.push(...[...published, ...hidden].map((row) => row.id));

    const event = (
      index: number,
      data: Partial<{
        category: "TECHNOLOGY" | "DESIGN";
        type: "WEBINAR" | "WORKSHOP";
        status: EventStatus;
        deletedAt: Date | null;
      }>,
    ) =>
      prisma.event.create({
        data: {
          slug: `${token}-event-${index}`,
          title: `${token} Event ${index}`,
          type: data.type ?? "WEBINAR",
          deliveryMode: "LIVE_ONLINE",
          category: data.category ?? "TECHNOLOGY",
          status: data.status ?? EventStatus.PUBLISHED,
          deletedAt: data.deletedAt ?? null,
          description: "An event used by the facet e2e suite.",
          startDate: new Date("2031-01-01T10:00:00.000Z"),
          isFree: true,
        },
      });

    const events = await Promise.all([
      event(1, { category: "TECHNOLOGY", type: "WEBINAR" }),
      event(2, { category: "TECHNOLOGY", type: "WORKSHOP" }),
      event(3, { category: "DESIGN", status: EventStatus.CANCELLED }),
      event(4, { category: "DESIGN", status: EventStatus.DRAFT }),
      event(5, { category: "DESIGN", deletedAt: new Date() }),
    ]);
    eventIds.push(...events.map((row) => row.id));

    const podcasts = await Promise.all([
      prisma.podcast.create({
        data: {
          slug: `${token}-podcast-1`,
          title: `${token} Podcast 1`,
          host: "Facet Host",
          description: "A podcast used by the facet e2e suite.",
          category: "AI",
          status: PodcastStatus.PUBLISHED,
        },
      }),
      prisma.podcast.create({
        data: {
          slug: `${token}-podcast-2`,
          title: `${token} Podcast 2`,
          host: "Facet Host",
          description: "A draft podcast used by the facet e2e suite.",
          category: "DESIGN",
          status: PodcastStatus.DRAFT,
        },
      }),
    ]);
    podcastIds.push(...podcasts.map((row) => row.id));

    const channels = await Promise.all([
      prisma.youTubeChannel.create({
        data: {
          slug: `${token}-channel-1`,
          title: `${token} Channel 1`,
          provider: "Facet Provider",
          description: "A channel used by the facet e2e suite.",
          category: "DATA",
          status: YouTubeChannelStatus.PUBLISHED,
        },
      }),
      prisma.youTubeChannel.create({
        data: {
          slug: `${token}-channel-2`,
          title: `${token} Channel 2`,
          provider: "Facet Provider",
          description: "A deleted channel used by the facet e2e suite.",
          category: "DESIGN",
          status: YouTubeChannelStatus.PUBLISHED,
          deletedAt: new Date(),
        },
      }),
    ]);
    channelIds.push(...channels.map((row) => row.id));
  }, 120_000);

  afterAll(async () => {
    if (prisma) {
      await prisma.course.deleteMany({ where: { id: { in: courseIds } } });
      await prisma.event.deleteMany({ where: { id: { in: eventIds } } });
      await prisma.podcast.deleteMany({ where: { id: { in: podcastIds } } });
      await prisma.youTubeChannel.deleteMany({
        where: { id: { in: channelIds } },
      });
    }
    await app?.close();
  }, 60_000);

  describe("course facets", () => {
    it("serves an anonymous visitor typed categories, levels and star thresholds", async () => {
      const response = await post(COURSE_FACETS);
      const facets = response.body.data.courseFilterFacets;

      expect(response.body.errors).toBeUndefined();
      expect(countOf(facets.categories, "TECHNOLOGY")).toBeGreaterThanOrEqual(
        4,
      );
      expect(countOf(facets.categories, "BUSINESS")).toBeGreaterThanOrEqual(1);
      expect(countOf(facets.levels, "BEGINNER")).toBeGreaterThanOrEqual(4);
      expect(countOf(facets.levels, "INTERMEDIATE")).toBeGreaterThanOrEqual(1);
      expect(facets.categories.every((facet: Facet) => facet.count > 0)).toBe(
        true,
      );
    });

    it("counts the whole catalogue, not the caller's page", async () => {
      const page = await post(COURSES_PAGE, { pagination: { take: 1 } });
      const facets = (await post(COURSE_FACETS)).body.data.courseFilterFacets;

      expect(page.body.data.courses.items).toHaveLength(1);
      const facetTotal = facets.categories.reduce(
        (total: number, facet: Facet) => total + facet.count,
        0,
      );
      expect(facetTotal).toBe(page.body.data.courses.totalCount);
      expect(facetTotal).toBeGreaterThan(1);
    });

    it("offers star thresholds in descending order with cumulative counts", async () => {
      const facets = (await post(COURSE_FACETS)).body.data.courseFilterFacets;
      const ratings: RatingFacet[] = facets.ratings;

      const minimums = ratings.map((facet) => facet.minimum);
      expect(minimums).toEqual([...minimums].sort((a, b) => b - a));
      expect(minimums).toContain(4.5);
      expect(minimums).toContain(4);
      expect(minimums).not.toContain(0);

      const atLeast45 = ratings.find((facet) => facet.minimum === 4.5)!.count;
      const atLeast40 = ratings.find((facet) => facet.minimum === 4)!.count;
      expect(atLeast40).toBeGreaterThan(atLeast45);
      expect(ratings.every((facet) => facet.count > 0)).toBe(true);
    });

    it("counts the reviewed courses at or above a threshold", async () => {
      const facets = (await post(COURSE_FACETS)).body.data.courseFilterFacets;
      const threshold = facets.ratings[0].minimum as number;

      const reviewed = await prisma.course.count({
        where: {
          status: CourseStatus.PUBLISHED,
          deletedAt: null,
          ratingCount: { gt: 0 },
          rating: { gte: threshold },
        },
      });

      expect(facets.ratings[0].count).toBe(reviewed);
    });

    /**
     * The count is deliberately narrower than the list's `minRating` filter,
     * which tests `rating >= minRating` alone. A row with a rating but no
     * reviews is counted by the list and not by the facet. `rating` is only
     * ever written by the review aggregate, so the two agree on real data;
     * this fixture forces the divergence so the difference is a recorded
     * decision rather than a surprise.
     */
    it("excludes an unreviewed course the list's minRating filter would return", async () => {
      const facets = (await post(COURSE_FACETS)).body.data.courseFilterFacets;
      const threshold = facets.ratings[0].minimum as number;

      const listed = await prisma.course.count({
        where: {
          status: CourseStatus.PUBLISHED,
          deletedAt: null,
          rating: { gte: threshold },
        },
      });

      const unreviewed = await prisma.course.count({
        where: {
          status: CourseStatus.PUBLISHED,
          deletedAt: null,
          ratingCount: 0,
          rating: { gte: threshold },
        },
      });

      expect(unreviewed).toBeGreaterThan(0);
      expect(facets.ratings[0].count).toBe(listed - unreviewed);
    });
  });

  it("never offers a value that only draft, archived, cancelled or deleted content has", async () => {
    const [courses, events, podcasts, channels] = await Promise.all([
      post(COURSE_FACETS),
      post(EVENT_FACETS),
      post(PODCAST_FACETS),
      post(YOUTUBE_FACETS),
    ]);

    const hiddenCourses = await prisma.course.count({
      where: { id: { in: courseIds }, category: "DESIGN" },
    });
    expect(hiddenCourses).toBe(3);

    const courseFacets = courses.body.data.courseFilterFacets;
    const designCourses = await prisma.course.count({
      where: {
        category: "DESIGN",
        status: CourseStatus.PUBLISHED,
        deletedAt: null,
      },
    });
    expect(countOf(courseFacets.categories, "DESIGN")).toBe(designCourses);
    expect(courseFacets.levels.every((facet: Facet) => facet.count > 0)).toBe(
      true,
    );

    const designEvents = await prisma.event.count({
      where: {
        category: "DESIGN",
        status: EventStatus.PUBLISHED,
        deletedAt: null,
      },
    });
    expect(
      countOf(events.body.data.eventFilterFacets.categories, "DESIGN"),
    ).toBe(designEvents);

    const designPodcasts = await prisma.podcast.count({
      where: {
        category: "DESIGN",
        status: PodcastStatus.PUBLISHED,
        deletedAt: null,
      },
    });
    expect(
      countOf(podcasts.body.data.podcastFilterFacets.categories, "DESIGN"),
    ).toBe(designPodcasts);

    const designChannels = await prisma.youTubeChannel.count({
      where: {
        category: "DESIGN",
        status: YouTubeChannelStatus.PUBLISHED,
        deletedAt: null,
      },
    });
    expect(
      countOf(
        channels.body.data.youtubeChannelFilterFacets.categories,
        "DESIGN",
      ),
    ).toBe(designChannels);
  });

  it("serves event, podcast and channel facets to an anonymous visitor", async () => {
    const [events, podcasts, channels] = await Promise.all([
      post(EVENT_FACETS),
      post(PODCAST_FACETS),
      post(YOUTUBE_FACETS),
    ]);

    expect(events.body.errors).toBeUndefined();
    expect(
      countOf(events.body.data.eventFilterFacets.categories, "TECHNOLOGY"),
    ).toBeGreaterThanOrEqual(2);
    expect(
      countOf(events.body.data.eventFilterFacets.types, "WEBINAR"),
    ).toBeGreaterThanOrEqual(1);
    expect(
      countOf(events.body.data.eventFilterFacets.types, "WORKSHOP"),
    ).toBeGreaterThanOrEqual(1);

    expect(podcasts.body.errors).toBeUndefined();
    expect(
      countOf(podcasts.body.data.podcastFilterFacets.categories, "AI"),
    ).toBeGreaterThanOrEqual(1);

    expect(channels.body.errors).toBeUndefined();
    expect(
      countOf(channels.body.data.youtubeChannelFilterFacets.categories, "DATA"),
    ).toBeGreaterThanOrEqual(1);
  });

  it("drops an option once its last public record is archived, and restores it after", async () => {
    const [target] = await prisma.podcast.findMany({
      where: { id: { in: podcastIds }, status: PodcastStatus.PUBLISHED },
      take: 1,
    });
    const before = countOf(
      (await post(PODCAST_FACETS)).body.data.podcastFilterFacets.categories,
      target.category,
    );

    await prisma.podcast.update({
      where: { id: target.id },
      data: { status: PodcastStatus.ARCHIVED },
    });
    const archived = countOf(
      (await post(PODCAST_FACETS)).body.data.podcastFilterFacets.categories,
      target.category,
    );

    await prisma.podcast.update({
      where: { id: target.id },
      data: { status: PodcastStatus.PUBLISHED },
    });
    const restored = countOf(
      (await post(PODCAST_FACETS)).body.data.podcastFilterFacets.categories,
      target.category,
    );

    expect(archived).toBe(before - 1);
    expect(restored).toBe(before);
  });
});
