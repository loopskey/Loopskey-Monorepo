import {
  ContentUrlNamespace,
  IngestionContentKind,
  Role,
} from "@prisma/client";
import { SecurityApp, bootSecurityApp } from "./setup/security";
import { openSession, signAccessToken } from "./setup/access-token";
import { CourseImportService } from "@course/services/course-import.service";
import { CourseService } from "@course/services/course.service";
import { EventService } from "@events/services/event.service";
import { PodcastService } from "@podcast/services/podcast.service";
import { UserStatus } from "@prisma/client";
import { YouTubeService } from "@youtube/services/youtbue.service";
import { slugify } from "@utils/slug.util";

import * as ExcelJS from "exceljs";
import request from "supertest";

const PREFIX = `url09path${Date.now().toString(36)}`;
const IMPORT_SOURCE = "URL09_IMPORT";
const CONTRACT_VERSION = "1.0";

const unique = () =>
  `${process.pid.toString(36)}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

const PROVENANCE_MAP = {
  platform: "sourcePlatform",
  lang: "language",
  raw_cat: "rawCategory",
  crawled: "crawledAt",
  updated: "lastUpdatedAt",
};

const PROVENANCE_ITEM = {
  platform: "COURSERA",
  lang: "en",
  raw_cat: "Data",
  crawled: "2026-09-01T10:00:00.000Z",
  updated: "2026-08-20T08:30:00.000Z",
};

const INGESTION = {
  [IngestionContentKind.COURSE]: {
    route: "course",
    namespace: ContentUrlNamespace.COURSE,
    fieldMap: {
      external_id: "externalId",
      url: "canonicalUrl",
      name: "title",
      summary: "description",
      teacher: "instructor",
      cat: "category",
      lvl: "level",
      ...PROVENANCE_MAP,
    },
    item: {
      url: "https://example.com/c",
      name: "Retired Path Course",
      summary: "Crawled course.",
      teacher: "Ada",
      cat: "TECHNOLOGY",
      lvl: "BEGINNER",
    },
  },
  [IngestionContentKind.EVENT]: {
    route: "event",
    namespace: ContentUrlNamespace.EVENT,
    fieldMap: {
      external_id: "externalId",
      url: "canonicalUrl",
      name: "title",
      summary: "description",
      starts_at: "startDate",
      tz: "timezone",
      ...PROVENANCE_MAP,
    },
    item: {
      url: "https://example.com/e",
      name: "Retired Path Event",
      summary: "Crawled event.",
      starts_at: "2026-05-01T09:00:00.000Z",
      tz: "UTC",
    },
  },
  [IngestionContentKind.PODCAST]: {
    route: "podcast",
    namespace: ContentUrlNamespace.PODCAST,
    fieldMap: {
      external_id: "externalId",
      url: "canonicalUrl",
      name: "title",
      summary: "description",
      presenter: "host",
      ...PROVENANCE_MAP,
    },
    item: {
      url: "https://example.com/p",
      name: "Retired Path Podcast",
      summary: "Crawled podcast.",
      presenter: "Ada",
    },
  },
  [IngestionContentKind.YOUTUBE]: {
    route: "youtube",
    namespace: ContentUrlNamespace.YOUTUBE,
    fieldMap: {
      external_id: "externalId",
      url: "canonicalUrl",
      name: "title",
      channel_url: "channelUrl",
      ...PROVENANCE_MAP,
    },
    item: {
      url: "https://example.com/y",
      name: "Retired Path Channel",
      channel_url: "https://youtube.com/@retired",
    },
  },
} as const;

const IMPORT_HEADERS = [
  "externalCourseId",
  "title",
  "category",
  "level",
  "instructor",
  "price",
  "duration",
  "isFree",
  "rating",
  "currency",
  "sourceUrl",
  "imageUrl",
  "description",
  "rawCategory",
  "rawLevel",
  "lastUpdatedAt",
  "requirements",
  "learnings",
  "ratingCount",
  "professionals",
];

describe("Content slug claims on creation paths (e2e)", () => {
  let ctx: SecurityApp;
  let adminToken: string;
  const adminIds: string[] = [];
  const retiredClaimIds: string[] = [];

  const retire = async (namespace: ContentUrlNamespace, slug: string) => {
    const claim = await ctx.prisma.contentUrlClaim.create({
      data: {
        namespace,
        slug,
        targetId: `${PREFIX}-gone-${unique()}`,
        isCurrent: false,
        retiredAt: new Date(),
      },
    });
    retiredClaimIds.push(claim.id);
    return claim;
  };

  const stillOwnedBy = async (claimId: string, targetId: string) =>
    (
      await ctx.prisma.contentUrlClaim.findUniqueOrThrow({
        where: { id: claimId },
      })
    ).targetId === targetId;

  const issueKey = async (sourceId: string) => {
    const response = await request(ctx.app.getHttpServer())
      .post("/graphql")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        query: `mutation {
          issueIngestionApiKey(input: { sourceId: "${sourceId}", name: "e2e" }) {
            credential
          }
        }`,
      });
    return response.body.data.issueIngestionApiKey.credential as string;
  };

  const cleanup = async () => {
    const sources = await ctx.prisma.ingestionSource.findMany({
      where: { slug: { startsWith: PREFIX } },
      select: { id: true },
    });
    const sourceIds = sources.map((source) => source.id);
    const items = await ctx.prisma.ingestionItem.findMany({
      where: { sourceId: { in: sourceIds } },
      select: { catalogId: true },
    });
    const catalogIds = items.flatMap((item) =>
      item.catalogId ? [item.catalogId] : [],
    );
    await ctx.prisma.course.deleteMany({
      where: {
        OR: [
          { id: { in: catalogIds } },
          { title: { startsWith: PREFIX } },
          { externalRef: { startsWith: `${IMPORT_SOURCE}:` } },
        ],
      },
    });
    await ctx.prisma.event.deleteMany({
      where: {
        OR: [{ id: { in: catalogIds } }, { title: { startsWith: PREFIX } }],
      },
    });
    await ctx.prisma.podcast.deleteMany({
      where: {
        OR: [{ id: { in: catalogIds } }, { title: { startsWith: PREFIX } }],
      },
    });
    await ctx.prisma.youTubeChannel.deleteMany({
      where: {
        OR: [{ id: { in: catalogIds } }, { title: { startsWith: PREFIX } }],
      },
    });
    await ctx.prisma.ingestionSource.deleteMany({
      where: { id: { in: sourceIds } },
    });
    await ctx.prisma.contentUrlClaim.deleteMany({
      where: {
        OR: [
          { id: { in: retiredClaimIds } },
          { slug: { startsWith: PREFIX } },
          { slug: { startsWith: slugify(IMPORT_SOURCE) } },
        ],
      },
    });
    await ctx.prisma.authSession.deleteMany({
      where: { userId: { in: adminIds } },
    });
    await ctx.prisma.user.deleteMany({ where: { id: { in: adminIds } } });
  };

  beforeAll(async () => {
    ctx = await bootSecurityApp();
    const email = `admin-${PREFIX}@content-url.e2e.test`;
    const admin = await ctx.prisma.user.create({
      data: { email, role: Role.ADMIN, status: UserStatus.ACTIVE },
    });
    adminIds.push(admin.id);
    await openSession(ctx.prisma, admin.id);
    adminToken = signAccessToken(admin.id, email, Role.ADMIN);
  }, 120_000);

  afterAll(async () => {
    if (ctx) await cleanup();
    await ctx?.app.close();
  }, 60_000);

  describe("management creation", () => {
    const requester = () => ({ id: adminIds[0], role: Role.ADMIN });

    const creators = [
      {
        namespace: ContentUrlNamespace.COURSE,
        create: (title: string) =>
          ctx.app.get(CourseService).createCourse(
            {
              title,
              instructor: "Instructor",
              description: "Description",
              category: "TECHNOLOGY",
            } as never,
            requester(),
          ),
        rename: (id: string, slug: string) =>
          ctx.prisma.course.update({ where: { id }, data: { slug } }),
      },
      {
        namespace: ContentUrlNamespace.EVENT,
        create: (title: string) =>
          ctx.app.get(EventService).createEvent(
            {
              title,
              description: "Description",
              type: "WORKSHOP",
              deliveryMode: "LIVE_ONLINE",
              category: "TECHNOLOGY",
              startDate: new Date("2031-03-01T10:00:00.000Z"),
            } as never,
            requester(),
          ),
        rename: (id: string, slug: string) =>
          ctx.prisma.event.update({ where: { id }, data: { slug } }),
      },
      {
        namespace: ContentUrlNamespace.PODCAST,
        create: (title: string) =>
          ctx.app.get(PodcastService).createPodcast(
            {
              title,
              host: "Host",
              description: "Description",
              category: "TECHNOLOGY",
            } as never,
            requester(),
          ),
        rename: (id: string, slug: string) =>
          ctx.prisma.podcast.update({ where: { id }, data: { slug } }),
      },
      {
        namespace: ContentUrlNamespace.YOUTUBE,
        create: (title: string) =>
          ctx.app.get(YouTubeService).createChannel(
            {
              title,
              category: "TECHNOLOGY",
            } as never,
            requester(),
          ),
        rename: (id: string, slug: string) =>
          ctx.prisma.youTubeChannel.update({ where: { id }, data: { slug } }),
      },
    ];

    it.each(creators.map((creator) => [creator.namespace, creator] as const))(
      "%s: a new record skips a slug another record retired",
      async (_namespace, creator) => {
        const title = `${PREFIX} management ${unique()}`;
        const first = await creator.create(title);
        const original = first.slug;
        await creator.rename(first.id, `${original}-renamed`);

        const second = await creator.create(title);
        expect(second.slug).not.toBe(original);
        expect(second.slug.startsWith(original)).toBe(true);
        const claim = await ctx.prisma.contentUrlClaim.findUniqueOrThrow({
          where: {
            namespace_slug: { namespace: creator.namespace, slug: original },
          },
        });
        expect(claim.targetId).toBe(first.id);
        expect(claim.isCurrent).toBe(false);
      },
    );
  });

  describe("ingestion", () => {
    it.each(Object.entries(INGESTION))(
      "%s: a crawled item never takes a retired slug",
      async (kind, config) => {
        const source = await ctx.prisma.ingestionSource.create({
          data: {
            slug: `${PREFIX}-${config.route}-${unique()}`,
            name: `${kind} source`,
            kind: kind as IngestionContentKind,
            autoPublish: false,
            fieldMap: config.fieldMap,
          },
        });
        const externalId = `ext-${unique()}`;
        const candidate = slugify(`${source.slug}-${externalId}`);
        const tombstone = await retire(config.namespace, candidate);

        const response = await request(ctx.app.getHttpServer())
          .post(`/v1/ingest/${config.route}/batches`)
          .set("Idempotency-Key", `idem-${unique()}`)
          .set("Authorization", `Bearer ${await issueKey(source.id)}`)
          .send({
            contractVersion: CONTRACT_VERSION,
            kind,
            mode: "INCREMENTAL",
            items: [
              { external_id: externalId, ...config.item, ...PROVENANCE_ITEM },
            ],
          });
        expect(response.status).toBe(201);
        expect(response.body.createdCount).toBe(1);

        const catalogId = response.body.items[0].catalogId as string;
        const claim = await ctx.prisma.contentUrlClaim.findFirstOrThrow({
          where: {
            namespace: config.namespace,
            targetId: catalogId,
            isCurrent: true,
          },
        });
        expect(claim.slug).not.toBe(candidate);
        expect(claim.slug.startsWith(candidate)).toBe(true);
        expect(await stillOwnedBy(tombstone.id, tombstone.targetId)).toBe(true);
      },
      120_000,
    );
  });

  describe("course import", () => {
    it("never takes a retired slug and still creates the course", async () => {
      const externalCourseId = `ext-${unique()}`;
      const candidate = slugify(
        `${slugify(IMPORT_SOURCE)}-${externalCourseId}`,
      );
      const tombstone = await retire(ContentUrlNamespace.COURSE, candidate);

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("courses");
      worksheet.addRow(IMPORT_HEADERS);
      const values: Record<string, string> = {
        externalCourseId,
        title: `${PREFIX} imported`,
        description: "Imported description.",
        instructor: "Importer",
      };
      worksheet.addRow(IMPORT_HEADERS.map((header) => values[header] ?? ""));
      const file = {
        buffer: Buffer.from(await workbook.xlsx.writeBuffer()),
      } as Express.Multer.File;

      const result = await ctx.app
        .get(CourseImportService)
        .importCoursesFromExcel(
          file,
          { id: adminIds[0], role: Role.ADMIN },
          { defaultSourcePlatform: IMPORT_SOURCE },
        );
      expect(result).toMatchObject({ created: 1, failed: 0 });

      const course = await ctx.prisma.course.findFirstOrThrow({
        where: { externalRef: `${IMPORT_SOURCE}:${externalCourseId}` },
      });
      expect(course.slug).not.toBe(candidate);
      expect(course.slug.startsWith(candidate)).toBe(true);
      expect(await stillOwnedBy(tombstone.id, tombstone.targetId)).toBe(true);
    });
  });
});
