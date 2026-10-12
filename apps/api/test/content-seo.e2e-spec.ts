import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AppLanguage, ContentType, Role, UserStatus } from "@prisma/client";
import { CourseStatus, EventStatus } from "@prisma/client";
import { IngestionContentKind } from "@prisma/client";
import { PodcastStatus, YouTubeChannelStatus } from "@prisma/client";
import { AppModule } from "@app/app.module";
import { PrismaService } from "@prisma/prisma.service";
import { OBJECT_STORAGE } from "@infrastructure/storage/object-storage.port";
import { runTogether } from "./setup/concurrency";

import type { ObjectStoragePort } from "@infrastructure/storage/object-storage.port";

import cookieParser from "cookie-parser";
import request from "supertest";
import { openSession, signAccessToken as sign } from "./setup/access-token";

const token = `seo08${Date.now().toString(36)}`;

const PNG_1X1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

type Kind = "course" | "event" | "podcast" | "youtube";

type KindConfig = {
  kind: Kind;
  contentType: ContentType;
  seoQuery: string;
  idArg: string;
  saveMutation: string;
  exclusionMutation: string;
  bySlug: string;
  create: (
    index: number,
    providerId: string | null,
  ) => Promise<{ id: string; slug: string }>;
  status: (id: string) => Promise<string>;
};

const SETTINGS_FIELDS = `excludeFromIndex locales {
  locale version seoTitle seoDescription socialImageId socialImagePath
  socialImageAlt defaultTitle defaultDescription
}`;

