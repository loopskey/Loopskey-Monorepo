import { INestApplication, ValidationPipe } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { AppLanguage, Role, UserStatus } from "@prisma/client";
import { CourseStatus, EventStatus } from "@prisma/client";
import { PodcastStatus, YouTubeChannelStatus } from "@prisma/client";
import { AppModule } from "@app/app.module";
import { PrismaService } from "@prisma/prisma.service";
import { runTogether } from "./setup/concurrency";

import cookieParser from "cookie-parser";
import request from "supertest";

const token = `ctrans${Date.now().toString(36)}`;

const sign = (id: string, email: string, role: Role) =>
  new JwtService({ secret: process.env.JWT_ACCESS_SECRET }).sign({
    sub: id,
    email,
    role,
    status: UserStatus.ACTIVE,
  });

type Kind = "course" | "event" | "podcast" | "youtube";

type KindConfig = {
  kind: Kind;
  parentField: string;
  idKey: string;
  inputType: string;
  publicationType: string;
  listQuery: string;
  saveMutation: string;
  publishMutation: string;
  bySlug: string;
  list: string;
  create: (
    index: number,
    providerId: string | null,
    source: string | null,
  ) => Promise<{ id: string; slug: string }>;
  hide: (id: string) => Promise<unknown>;
  show: (id: string) => Promise<unknown>;
  remove: (id: string) => Promise<unknown>;
  translationCount: (id: string) => Promise<number>;
};

