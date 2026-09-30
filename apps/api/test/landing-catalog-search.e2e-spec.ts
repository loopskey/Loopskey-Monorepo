import { INestApplication, ValidationPipe } from "@nestjs/common";
import { CourseStatus, EventStatus } from "@prisma/client";
import { PodcastStatus, YouTubeChannelStatus } from "@prisma/client";
import { PrismaService } from "@prisma/prisma.service";
import { Test } from "@nestjs/testing";
import { AppModule } from "@app/app.module";

import cookieParser from "cookie-parser";
import request from "supertest";

const LANDING_CATALOG_SEARCH = `
  query LandingCatalogSearch($input: LandingCatalogSearchInput!) {
    landingCatalogSearch(input: $input) {
      id
      contentType
      slug
      title
      imageUrl
      category
      rating
      durationMinutes
      startDate
      episodeCount
      videoCount
    }
  }
`;

describe("Landing catalogue search (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const token = `zzqxlanding${Date.now()}`;
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

    const publishedCourse = await prisma.course.create({
      data: {
        slug: `${token}-title-course`,
        title: `${token} Fundamentals`,
        instructor: "Course Instructor",
        description: "A course about unrelated topics.",
        category: "TECHNOLOGY",
        status: CourseStatus.PUBLISHED,
      },
    });
    const descriptionOnlyCourse = await prisma.course.create({
      data: {
        slug: `${token}-description-course`,
        title: "Unrelated Advanced Topics",
        instructor: "Another Instructor",
        description: `This course mentions ${token} only in its description.`,
        category: "TECHNOLOGY",
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
      publishedCourse.id,
      descriptionOnlyCourse.id,
      draftCourse.id,
      deletedCourse.id,
    );

    const event = await prisma.event.create({
      data: {
        slug: `${token}-event`,
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
    createdEventIds.push(event.id);

    const podcast = await prisma.podcast.create({
      data: {
        slug: `${token}-podcast`,
        title: "Unrelated Podcast Title",
        host: `${token} Host`,
        description: "A podcast description.",
        category: "AI",
        status: PodcastStatus.PUBLISHED,
      },
    });
    createdPodcastIds.push(podcast.id);

    const channel = await prisma.youTubeChannel.create({
      data: {
        slug: `${token}-channel`,
        title: "Unrelated Channel Title",
        provider: `${token} Provider`,
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

  const search = (input: Record<string, unknown>) =>
    request(app.getHttpServer())
      .post("/graphql")
      .send({ query: LANDING_CATALOG_SEARCH, variables: { input } });

  it("returns globally ranked results across every published content kind", async () => {
    const response = await search({ search: token, take: 20 });

    const items = response.body.data.landingCatalogSearch;
    const contentTypes = items.map((item: { contentType: string }) => item.contentType);
    expect(contentTypes).toEqual(
      expect.arrayContaining(["COURSE", "EVENT", "PODCAST", "YOUTUBE"]),
    );
    expect(items.length).toBeLessThanOrEqual(20);
  });

  it("ranks an exact title match above an exact description-only match", async () => {
    const response = await search({ search: token, take: 20 });
    const items: Array<{ slug: string }> = response.body.data.landingCatalogSearch;

    const titleIndex = items.findIndex((item) => item.slug === `${token}-title-course`);
    const descriptionIndex = items.findIndex(
      (item) => item.slug === `${token}-description-course`,
    );

    expect(titleIndex).toBeGreaterThanOrEqual(0);
    expect(descriptionIndex).toBeGreaterThanOrEqual(0);
    expect(titleIndex).toBeLessThan(descriptionIndex);
  });

  it("excludes draft and deleted rows even when they match", async () => {
    const response = await search({ search: token, take: 20 });
    const slugs: string[] = response.body.data.landingCatalogSearch.map(
      (item: { slug: string }) => item.slug,
    );

    expect(slugs).not.toContain(`${token}-draft-course`);
    expect(slugs).not.toContain(`${token}-deleted-course`);
  });

  it("restricts results to the requested content kind", async () => {
    const response = await search({
      search: token,
      take: 20,
      contentType: "COURSE",
    });

    const items: Array<{ contentType: string }> = response.body.data.landingCatalogSearch;
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((item) => item.contentType === "COURSE")).toBe(true);
  });

  it("rejects a search term shorter than three characters", async () => {
    const response = await search({ search: "ab" });
    expect(response.body.errors).toBeDefined();
    expect(response.body.data).toBeFalsy();
  });

  it("rejects a take above the maximum bound", async () => {
    const response = await search({ search: token, take: 50 });
    expect(response.body.errors).toBeDefined();
  });

  it("does not expose a totalCount field", async () => {
    const response = await request(app.getHttpServer())
      .post("/graphql")
      .send({
        query: `query { landingCatalogSearch(input: { search: "${token}" }) { id totalCount } }`,
      });

    expect(response.body.errors).toBeDefined();
  });
});