describe("Editorial SEO controls (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let storage: ObjectStoragePort;
  let ownerId: string;
  let strangerId: string;
  let adminId: string;
  let ownerToken: string;
  let strangerToken: string;
  let adminToken: string;
  let professionalToken: string;
  let sequence = 0;
  const createdUsers: string[] = [];

  const gql = (
    query: string,
    variables: Record<string, unknown>,
    bearer?: string,
  ) => {
    const req = request(app.getHttpServer()).post("/graphql");
    if (bearer) req.set("Authorization", `Bearer ${bearer}`);
    return req.send({ query, variables }).expect(200);
  };

  const makeUser = async (role: Role, name: string) => {
    const email = `${name}-${token}@content-seo.e2e.test`;
    const user = await prisma.user.create({
      data: { email, role, status: UserStatus.ACTIVE },
    });
    createdUsers.push(user.id);
    await openSession(prisma, user.id);
    return { id: user.id, token: sign(user.id, email, role) };
  };

  const slugOf = (name: string) => `${token}-${name}-${(sequence += 1)}`;

  const configs = (): KindConfig[] => [
    {
      kind: "course",
      contentType: ContentType.COURSE,
      seoQuery: "courseSeo",
      idArg: "courseId",
      saveMutation: "saveCourseSeo",
      exclusionMutation: "setCourseIndexExclusion",
      bySlug: "courseBySlug",
      create: (index, providerId) =>
        prisma.course.create({
          data: {
            slug: slugOf(`course-${index}`),
            title: `${token} course ${index}`,
            instructor: "Instructor",
            description: "Generated course description",
            category: "TECHNOLOGY",
            status: CourseStatus.PUBLISHED,
            providerId,
            sourceLanguage: "en",
          },
        }),
      status: async (id) =>
        (await prisma.course.findUniqueOrThrow({ where: { id } })).status,
    },
    {
      kind: "event",
      contentType: ContentType.EVENT,
      seoQuery: "eventSeo",
      idArg: "eventId",
      saveMutation: "saveEventSeo",
      exclusionMutation: "setEventIndexExclusion",
      bySlug: "eventBySlug",
      create: (index, providerId) =>
        prisma.event.create({
          data: {
            slug: slugOf(`event-${index}`),
            title: `${token} event ${index}`,
            type: "WORKSHOP",
            deliveryMode: "LIVE_ONLINE",
            category: "TECHNOLOGY",
            description: "Generated event description",
            startDate: new Date("2031-03-01T10:00:00.000Z"),
            isFree: true,
            status: EventStatus.PUBLISHED,
            providerId,
            sourceLanguage: "en",
          },
        }),
      status: async (id) =>
        (await prisma.event.findUniqueOrThrow({ where: { id } })).status,
    },
    {
      kind: "podcast",
      contentType: ContentType.PODCAST,
      seoQuery: "podcastSeo",
      idArg: "podcastId",
      saveMutation: "savePodcastSeo",
      exclusionMutation: "setPodcastIndexExclusion",
      bySlug: "podcastBySlug",
      create: (index, providerId) =>
        prisma.podcast.create({
          data: {
            slug: slugOf(`podcast-${index}`),
            title: `${token} podcast ${index}`,
            host: "Host",
            description: "Generated podcast description",
            category: "AI",
            status: PodcastStatus.PUBLISHED,
            providerId,
            sourceLanguage: "en",
          },
        }),
      status: async (id) =>
        (await prisma.podcast.findUniqueOrThrow({ where: { id } })).status,
    },
    {
      kind: "youtube",
      contentType: ContentType.YOUTUBE,
      seoQuery: "youtubeChannelSeo",
      idArg: "channelId",
      saveMutation: "saveYouTubeChannelSeo",
      exclusionMutation: "setYouTubeChannelIndexExclusion",
      bySlug: "youtubeChannelBySlug",
      create: (index, providerId) =>
        prisma.youTubeChannel.create({
          data: {
            slug: slugOf(`channel-${index}`),
            title: `${token} channel ${index}`,
            provider: "Provider",
            description: "Generated channel description",
            category: "DATA",
            status: YouTubeChannelStatus.PUBLISHED,
            providerId,
            sourceLanguage: "en",
          },
        }),
      status: async (id) =>
        (await prisma.youTubeChannel.findUniqueOrThrow({ where: { id } }))
          .status,
    },
  ];

  const readSettings = (config: KindConfig, id: string, bearer = ownerToken) =>
    gql(
      `query Seo($id: String!) { ${config.seoQuery}(${config.idArg}: $id) { ${SETTINGS_FIELDS} } }`,
      { id },
      bearer,
    );

  const saveSeo = (
    config: KindConfig,
    id: string,
    input: Record<string, unknown>,
    bearer = ownerToken,
  ) =>
    gql(
      `mutation Save($input: SaveContentSeoInput!) {
        ${config.saveMutation}(input: $input) { ${SETTINGS_FIELDS} }
      }`,
      { input: { contentId: id, locale: "EN", ...input } },
      bearer,
    );

  const setExclusion = (
    config: KindConfig,
    id: string,
    excluded: boolean,
    bearer = adminToken,
  ) =>
    gql(
      `mutation Exclude($input: SetContentIndexExclusionInput!) {
        ${config.exclusionMutation}(input: $input) { ${SETTINGS_FIELDS} }
      }`,
      { input: { contentId: id, excluded } },
      bearer,
    );

  const publicRead = (config: KindConfig, slug: string, locale = "EN") =>
    gql(
      `query Read($slug: String!, $locale: AppLanguage) {
        ${config.bySlug}(slug: $slug, locale: $locale) {
          id title description seoTitle seoDescription socialImagePath
          socialImageAlt excludeFromIndex contentLanguage availableLocales
        }
      }`,
      { slug, locale },
    );

  const localeRow = (
    response: request.Response,
    mutation: string,
    locale = "EN",
  ) =>
    response.body.data[mutation].locales.find(
      (row: { locale: string }) => row.locale === locale,
    );

  const errorCode = (response: request.Response) =>
    response.body.errors?.[0]?.extensions?.code as string | undefined;

  const upload = (
    bearer: string | null,
    file: { data: Buffer; name: string; type: string },
  ) => {
    const req = request(app.getHttpServer()).post("/content-social-image");
    if (bearer) req.set("Authorization", `Bearer ${bearer}`);
    return req.attach("file", file.data, {
      filename: file.name,
      contentType: file.type,
    });
  };

  const uploadPng = async (bearer: string) => {
    const response = await upload(bearer, {
      data: PNG_1X1,
      name: "card.png",
      type: "image/png",
    });
    expect(response.status).toBe(201);
    return response.body as { id: string; path: string };
  };

  const shardSlugs = async (kind: ContentType) => {
    const shards = await gql(
      `query { publicUrlShards { kind shards { startCursor endCursor } } }`,
      {},
    );
    const set = shards.body.data.publicUrlShards.find(
      (candidate: { kind: string }) => candidate.kind === kind,
    );
    const slugs: string[] = [];
    for (const shard of set.shards) {
      let after: string | null = null;
      for (let guard = 0; guard < 100; guard += 1) {
        const page = await gql(
          `query P($input: PublicUrlPageInput!) {
            publicUrlPage(input: $input) { hasNextPage nextCursor items { slug } }
          }`,
          {
            input: {
              kind,
              take: 500,
              after,
              startCursor: shard.startCursor,
              endCursor: shard.endCursor,
            },
          },
        );
        const result = page.body.data.publicUrlPage;
        slugs.push(...result.items.map((item: { slug: string }) => item.slug));
        if (!result.hasNextPage) break;
        after = result.nextCursor;
      }
    }
    return slugs;
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
    storage = app.get<ObjectStoragePort>(OBJECT_STORAGE, { strict: false });

    const owner = await makeUser(Role.PROVIDER, "owner");
    const stranger = await makeUser(Role.PROVIDER, "stranger");
    const admin = await makeUser(Role.ADMIN, "admin");
    const professional = await makeUser(Role.PROFESSIONAL, "professional");
    ({ id: ownerId, token: ownerToken } = owner);
    ({ id: strangerId, token: strangerToken } = stranger);
    ({ id: adminId, token: adminToken } = admin);
    professionalToken = professional.token;
  }, 120_000);

  afterAll(async () => {
    if (prisma) {
      const sources = await prisma.ingestionSource.findMany({
        where: { slug: { startsWith: token } },
        select: { id: true },
      });
      const items = await prisma.ingestionItem.findMany({
        where: { sourceId: { in: sources.map((source) => source.id) } },
        select: { catalogId: true },
      });
      await prisma.course.deleteMany({
        where: {
          OR: [
            { slug: { startsWith: token } },
            { id: { in: items.flatMap((item) => item.catalogId ?? []) } },
          ],
        },
      });
      await prisma.event.deleteMany({ where: { slug: { startsWith: token } } });
      await prisma.podcast.deleteMany({
        where: { slug: { startsWith: token } },
      });
      await prisma.youTubeChannel.deleteMany({
        where: { slug: { startsWith: token } },
      });
      await prisma.ingestionSource.deleteMany({
        where: { id: { in: sources.map((source) => source.id) } },
      });
      const images = await prisma.contentSocialImage.findMany({
        where: { ownerId: { in: createdUsers } },
        select: { id: true, storageKey: true },
      });
      for (const image of images)
        await storage.remove("content", image.storageKey);
      await prisma.contentSocialImage.deleteMany({
        where: { id: { in: images.map((image) => image.id) } },
      });
      await prisma.auditLog.deleteMany({
        where: { actorId: { in: createdUsers } },
      });
      await prisma.user.deleteMany({ where: { id: { in: createdUsers } } });
    }
    await app?.close();
  }, 60_000);

  it("keeps the test accounts distinct", () => {
    expect(new Set([ownerId, strangerId, adminId]).size).toBe(3);
  });

  describe.each(["course", "event", "podcast", "youtube"] as Kind[])(
    "%s",
    (kind) => {
      const config = () =>
        configs().find((candidate) => candidate.kind === kind)!;

      it("shows generated defaults and no overrides for an existing row", async () => {
        const subject = config();
        const row = await subject.create(1, ownerId);

        const settings = await readSettings(subject, row.id);
        const data = settings.body.data[subject.seoQuery];
        expect(data.excludeFromIndex).toBe(false);
        expect(data.locales).toHaveLength(2);
        expect(data.locales[0]).toMatchObject({
          locale: "EN",
          version: 0,
          seoTitle: null,
          seoDescription: null,
          socialImagePath: null,
          defaultTitle: `${token} ${kind === "youtube" ? "channel" : kind} 1`,
        });

        const publicView = await publicRead(subject, row.slug);
        expect(publicView.body.data[subject.bySlug]).toMatchObject({
          seoTitle: null,
          seoDescription: null,
          socialImagePath: null,
          excludeFromIndex: false,
        });
      });

      it("saves, keeps what the input omits, and clears with null or a blank value", async () => {
        const subject = config();
        const row = await subject.create(2, ownerId);

        const first = await saveSeo(subject, row.id, {
          seoTitle: "  Search   title  ",
          seoDescription: "A short search description",
        });
        expect(localeRow(first, subject.saveMutation)).toMatchObject({
          version: 1,
          seoTitle: "Search title",
          seoDescription: "A short search description",
        });

        const publicView = await publicRead(subject, row.slug);
        expect(publicView.body.data[subject.bySlug]).toMatchObject({
          title: `${token} ${kind === "youtube" ? "channel" : kind} 2`,
          seoTitle: "Search title",
          seoDescription: "A short search description",
        });

        const omitted = await saveSeo(subject, row.id, {
          seoDescription: "Changed description",
          expectedVersion: 1,
        });
        expect(localeRow(omitted, subject.saveMutation)).toMatchObject({
          version: 2,
          seoTitle: "Search title",
          seoDescription: "Changed description",
        });

        const nulled = await saveSeo(subject, row.id, {
          seoTitle: null,
          expectedVersion: 2,
        });
        expect(localeRow(nulled, subject.saveMutation)).toMatchObject({
          version: 3,
          seoTitle: null,
          seoDescription: "Changed description",
        });

        const blank = await saveSeo(subject, row.id, {
          seoDescription: "   ",
          expectedVersion: 3,
        });
        expect(localeRow(blank, subject.saveMutation)).toMatchObject({
          version: 4,
          seoTitle: null,
          seoDescription: null,
        });

        const unchanged = await saveSeo(subject, row.id, {
          seoDescription: null,
          expectedVersion: 4,
        });
        expect(localeRow(unchanged, subject.saveMutation).version).toBe(4);

        const reverted = await publicRead(subject, row.slug);
        expect(reverted.body.data[subject.bySlug]).toMatchObject({
          seoTitle: null,
          seoDescription: null,
        });
      });

      it("keeps each locale's override apart", async () => {
        const subject = config();
        const row = await subject.create(3, ownerId);
        await saveSeo(subject, row.id, { seoTitle: "English title" });
        await saveSeo(subject, row.id, {
          locale: "FR",
          seoTitle: "Titre français",
        });

        const english = await publicRead(subject, row.slug, "EN");
        const french = await publicRead(subject, row.slug, "FR");
        expect(english.body.data[subject.bySlug].seoTitle).toBe(
          "English title",
        );
        expect(french.body.data[subject.bySlug].seoTitle).toBe(
          "Titre français",
        );
      });

      it("rejects oversize fields, and a canonical or robots input", async () => {
        const subject = config();
        const row = await subject.create(4, ownerId);

        const longTitle = await saveSeo(subject, row.id, {
          seoTitle: "a".repeat(201),
        });
        expect(longTitle.body.errors?.length).toBeGreaterThan(0);
        const longDescription = await saveSeo(subject, row.id, {
          seoDescription: "a".repeat(501),
        });
        expect(longDescription.body.errors?.length).toBeGreaterThan(0);

        const accepted = await saveSeo(subject, row.id, {
          seoTitle: "a".repeat(200),
          seoDescription: "b".repeat(500),
        });
        expect(localeRow(accepted, subject.saveMutation).version).toBe(1);

        for (const field of ["canonicalUrl", "robots", "noindex"]) {
          const response = await request(app.getHttpServer())
            .post("/graphql")
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
              query: `mutation Save($input: SaveContentSeoInput!) {
                ${subject.saveMutation}(input: $input) { excludeFromIndex }
              }`,
              variables: {
                input: {
                  contentId: row.id,
                  locale: "EN",
                  [field]: "https://elsewhere.example/",
                },
              },
            });
          expect(response.body.errors?.length).toBeGreaterThan(0);
          expect(errorCode(response)).toBe("BAD_USER_INPUT");
        }
        expect(
          (await readSettings(subject, row.id)).body.data[subject.seoQuery]
            .excludeFromIndex,
        ).toBe(false);
      });

      it("denies anonymous, non-provider and wrong-owner callers", async () => {
        const subject = config();
        const row = await subject.create(5, ownerId);

        const anonymous = await saveSeo(subject, row.id, { seoTitle: "x" }, "");
        expect(anonymous.body.errors?.length).toBeGreaterThan(0);

        const professional = await saveSeo(
          subject,
          row.id,
          { seoTitle: "x" },
          professionalToken,
        );
        expect(errorCode(professional)).toBe("FORBIDDEN");

        const stranger = await saveSeo(
          subject,
          row.id,
          { seoTitle: "x" },
          strangerToken,
        );
        expect(stranger.body.errors[0].message).toMatch(/ACCESS_DENIED/);
        expect(
          (await readSettings(subject, row.id, strangerToken)).body.errors[0]
            .message,
        ).toMatch(/ACCESS_DENIED/);
        expect(
          await prisma.$queryRawUnsafe<unknown[]>(
            `SELECT 1 FROM "${{ course: "CourseSeo", event: "EventSeo", podcast: "PodcastSeo", youtube: "YouTubeChannelSeo" }[kind]}" WHERE "${subject.idArg}" = $1`,
            row.id,
          ),
        ).toHaveLength(0);

        const admin = await saveSeo(
          subject,
          row.id,
          { seoTitle: "Moderated" },
          adminToken,
        );
        expect(localeRow(admin, subject.saveMutation).seoTitle).toBe(
          "Moderated",
        );
      });

      it("answers a stale version and a lost simultaneous save with a conflict", async () => {
        const subject = config();
        const row = await subject.create(6, ownerId);
        await saveSeo(subject, row.id, { seoTitle: "Base" });

        const stale = await saveSeo(subject, row.id, {
          seoTitle: "Stale",
          expectedVersion: 7,
        });
        expect(errorCode(stale)).toBe("CONTENT_SEO_VERSION_CONFLICT");

        const results = await runTogether(6, (index) =>
          saveSeo(subject, row.id, {
            seoTitle: `Title ${index}`,
            expectedVersion: 1,
          }),
        );
        const outcomes = results.map((result) =>
          result.status !== "fulfilled"
            ? "rejected"
            : result.value.body.errors
              ? (result.value.body.errors[0].message as string)
              : "saved",
        );
        expect(outcomes.filter((outcome) => outcome === "saved")).toHaveLength(
          1,
        );
        expect(outcomes.filter((outcome) => outcome !== "saved")).toEqual(
          Array(5).fill("CONTENT_SEO_VERSION_CONFLICT"),
        );

        const settings = await readSettings(subject, row.id);
        const english = settings.body.data[subject.seoQuery].locales[0];
        expect(english.version).toBe(2);
        expect(english.seoTitle).toMatch(/^Title [0-5]$/);
      });

      it("lets exactly one of two first saves create the row", async () => {
        const subject = config();
        const row = await subject.create(7, ownerId);

        const results = await runTogether(6, (index) =>
          saveSeo(subject, row.id, { seoTitle: `First ${index}` }),
        );
        expect(
          results.filter(
            (result) =>
              result.status === "fulfilled" && !result.value.body.errors,
          ),
        ).toHaveLength(1);
        const stored = await prisma.$queryRawUnsafe<Array<{ version: number }>>(
          `SELECT "version" FROM "${{ course: "CourseSeo", event: "EventSeo", podcast: "PodcastSeo", youtube: "YouTubeChannelSeo" }[kind]}" WHERE "${subject.idArg}" = $1`,
          row.id,
        );
        expect(stored).toEqual([{ version: 1 }]);
      });

      it("lets only an administrator exclude a page from the index, without touching publication", async () => {
        const subject = config();
        const row = await subject.create(8, ownerId);
        const before = await shardSlugs(subject.contentType);
        expect(before).toContain(row.slug);

        const byOwner = await setExclusion(subject, row.id, true, ownerToken);
        expect(errorCode(byOwner)).toBe("FORBIDDEN");
        const byProfessional = await setExclusion(
          subject,
          row.id,
          true,
          professionalToken,
        );
        expect(errorCode(byProfessional)).toBe("FORBIDDEN");

        const excluded = await setExclusion(subject, row.id, true);
        expect(
          excluded.body.data[subject.exclusionMutation].excludeFromIndex,
        ).toBe(true);
        expect(await subject.status(row.id)).toBe("PUBLISHED");

        const publicView = await publicRead(subject, row.slug);
        expect(publicView.body.data[subject.bySlug]).toMatchObject({
          id: row.id,
          excludeFromIndex: true,
        });
        expect(await shardSlugs(subject.contentType)).not.toContain(row.slug);

        await setExclusion(subject, row.id, true);
        const audits = await prisma.auditLog.count({
          where: {
            entityId: row.id,
            action: "CONTENT_INDEX_EXCLUSION_CHANGED",
          },
        });
        expect(audits).toBe(1);

        await setExclusion(subject, row.id, false);
        expect(await shardSlugs(subject.contentType)).toContain(row.slug);
        expect(
          (await publicRead(subject, row.slug)).body.data[subject.bySlug]
            .excludeFromIndex,
        ).toBe(false);
      });

      it("records field names and never the text in the audit trail", async () => {
        const subject = config();
        const row = await subject.create(9, ownerId);
        await saveSeo(subject, row.id, {
          seoTitle: "Confidential draft headline",
        });
        const audit = await prisma.auditLog.findFirstOrThrow({
          where: { entityId: row.id, action: "CONTENT_SEO_UPDATED" },
        });
        expect(audit.actorId).toBe(ownerId);
        expect(audit.metadata).toEqual({ locale: "EN", fields: ["seoTitle"] });
        expect(JSON.stringify(audit)).not.toContain("Confidential");
      });
    },
  );

  describe("social images", () => {
    it("serves an uploaded image, attaches it, and retires it when cleared", async () => {
      const subject = configs()[0];
      const row = await subject.create(20, ownerId);
      const image = await uploadPng(ownerToken);

      const attached = await saveSeo(subject, row.id, {
        socialImageId: image.id,
        socialImageAlt: "A card",
      });
      expect(localeRow(attached, subject.saveMutation)).toMatchObject({
        socialImageId: image.id,
        socialImagePath: image.path,
        socialImageAlt: "A card",
      });
      expect(
        (await publicRead(subject, row.slug)).body.data[subject.bySlug],
      ).toMatchObject({
        socialImagePath: image.path,
        socialImageAlt: "A card",
      });

      const served = await request(app.getHttpServer()).get(image.path);
      expect(served.status).toBe(200);
      expect(served.headers["content-type"]).toBe("image/png");
      expect(served.headers["x-content-type-options"]).toBe("nosniff");
      expect(Buffer.compare(served.body, PNG_1X1)).toBe(0);

      const stored = await prisma.contentSocialImage.findUniqueOrThrow({
        where: { id: image.id },
      });
      expect(await storage.exists("content", stored.storageKey)).toBe(true);

      const cleared = await saveSeo(subject, row.id, {
        socialImageId: null,
        expectedVersion: 1,
      });
      expect(localeRow(cleared, subject.saveMutation)).toMatchObject({
        socialImageId: null,
        socialImagePath: null,
        socialImageAlt: null,
      });
      expect(
        await prisma.contentSocialImage.findUnique({ where: { id: image.id } }),
      ).toBeNull();
      expect(await storage.exists("content", stored.storageKey)).toBe(false);
      expect((await request(app.getHttpServer()).get(image.path)).status).toBe(
        404,
      );
    });

    it("keeps an image another page still uses, and retires the replaced one", async () => {
      const subject = configs()[0];
      const first = await subject.create(21, ownerId);
      const second = await subject.create(22, ownerId);
      const shared = await uploadPng(ownerToken);
      const replacement = await uploadPng(ownerToken);

      await saveSeo(subject, first.id, { socialImageId: shared.id });
      await saveSeo(subject, second.id, { socialImageId: shared.id });

      await saveSeo(subject, first.id, {
        socialImageId: null,
        expectedVersion: 1,
      });
      expect(
        await prisma.contentSocialImage.findUnique({
          where: { id: shared.id },
        }),
      ).not.toBeNull();
      expect((await request(app.getHttpServer()).get(shared.path)).status).toBe(
        200,
      );

      await saveSeo(subject, second.id, {
        socialImageId: replacement.id,
        expectedVersion: 1,
      });
      expect(
        await prisma.contentSocialImage.findUnique({
          where: { id: shared.id },
        }),
      ).toBeNull();
      expect(
        await prisma.contentSocialImage.findUnique({
          where: { id: replacement.id },
        }),
      ).not.toBeNull();
    });

    it("refuses another owner's image, an unknown id and a URL in place of an id", async () => {
      const subject = configs()[0];
      const row = await subject.create(23, ownerId);
      const foreign = await uploadPng(strangerToken);

      for (const socialImageId of [
        foreign.id,
        "doesnotexist00000000000",
        "https://evil.example/card.png",
        "javascript:alert(1)",
        "data:image/png;base64,AAAA",
      ]) {
        const response = await saveSeo(subject, row.id, { socialImageId });
        expect(response.body.errors?.length).toBeGreaterThan(0);
      }
      expect(
        (await readSettings(subject, row.id)).body.data[subject.seoQuery]
          .locales[0].socialImageId,
      ).toBeNull();

      const byAdmin = await saveSeo(
        subject,
        row.id,
        { socialImageId: foreign.id },
        adminToken,
      );
      expect(byAdmin.body.errors?.length).toBeGreaterThan(0);
    });

    it("lets an administrator attach the owning provider's image", async () => {
      const subject = configs()[0];
      const row = await subject.create(24, ownerId);
      const image = await uploadPng(ownerToken);
      const response = await saveSeo(
        subject,
        row.id,
        { socialImageId: image.id },
        adminToken,
      );
      expect(localeRow(response, subject.saveMutation).socialImageId).toBe(
        image.id,
      );
    });

    it("rejects an unsupported type, a forged signature, an oversize file and the wrong caller", async () => {
      const gif = await upload(ownerToken, {
        data: Buffer.from("GIF89a"),
        name: "card.gif",
        type: "image/gif",
      });
      expect(gif.status).toBe(400);
      expect(gif.body.code).toBe("CONTENT_SEO_IMAGE_INVALID_TYPE");

      const forged = await upload(ownerToken, {
        data: Buffer.from("<script>alert(1)</script>"),
        name: "card.png",
        type: "image/png",
      });
      expect(forged.status).toBe(400);
      expect(forged.body.code).toBe("CONTENT_SEO_IMAGE_INVALID_TYPE");

      const svg = await upload(ownerToken, {
        data: Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'/>"),
        name: "card.svg",
        type: "image/svg+xml",
      });
      expect(svg.status).toBe(400);

      const oversize = await upload(ownerToken, {
        data: Buffer.concat([PNG_1X1, Buffer.alloc(2 * 1024 * 1024)]),
        name: "card.png",
        type: "image/png",
      });
      expect(oversize.status).toBe(400);
      expect(oversize.body.code).toBe("CONTENT_SEO_IMAGE_TOO_LARGE");

      const anonymous = await upload(null, {
        data: PNG_1X1,
        name: "card.png",
        type: "image/png",
      });
      expect(anonymous.status).toBe(401);
      const professional = await upload(professionalToken, {
        data: PNG_1X1,
        name: "card.png",
        type: "image/png",
      });
      expect(professional.status).toBe(403);
    });

    it("does not serve a malformed or unknown image id", async () => {
      for (const path of [
        "/content-social-image/unknownunknownunknownunk",
        "/content-social-image/..%2F..%2Fetc%2Fpasswd",
        "/content-social-image/x",
      ])
        expect((await request(app.getHttpServer()).get(path)).status).toBe(404);
    });

    it("caps the unused uploads one account can hold", async () => {
      const quotaUser = await makeUser(Role.PROVIDER, "quota");
      const token29 = quotaUser.token;

      for (let index = 0; index < 10; index += 1)
        expect(
          (
            await upload(token29, {
              data: PNG_1X1,
              name: "card.png",
              type: "image/png",
            })
          ).status,
        ).toBe(201);
      const refused = await upload(token29, {
        data: PNG_1X1,
        name: "card.png",
        type: "image/png",
      });
      expect(refused.status).toBe(400);
      expect(refused.body.code).toBe("CONTENT_SEO_IMAGE_QUOTA_REACHED");

      await prisma.contentSocialImage.updateMany({
        where: { ownerId: quotaUser.id },
        data: { createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000) },
      });
      expect(
        (
          await upload(token29, {
            data: PNG_1X1,
            name: "card.png",
            type: "image/png",
          })
        ).status,
      ).toBe(201);
      expect(
        await prisma.contentSocialImage.count({
          where: { ownerId: quotaUser.id },
        }),
      ).toBe(1);
    });
  });

  describe("ingestion", () => {
    const unique = () =>
      `${process.pid.toString(36)}-${Date.now().toString(36)}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;

    it("keeps editorial overrides, their version and the index flag when a source updates the page", async () => {
      const source = await prisma.ingestionSource.create({
        data: {
          slug: `${token}-source-${unique()}`,
          name: "SEO source",
          kind: IngestionContentKind.COURSE,
          autoPublish: true,
          fieldMap: {
            external_id: "externalId",
            url: "canonicalUrl",
            name: "title",
            summary: "description",
            teacher: "instructor",
            cat: "category",
            lvl: "level",
          },
        },
      });
      const issued = await gql(
        `mutation {
          issueIngestionApiKey(input: { sourceId: "${source.id}", name: "seo e2e" }) {
            credential
          }
        }`,
        {},
        adminToken,
      );
      const credential = issued.body.data.issueIngestionApiKey
        .credential as string;

      const externalId = `crs-${unique()}`;
      const ingest = (summary: string) =>
        request(app.getHttpServer())
          .post("/v1/ingest/course/batches")
          .set("Idempotency-Key", `idem-${unique()}`)
          .set("Authorization", `Bearer ${credential}`)
          .send({
            contractVersion: "1.0",
            kind: "COURSE",
            mode: "INCREMENTAL",
            items: [
              {
                external_id: externalId,
                url: "https://example.com/c/seo-preserve",
                name: "Ingested course",
                summary,
                teacher: "Ada",
                cat: "TECHNOLOGY",
                lvl: "BEGINNER",
              },
            ],
          });

      const created = await ingest("Source description one");
      expect(created.status).toBe(201);
      const courseId = created.body.items[0].catalogId as string;
      const subject = configs()[0];

      const english = await saveSeo(
        subject,
        courseId,
        { seoTitle: "Editorial headline", seoDescription: "Editorial snippet" },
        adminToken,
      );
      expect(english.body.errors).toBeUndefined();
      const french = await saveSeo(
        subject,
        courseId,
        { locale: "FR", seoTitle: "Titre éditorial" },
        adminToken,
      );
      expect(french.body.errors).toBeUndefined();
      await setExclusion(subject, courseId, true);

      const updated = await ingest("Source description two");
      expect(updated.status).toBe(201);
      expect(updated.body.items[0].catalogId).toBe(courseId);

      const course = await prisma.course.findUniqueOrThrow({
        where: { id: courseId },
      });
      expect(course.description).toBe("Source description two");
      expect(course.excludeFromIndex).toBe(true);

      const rows = await prisma.courseSeo.findMany({
        where: { courseId },
        orderBy: { locale: "asc" },
      });
      expect(rows.map((row) => [row.locale, row.version])).toEqual([
        [AppLanguage.EN, 1],
        [AppLanguage.FR, 1],
      ]);
      expect(rows[0]).toMatchObject({
        seoTitle: "Editorial headline",
        seoDescription: "Editorial snippet",
      });
      expect(course.description).not.toBe(rows[0].seoDescription);
    }, 120_000);
  });
});
