import { INestApplication, ValidationPipe } from "@nestjs/common";
import { CourseStatus, EventStatus } from "@prisma/client";
import { PodcastStatus, YouTubeChannelStatus } from "@prisma/client";
import { PrismaService } from "@prisma/prisma.service";
import { Test } from "@nestjs/testing";
import { AppModule } from "@app/app.module";

import cookieParser from "cookie-parser";
import request from "supertest";

// Covers the /content page's per-tab list search (courses/events/podcasts/
// youtubeChannels), fixed to reuse the landing catalogue search's bounded
// exact-first + fuzzy-fallback architecture instead of the prior single-CTE,
// unbounded-similarity shape (see apps/api/benchmark/README.md and
// bench-content-search.js for the measured performance difference). No
// coverage existed for these search paths before this change.

const COURSES_SEARCH = `
  query Courses($filter: CourseFilterInput, $pagination: CoursePaginationInput) {
    courses(filter: $filter, pagination: $pagination) {
      items { id slug title category }
      totalCount
      pageInfo { hasNextPage nextCursor }
    }
  }
`;

const EVENTS_SEARCH = `
  query Events($filter: EventFilterInput, $pagination: EventPaginationInput) {
    events(filter: $filter, pagination: $pagination) {
      items { id slug title category }
      totalCount
      pageInfo { hasNextPage nextCursor }
    }
  }
`;

const PODCASTS_SEARCH = `
  query Podcasts($filter: PodcastFilterInput, $pagination: PodcastPaginationInput) {
    podcasts(filter: $filter, pagination: $pagination) {
      items { id slug title category }
      totalCount
      pageInfo { hasNextPage nextCursor }
    }
  }
`;

const YOUTUBE_SEARCH = `
  query YoutubeChannels($filter: YouTubeChannelFilterInput, $pagination: YouTubeChannelPaginationInput) {
    youtubeChannels(filter: $filter, pagination: $pagination) {
      items { id slug title category }
      totalCount
      pageInfo { hasNextPage nextCursor }
    }
  }
`;