describe("Content translations (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let ownerId: string;
  let strangerId: string;
  let adminId: string;
  let professionalId: string;
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

  const slugOf = (name: string) => `${token}-${name}-${(sequence += 1)}`;

  const configs = (): KindConfig[] => [
    {
      kind: "course",
      parentField: "course",
      idKey: "courseId",
      inputType: "SaveCourseTranslationInput",
      publicationType: "SetCourseTranslationPublicationInput",
      listQuery: "courseTranslations",
      saveMutation: "saveCourseTranslation",
      publishMutation: "setCourseTranslationPublication",
      bySlug: "courseBySlug",
      list: "courses",
      create: async (index, providerId, source) =>
        prisma.course.create({
          data: {
            slug: slugOf(`course-${index}`),
            title: `${token} course ${index} Original`,
            instructor: "Instructor",
            description: "Original course description",
            category: "TECHNOLOGY",
            status: CourseStatus.PUBLISHED,
            providerId,
            sourceLanguage: source,
          },
        }),
      hide: (id) =>
        prisma.course.update({
          where: { id },
          data: { status: CourseStatus.DRAFT },
        }),
      show: (id) =>
        prisma.course.update({
          where: { id },
          data: { status: CourseStatus.PUBLISHED },
        }),
      remove: (id) => prisma.course.delete({ where: { id } }),
      translationCount: (id) =>
        prisma.courseTranslation.count({ where: { courseId: id } }),
    },
    {
      kind: "event",
      parentField: "event",
      idKey: "eventId",
      inputType: "SaveEventTranslationInput",
      publicationType: "SetEventTranslationPublicationInput",
      listQuery: "eventTranslations",
      saveMutation: "saveEventTranslation",
      publishMutation: "setEventTranslationPublication",
      bySlug: "eventBySlug",
      list: "events",
      create: async (index, providerId, source) =>
        prisma.event.create({
          data: {
            slug: slugOf(`event-${index}`),
            title: `${token} event ${index} Original`,
            type: "WORKSHOP",
            deliveryMode: "LIVE_ONLINE",
            category: "TECHNOLOGY",
            description: "Original event description",
            startDate: new Date("2031-03-01T10:00:00.000Z"),
            isFree: true,
            status: EventStatus.PUBLISHED,
            providerId,
            sourceLanguage: source,
          },
        }),
      hide: (id) =>
        prisma.event.update({
          where: { id },
          data: { status: EventStatus.DRAFT },
        }),
      show: (id) =>
        prisma.event.update({
          where: { id },
          data: { status: EventStatus.PUBLISHED },
        }),
      remove: (id) => prisma.event.delete({ where: { id } }),
      translationCount: (id) =>
        prisma.eventTranslation.count({ where: { eventId: id } }),
    },
    {
      kind: "podcast",
      parentField: "podcast",
      idKey: "podcastId",
      inputType: "SavePodcastTranslationInput",
      publicationType: "SetPodcastTranslationPublicationInput",
      listQuery: "podcastTranslations",
      saveMutation: "savePodcastTranslation",
      publishMutation: "setPodcastTranslationPublication",
      bySlug: "podcastBySlug",
      list: "podcasts",
      create: async (index, providerId, source) =>
        prisma.podcast.create({
          data: {
            slug: slugOf(`podcast-${index}`),
            title: `${token} podcast ${index} Original`,
            host: "Host",
            description: "Original podcast description",
            category: "AI",
            status: PodcastStatus.PUBLISHED,
            providerId,
            sourceLanguage: source,
          },
        }),
      hide: (id) =>
        prisma.podcast.update({
          where: { id },
          data: { status: PodcastStatus.DRAFT },
        }),
      show: (id) =>
        prisma.podcast.update({
          where: { id },
          data: { status: PodcastStatus.PUBLISHED },
        }),
      remove: (id) => prisma.podcast.delete({ where: { id } }),
      translationCount: (id) =>
        prisma.podcastTranslation.count({ where: { podcastId: id } }),
    },
    {
      kind: "youtube",
      parentField: "youtubeChannel",
      idKey: "channelId",
      inputType: "SaveYouTubeChannelTranslationInput",
      publicationType: "SetYouTubeChannelTranslationPublicationInput",
      listQuery: "youtubeChannelTranslations",
      saveMutation: "saveYouTubeChannelTranslation",
      publishMutation: "setYouTubeChannelTranslationPublication",
      bySlug: "youtubeChannelBySlug",
      list: "youtubeChannels",
      create: async (index, providerId, source) =>
        prisma.youTubeChannel.create({
          data: {
            slug: slugOf(`channel-${index}`),
            title: `${token} channel ${index} Original`,
            provider: "Provider",
            description: "Original channel description",
            category: "DATA",
            status: YouTubeChannelStatus.PUBLISHED,
            providerId,
            sourceLanguage: source,
          },
        }),
      hide: (id) =>
        prisma.youTubeChannel.update({
          where: { id },
          data: { status: YouTubeChannelStatus.DRAFT },
        }),
      show: (id) =>
        prisma.youTubeChannel.update({
          where: { id },
          data: { status: YouTubeChannelStatus.PUBLISHED },
        }),
      remove: (id) => prisma.youTubeChannel.delete({ where: { id } }),
      translationCount: (id) =>
        prisma.youTubeChannelTranslation.count({ where: { channelId: id } }),
    },
  ];

  const saveDocument = (config: KindConfig) => `
    mutation Save($input: ${config.inputType}!) {
      ${config.saveMutation}(input: $input) { id locale title description isPublished version }
    }`;
  const publishDocument = (config: KindConfig) => `
    mutation Publish($input: ${config.publicationType}!) {
      ${config.publishMutation}(input: $input) { id isPublished version publishedAt }
    }`;
  const bySlugDocument = (config: KindConfig) => `
    query Read($slug: String!, $locale: AppLanguage) {
      ${config.bySlug}(slug: $slug, locale: $locale) { id title description contentLanguage availableLocales }
    }`;
  const listDocument = (config: KindConfig) => `
    query List($filter: ${{ course: "CourseFilterInput", event: "EventFilterInput", podcast: "PodcastFilterInput", youtube: "YouTubeChannelFilterInput" }[config.kind]}, $locale: AppLanguage) {
      ${config.list}(filter: $filter, pagination: { take: 50 }, locale: $locale) {
        items { id title contentLanguage availableLocales }
      }
    }`;

  const save = (
    config: KindConfig,
    parentId: string,
    input: Record<string, unknown>,
    bearer = ownerToken,
  ) =>
    gql(
      saveDocument(config),
      {
        input: {
          [config.idKey]: parentId,
          locale: "FR",
          title: "Titre",
          description: "Description",
          ...input,
        },
      },
      bearer,
    );

  const publish = (
    config: KindConfig,
    parentId: string,
    published: boolean,
    expectedVersion: number,
    bearer = ownerToken,
  ) =>
    gql(
      publishDocument(config),
      {
        input: {
          [config.idKey]: parentId,
          locale: "FR",
          published,
          expectedVersion,
        },
      },
      bearer,
    );

  const errorCode = (response: request.Response) =>
    response.body.errors?.[0]?.extensions?.code as string | undefined;

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

    const make = async (role: Role, name: string) => {
      const email = `${name}-${token}@content-translation.e2e.test`;
      const user = await prisma.user.create({
        data: { email, role, status: UserStatus.ACTIVE },
      });
      createdUsers.push(user.id);
      return { id: user.id, token: sign(user.id, email, role) };
    };
    const owner = await make(Role.PROVIDER, "owner");
    const stranger = await make(Role.PROVIDER, "stranger");
    const admin = await make(Role.ADMIN, "admin");
    const professional = await make(Role.PROFESSIONAL, "professional");
    ({ id: ownerId, token: ownerToken } = owner);
    ({ id: strangerId, token: strangerToken } = stranger);
    ({ id: adminId, token: adminToken } = admin);
    ({ id: professionalId, token: professionalToken } = professional);
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
      await prisma.user.deleteMany({ where: { id: { in: createdUsers } } });
    }
    await app?.close();
  }, 60_000);

  it("keeps the test accounts distinct", () => {
    expect(new Set([ownerId, strangerId, adminId, professionalId]).size).toBe(
      4,
    );
  });

  describe.each(["course", "event", "podcast", "youtube"] as Kind[])(
    "%s",
    (kind) => {
      const config = () =>
        configs().find((candidate) => candidate.kind === kind)!;

      it("rejects anonymous and non-provider callers", async () => {
        const subject = config();
        const row = await subject.create(1, ownerId, "en");
        const anonymous = await save(subject, row.id, {}, "");
        const professional = await save(subject, row.id, {}, professionalToken);
        expect(anonymous.body.errors?.length).toBeGreaterThan(0);
        expect(errorCode(professional)).toBe("FORBIDDEN");
      });

      it("denies another provider and never reveals the draft text", async () => {
        const subject = config();
        const row = await subject.create(2, ownerId, "en");
        await save(subject, row.id, { title: "Brouillon secret" });
        const denied = await save(subject, row.id, {}, strangerToken);
        expect(denied.body.errors?.[0]?.message).toMatch(/ACCESS_DENIED/);
        const listing = await gql(
          `query L($id: String!) { ${subject.listQuery}(${subject.idKey}: $id) { title } }`,
          { id: row.id },
          strangerToken,
        );
        expect(listing.body.errors?.[0]?.message).toMatch(/ACCESS_DENIED/);
        expect(JSON.stringify(listing.body)).not.toContain("Brouillon secret");
      });

      it("lets the owner and an administrator edit, with version checks", async () => {
        const subject = config();
        const row = await subject.create(3, ownerId, "en");
        const created = await save(subject, row.id, {});
        const first = created.body.data[subject.saveMutation];
        expect(first).toMatchObject({ version: 1, isPublished: false });

        const edited = await save(
          subject,
          row.id,
          { title: "Titre 2", expectedVersion: 1 },
          adminToken,
        );
        expect(edited.body.data[subject.saveMutation].version).toBe(2);

        const stale = await save(subject, row.id, {
          title: "Perdu",
          expectedVersion: 1,
        });
        expect(stale.body.errors[0].extensions.code).toBe(
          "CONTENT_TRANSLATION_VERSION_CONFLICT",
        );
        const stored = await prisma.$queryRawUnsafe<Array<{ title: string }>>(
          `SELECT "title" FROM "${{ course: "CourseTranslation", event: "EventTranslation", podcast: "PodcastTranslation", youtube: "YouTubeChannelTranslation" }[kind]}" WHERE "${subject.idKey}" = $1`,
          row.id,
        );
        expect(stored).toEqual([{ title: "Titre 2" }]);
      });

      it("keeps a draft private, serves a published variant and withdraws it again", async () => {
        const subject = config();
        const row = await subject.create(4, ownerId, "en");
        await save(subject, row.id, {
          title: "Titre public",
          description: "Texte public",
        });

        const draft = await gql(bySlugDocument(subject), {
          slug: row.slug,
          locale: "FR",
        });
        expect(draft.body.data[subject.bySlug]).toMatchObject({
          title: expect.stringContaining("Original"),
          availableLocales: ["EN"],
        });

        await publish(subject, row.id, true, 1);
        const live = await gql(bySlugDocument(subject), {
          slug: row.slug,
          locale: "FR",
        });
        expect(live.body.data[subject.bySlug]).toMatchObject({
          title: "Titre public",
          description: "Texte public",
          contentLanguage: "FR",
          availableLocales: ["EN", "FR"],
        });
        const english = await gql(bySlugDocument(subject), {
          slug: row.slug,
          locale: "EN",
        });
        expect(english.body.data[subject.bySlug].title).toContain("Original");

        await publish(subject, row.id, false, 2);
        const withdrawn = await gql(bySlugDocument(subject), {
          slug: row.slug,
          locale: "FR",
        });
        expect(withdrawn.body.data[subject.bySlug].availableLocales).toEqual([
          "EN",
        ]);
      });

      it("leaves the default reader contract untouched", async () => {
        const subject = config();
        const row = await subject.create(5, ownerId, "en");
        await save(subject, row.id, {});
        await publish(subject, row.id, true, 1);
        const legacy = await gql(
          bySlugDocument(subject),
          { slug: row.slug },
          undefined,
        );
        expect(legacy.body.data[subject.bySlug]).toMatchObject({
          contentLanguage: null,
          availableLocales: null,
        });
        expect(legacy.body.data[subject.bySlug].title).toContain("Original");
      });

      it("does not claim a language the source does not support", async () => {
        const subject = config();
        const unknown = await subject.create(6, ownerId, null);
        await save(subject, unknown.id, {});
        await publish(subject, unknown.id, true, 1);
        const response = await gql(bySlugDocument(subject), {
          slug: unknown.slug,
          locale: "FR",
        });
        expect(response.body.data[subject.bySlug]).toMatchObject({
          availableLocales: ["FR"],
          contentLanguage: "FR",
        });
        const defaults = await gql(bySlugDocument(subject), {
          slug: unknown.slug,
          locale: "EN",
        });
        expect(defaults.body.data[subject.bySlug].contentLanguage).toBeNull();
      });

      it("removes every public variant when the parent is withdrawn", async () => {
        const subject = config();
        const row = await subject.create(7, ownerId, "en");
        await save(subject, row.id, {});
        await publish(subject, row.id, true, 1);
        await subject.hide(row.id);
        const hidden = await gql(bySlugDocument(subject), {
          slug: row.slug,
          locale: "FR",
        });
        expect(hidden.body.errors?.length).toBeGreaterThan(0);
        expect(hidden.body.data).toBeNull();
        await subject.show(row.id);
        const restored = await gql(bySlugDocument(subject), {
          slug: row.slug,
          locale: "FR",
        });
        expect(restored.body.data[subject.bySlug].title).toBe("Titre");
      });

      it("overlays published translations on list pages only for the requested locale", async () => {
        const subject = config();
        const row = await subject.create(8, ownerId, "en");
        await save(subject, row.id, { title: "Titre de liste" });
        await publish(subject, row.id, true, 1);
        const word = {
          course: "course",
          event: "event",
          podcast: "podcast",
          youtube: "channel",
        }[kind];
        const search = `${token} ${word} 8`;
        const french = await gql(listDocument(subject), {
          filter: { search },
          locale: "FR",
        });
        const hit = french.body.data[subject.list].items.find(
          (item: { id: string }) => item.id === row.id,
        );
        expect(hit).toMatchObject({
          title: "Titre de liste",
          contentLanguage: "FR",
        });
        const plain = await gql(listDocument(subject), {
          filter: { search },
        });
        const original = plain.body.data[subject.list].items.find(
          (item: { id: string }) => item.id === row.id,
        );
        expect(original.title).toContain("Original");
        expect(original.availableLocales).toBeNull();
      });

      it("cascades with the parent", async () => {
        const subject = config();
        const row = await subject.create(9, ownerId, "en");
        await save(subject, row.id, {});
        expect(await subject.translationCount(row.id)).toBe(1);
        await subject.remove(row.id);
        expect(await subject.translationCount(row.id)).toBe(0);
      });

      it("lets exactly one of many simultaneous saves win", async () => {
        const subject = config();
        const row = await subject.create(10, ownerId, "en");
        await save(subject, row.id, { title: "Base" });
        const results = await runTogether(8, (index) =>
          save(subject, row.id, {
            title: `Concurrent ${index}`,
            expectedVersion: 1,
          }),
        );
        const bodies = results.map((result) =>
          result.status === "fulfilled" ? result.value.body : null,
        );
        const winners = bodies.filter(
          (body) => body?.data?.[subject.saveMutation],
        );
        const conflicts = bodies.filter(
          (body) =>
            body?.errors?.[0]?.extensions?.code ===
            "CONTENT_TRANSLATION_VERSION_CONFLICT",
        );
        expect(winners).toHaveLength(1);
        expect(conflicts).toHaveLength(7);
        const winner = winners[0].data[subject.saveMutation];
        expect(winner.version).toBe(2);
        const persisted = await gql(
          `query L($id: String!) { ${subject.listQuery}(${subject.idKey}: $id) { title version } }`,
          { id: row.id },
          ownerToken,
        );
        expect(persisted.body.data[subject.listQuery]).toEqual([
          { title: winner.title, version: 2 },
        ]);
      });

      it("creates one row when many first saves collide", async () => {
        const subject = config();
        const row = await subject.create(11, ownerId, "en");
        const results = await runTogether(6, (index) =>
          save(subject, row.id, { title: `First ${index}` }),
        );
        const bodies = results.map((result) =>
          result.status === "fulfilled" ? result.value.body : null,
        );
        expect(
          bodies.filter((body) => body?.data?.[subject.saveMutation]),
        ).toHaveLength(1);
        expect(await subject.translationCount(row.id)).toBe(1);
      });

      it("lets exactly one of many simultaneous publications win", async () => {
        const subject = config();
        const row = await subject.create(12, ownerId, "en");
        await save(subject, row.id, {});
        const results = await runTogether(6, () =>
          publish(subject, row.id, true, 1),
        );
        const bodies = results.map((result) =>
          result.status === "fulfilled" ? result.value.body : null,
        );
        expect(
          bodies.filter((body) => body?.data?.[subject.publishMutation]),
        ).toHaveLength(1);
        const persisted = await prisma.$queryRawUnsafe<
          Array<{ version: number; isPublished: boolean }>
        >(
          `SELECT "version", "isPublished" FROM "${{ course: "CourseTranslation", event: "EventTranslation", podcast: "PodcastTranslation", youtube: "YouTubeChannelTranslation" }[kind]}" WHERE "${subject.idKey}" = $1`,
          row.id,
        );
        expect(persisted).toEqual([{ version: 2, isPublished: true }]);
      });

      it("moves the sitemap timestamp and locales only for published changes", async () => {
        const subject = config();
        const row = await subject.create(13, ownerId, "en");
        const parentTable = {
          course: "Course",
          event: "Event",
          podcast: "Podcast",
          youtube: "YouTubeChannel",
        }[kind];
        const stamp = async () =>
          (
            await prisma.$queryRawUnsafe<Array<{ at: Date }>>(
              `SELECT "publicContentUpdatedAt" AS "at" FROM "${parentTable}" WHERE "id" = $1`,
              row.id,
            )
          )[0].at.getTime();
        const before = await stamp();
        await save(subject, row.id, {});
        expect(await stamp()).toBe(before);
        await publish(subject, row.id, true, 1);
        expect(await stamp()).toBeGreaterThan(before);
      });
    },
  );

  describe("public URL enumeration", () => {
    const pageDocument = `
      query Page($input: PublicUrlPageInput!) {
        publicUrlPage(input: $input) { items { slug availableLocales } hasNextPage }
      }`;
    const shardDocument = `
      query Shards { publicUrlShards { kind shards { startCursor endCursor } } }`;

    const locales = async (kind: string, slug: string) => {
      const shards = await gql(shardDocument, {});
      const set = shards.body.data.publicUrlShards.find(
        (candidate: { kind: string }) => candidate.kind === kind,
      );
      for (const shard of set.shards) {
        const page = await gql(pageDocument, {
          input: {
            kind,
            startCursor: shard.startCursor,
            endCursor: shard.endCursor,
            take: 2500,
          },
        });
        const hit = page.body.data.publicUrlPage.items.find(
          (item: { slug: string }) => item.slug === slug,
        );
        if (hit) return hit.availableLocales as string[];
      }
      return null;
    };

    it("lists a French variant only for a published translation", async () => {
      const subject = configs()[0];
      const english = await subject.create(20, ownerId, "en");
      const unknown = await subject.create(21, ownerId, null);
      const french = await subject.create(22, ownerId, "fr");
      expect(await locales("COURSE", english.slug)).toEqual(["EN"]);
      expect(await locales("COURSE", unknown.slug)).toEqual([]);
      expect(await locales("COURSE", french.slug)).toEqual([]);

      await save(subject, english.id, {});
      expect(await locales("COURSE", english.slug)).toEqual(["EN"]);
      await publish(subject, english.id, true, 1);
      expect(await locales("COURSE", english.slug)).toEqual(["EN", "FR"]);

      await save(subject, unknown.id, {});
      await publish(subject, unknown.id, true, 1);
      expect(await locales("COURSE", unknown.slug)).toEqual(["FR"]);
    });
  });

  describe("course translations carry the primary lists", () => {
    it("requires translated learnings before publishing", async () => {
      const subject = configs()[0];
      const row = await prisma.course.create({
        data: {
          slug: slugOf("lists"),
          title: "Original course",
          instructor: "Instructor",
          description: "Original description",
          category: "TECHNOLOGY",
          status: CourseStatus.PUBLISHED,
          providerId: ownerId,
          sourceLanguage: "en",
          learnings: ["Learn it"],
          requirements: ["Know it"],
        },
      });
      await save(subject, row.id, {});
      const incomplete = await publish(subject, row.id, true, 1);
      expect(incomplete.body.errors[0].extensions.code).toBe(
        "CONTENT_TRANSLATION_INCOMPLETE",
      );

      await save(subject, row.id, {
        learnings: ["Apprendre"],
        requirements: ["Savoir"],
        expectedVersion: 1,
      });
      const ok = await publish(subject, row.id, true, 2);
      expect(ok.body.data.setCourseTranslationPublication.isPublished).toBe(
        true,
      );
      const live = await gql(
        `query R($slug: String!) { courseBySlug(slug: $slug, locale: FR) { learnings requirements } }`,
        { slug: row.slug },
      );
      expect(live.body.data.courseBySlug).toEqual({
        learnings: ["Apprendre"],
        requirements: ["Savoir"],
      });
    });

    it("validates input bounds", async () => {
      const subject = configs()[0];
      const row = await subject.create(30, ownerId, "en");
      const oversized = await save(subject, row.id, { title: "x".repeat(300) });
      expect(oversized.body.errors?.length).toBeGreaterThan(0);
      const blank = await save(subject, row.id, { title: "   " });
      expect(blank.body.errors?.length).toBeGreaterThan(0);
      const tooMany = await save(subject, row.id, {
        learnings: Array.from({ length: 31 }, () => "x"),
      });
      expect(tooMany.body.errors?.length).toBeGreaterThan(0);
      expect(AppLanguage.FR).toBe("FR");
    });
  });
});