describe("Content catalogue list search (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const token = `zzqxcontent${Date.now()}`;
  const createdCourseIds: string[] = [];
  const createdEventIds: string[] = [];
  const createdPodcastIds: string[] = [];
  const createdChannelIds: string[] = [];

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

    const titleCourse = await prisma.course.create({
      data: {
        slug: `${token}-title-course`,
        title: `${token} Fundamentals`,
        instructor: "Course Instructor",
        description: "A course about unrelated topics.",
        category: "TECHNOLOGY",
        status: CourseStatus.PUBLISHED,
      },
    });
    const descriptionCourse = await prisma.course.create({
      data: {
        slug: `${token}-description-course`,
        title: "Unrelated Advanced Topics",
        instructor: "Another Instructor",
        description: `This course mentions ${token} only in its description.`,
        category: "TECHNOLOGY",
        status: CourseStatus.PUBLISHED,
      },
    });
    const businessCourse = await prisma.course.create({
      data: {
        slug: `${token}-business-course`,
        title: `${token} for Business`,
        instructor: "Business Instructor",
        description: "A course about unrelated topics.",
        category: "BUSINESS",
        status: CourseStatus.PUBLISHED,
      },
    });
    const draftCourse = await prisma.course.create({
      data: {
        slug: `${token}-draft-course`,
        title: `${token} Draft Course`,
        instructor: "Draft Instructor",
        description: "Should never appear because it is a draft.",
        category: "TECHNOLOGY",
        status: CourseStatus.DRAFT,
      },
    });
    const deletedCourse = await prisma.course.create({
      data: {
        slug: `${token}-deleted-course`,
        title: `${token} Deleted Course`,
        instructor: "Deleted Instructor",
        description: "Should never appear because it is deleted.",
        category: "TECHNOLOGY",
        status: CourseStatus.PUBLISHED,
        deletedAt: new Date(),
      },
    });
    createdCourseIds.push(
      titleCourse.id,
      descriptionCourse.id,
      businessCourse.id,
      draftCourse.id,
      deletedCourse.id,
    );

    // Nullable speaker/organizer/location: the pre-fix event search wrapped
    // these in COALESCE(col, ''), which prevented Postgres from using the
    // trigram index at all. This row exercises that path.
    const speakerEvent = await prisma.event.create({
      data: {
        slug: `${token}-speaker-event`,
        title: "Unrelated Event Title",
        type: "WORKSHOP",
        deliveryMode: "LIVE_ONLINE",
        category: "TECHNOLOGY",
        status: EventStatus.PUBLISHED,
        speaker: `${token} Speaker`,
        description: "An event description.",
        startDate: new Date("2031-01-01T10:00:00.000Z"),
        isFree: true,
      },
    });
    createdEventIds.push(speakerEvent.id);

    const podcast = await prisma.podcast.create({
      data: {
        slug: `${token}-podcast`,
        title: `${token} Podcast`,
        host: "Podcast Host",
        description: "A podcast description.",
        category: "AI",
        status: PodcastStatus.PUBLISHED,
      },
    });
    createdPodcastIds.push(podcast.id);

    const channel = await prisma.youTubeChannel.create({
      data: {
        slug: `${token}-channel`,
        title: `${token} Channel`,
        provider: "Some Provider",
        description: "A channel description.",
        category: "DATA",
        status: YouTubeChannelStatus.PUBLISHED,
      },
    });
    createdChannelIds.push(channel.id);
  }, 120_000);

  afterAll(async () => {
    if (prisma) {
      await prisma.course.deleteMany({ where: { id: { in: createdCourseIds } } });
      await prisma.event.deleteMany({ where: { id: { in: createdEventIds } } });
      await prisma.podcast.deleteMany({
        where: { id: { in: createdPodcastIds } },
      });
      await prisma.youTubeChannel.deleteMany({
        where: { id: { in: createdChannelIds } },
      });
    }
    await app?.close();
  }, 60_000);

  const query = (document: string, variables: Record<string, unknown>) =>
    request(app.getHttpServer())
      .post("/graphql")
      .send({ query: document, variables });

  it("finds a title match and a description-only match for the same term", async () => {
    const response = await query(COURSES_SEARCH, {
      filter: { search: token },
      pagination: { take: 20 },
    });

    const slugs: string[] = response.body.data.courses.items.map(
      (item: { slug: string }) => item.slug,
    );
    expect(slugs).toContain(`${token}-title-course`);
    expect(slugs).toContain(`${token}-description-course`);
    expect(slugs).toContain(`${token}-business-course`);
  });

  it("ranks a title match above a description-only match", async () => {
    const response = await query(COURSES_SEARCH, {
      filter: { search: token },
      pagination: { take: 20 },
    });

    const slugs: string[] = response.body.data.courses.items.map(
      (item: { slug: string }) => item.slug,
    );
    const titleIndex = slugs.indexOf(`${token}-title-course`);
    const descriptionIndex = slugs.indexOf(`${token}-description-course`);
    expect(titleIndex).toBeGreaterThanOrEqual(0);
    expect(descriptionIndex).toBeGreaterThanOrEqual(0);
    expect(titleIndex).toBeLessThan(descriptionIndex);
  });

  it("excludes draft and deleted rows even when they match", async () => {
    const response = await query(COURSES_SEARCH, {
      filter: { search: token },
      pagination: { take: 20 },
    });

    const slugs: string[] = response.body.data.courses.items.map(
      (item: { slug: string }) => item.slug,
    );
    expect(slugs).not.toContain(`${token}-draft-course`);
    expect(slugs).not.toContain(`${token}-deleted-course`);
  });

  it("combines search with a category filter", async () => {
    const response = await query(COURSES_SEARCH, {
      filter: { search: token, category: "BUSINESS" },
      pagination: { take: 20 },
    });

    const items: Array<{ slug: string; category: string }> =
      response.body.data.courses.items;
    expect(items.every((item) => item.category === "BUSINESS")).toBe(true);
    expect(items.some((item) => item.slug === `${token}-business-course`)).toBe(
      true,
    );
    expect(
      items.some((item) => item.slug === `${token}-title-course`),
    ).toBe(false);
  });

  it("reports an accurate totalCount and a working hasNextPage flag", async () => {
    const firstPage = await query(COURSES_SEARCH, {
      filter: { search: token },
      pagination: { take: 2 },
    });

    const page = firstPage.body.data.courses;
    expect(page.totalCount).toBeGreaterThanOrEqual(3);
    expect(page.items.length).toBe(2);
    expect(page.pageInfo.hasNextPage).toBe(true);
    expect(page.pageInfo.nextCursor).toBeTruthy();

    // NOTE: this endpoint's cursor is a plain `id > cursor` keyset filter,
    // but result order is by rank, not id — a pre-existing mismatch (present
    // in the code before this performance fix, unchanged by it) that can
    // duplicate or skip rows once a search paginates past the first page.
    // Not in scope here; flagged for a follow-up fix to pagination-during-
    // search specifically.
    const secondPage = await query(COURSES_SEARCH, {
      filter: { search: token },
      pagination: { take: 20, cursor: page.pageInfo.nextCursor },
    });
    expect(secondPage.body.errors).toBeUndefined();
    expect(Array.isArray(secondPage.body.data.courses.items)).toBe(true);
  });

  it("falls back to the unsearched list path below the minimum term length", async () => {
    const response = await query(COURSES_SEARCH, {
      filter: { search: "a" },
      pagination: { take: 5 },
    });
    expect(response.body.errors).toBeUndefined();
    expect(Array.isArray(response.body.data.courses.items)).toBe(true);
  });

  it("finds an event by a nullable speaker column (no longer COALESCE-wrapped)", async () => {
    const response = await query(EVENTS_SEARCH, {
      filter: { search: token },
      pagination: { take: 20 },
    });

    expect(response.body.errors).toBeUndefined();
    const slugs: string[] = response.body.data.events.items.map(
      (item: { slug: string }) => item.slug,
    );
    expect(slugs).toContain(`${token}-speaker-event`);
    expect(response.body.data.events.totalCount).toBeGreaterThanOrEqual(1);
  });

  it("finds a podcast by title (the previously non-indexable fuzzy branch)", async () => {
    const response = await query(PODCASTS_SEARCH, {
      filter: { search: token },
      pagination: { take: 20 },
    });

    expect(response.body.errors).toBeUndefined();
    const slugs: string[] = response.body.data.podcasts.items.map(
      (item: { slug: string }) => item.slug,
    );
    expect(slugs).toContain(`${token}-podcast`);
    expect(response.body.data.podcasts.totalCount).toBeGreaterThanOrEqual(1);
  });

  it("finds a youtube channel by title (the previously non-indexable fuzzy branch)", async () => {
    const response = await query(YOUTUBE_SEARCH, {
      filter: { search: token },
      pagination: { take: 20 },
    });

    expect(response.body.errors).toBeUndefined();
    const slugs: string[] = response.body.data.youtubeChannels.items.map(
      (item: { slug: string }) => item.slug,
    );
    expect(slugs).toContain(`${token}-channel`);
    expect(response.body.data.youtubeChannels.totalCount).toBeGreaterThanOrEqual(
      1,
    );
  });
});
