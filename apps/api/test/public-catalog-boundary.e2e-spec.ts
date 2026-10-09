import { INestApplication, ValidationPipe } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { Role, UserStatus, YouTubeVideoStatus } from "@prisma/client";
import { PrismaService } from "@prisma/prisma.service";
import { AppModule } from "@app/app.module";

import cookieParser from "cookie-parser";
import request from "supertest";

type Variant =
  | "published"
  | "draft"
  | "archived"
  | "deleted"
  | "cancelled"
  | "otherDraft";
type Status = "DRAFT" | "ARCHIVED" | "PUBLISHED" | "CANCELLED";
type Row = { id: string; slug: string };
type Failure = { message: string; code: string | undefined };

type Kind = {
  name: string;
  byId: (id: string) => string;
  bySlug: (slug: string) => string;
  list: (filter: string) => string;
  featured: string | null;
  mine: (filter: string) => string;
  variants: Variant[];
};

const HIDDEN_VARIANTS: Variant[] = ["draft", "archived", "deleted"];
const STATUS_BY_VARIANT: Record<Variant, Status> = {
  published: "PUBLISHED",
  draft: "DRAFT",
  archived: "ARCHIVED",
  deleted: "PUBLISHED",
  cancelled: "CANCELLED",
  otherDraft: "DRAFT",
};

const KINDS: Kind[] = [
  {
    name: "course",
    byId: (id) => `query { courseById(courseId: "${id}") { id slug } }`,
    bySlug: (slug) => `query { courseBySlug(slug: "${slug}") { id slug } }`,
    list: (filter) =>
      `query { courses(filter: ${filter}, pagination: { take: 100 }) { items { id } } }`,
    featured: "featuredCourses",
    mine: (filter) =>
      `query { myProviderCourses(filter: ${filter}, pagination: { take: 100 }) { items { id } } }`,
    variants: ["published", "draft", "archived", "deleted", "otherDraft"],
  },
  {
    name: "event",
    byId: (id) => `query { eventById(eventId: "${id}") { id slug } }`,
    bySlug: (slug) => `query { eventBySlug(slug: "${slug}") { id slug } }`,
    list: (filter) =>
      `query { events(filter: ${filter}, pagination: { take: 100 }) { items { id } } }`,
    featured: "featuredEvents",
    mine: (filter) =>
      `query { myProviderEvents(filter: ${filter}, pagination: { take: 100 }) { items { id } } }`,
    variants: [
      "published",
      "draft",
      "archived",
      "deleted",
      "cancelled",
      "otherDraft",
    ],
  },
  {
    name: "podcast",
    byId: (id) => `query { podcastById(podcastId: "${id}") { id slug } }`,
    bySlug: (slug) => `query { podcastBySlug(slug: "${slug}") { id slug } }`,
    list: (filter) =>
      `query { podcasts(filter: ${filter}, pagination: { take: 100 }) { items { id } } }`,
    featured: "featuredPodcasts",
    mine: (filter) =>
      `query { myProviderPodcasts(filter: ${filter}, pagination: { take: 100 }) { items { id } } }`,
    variants: ["published", "draft", "archived", "deleted", "otherDraft"],
  },
  {
    name: "youtube",
    byId: (id) =>
      `query { youtubeChannelById(channelId: "${id}") { id slug } }`,
    bySlug: (slug) =>
      `query { youtubeChannelBySlug(slug: "${slug}") { id slug } }`,
    list: (filter) =>
      `query { youtubeChannels(filter: ${filter}, pagination: { take: 100 }) { items { id } } }`,
    featured: "featuredYouTubeChannels",
    mine: (filter) =>
      `query { myProviderYouTubeChannels(filter: ${filter}, pagination: { take: 100 }) { items { id } } }`,
    variants: ["published", "draft", "archived", "deleted", "otherDraft"],
  },
];

const signAccessToken = (id: string, email: string, role: Role) =>
  new JwtService({ secret: process.env.JWT_ACCESS_SECRET }).sign({
    sub: id,
    email,
    role,
    status: UserStatus.ACTIVE,
  });

describe("Public catalog boundary (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const token = `zzqxbound${Date.now()}`;
  const rows: Record<string, Partial<Record<Variant, Row>>> = {};
  const users: Record<
    "providerA" | "providerB" | "admin" | "professional",
    string
  > = { providerA: "", providerB: "", admin: "", professional: "" };
  const bearer: Record<keyof typeof users, string> = {
    providerA: "",
    providerB: "",
    admin: "",
    professional: "",
  };
  let publishedPodcastId: string;
  let draftPodcastId: string;
  let publishedChannelId: string;
  let draftChannelId: string;
  let publishedCourseSlug: string;

  const post = (query: string, authorization?: string) => {
    const call = request(app.getHttpServer()).post("/graphql");
    if (authorization) call.set("Authorization", `Bearer ${authorization}`);
    return call.send({ query }).expect(200);
  };

  const failureOf = async (query: string): Promise<Failure> => {
    const response = await post(query);
    expect(response.body.data).toBeNull();
    const [error] = response.body.errors;
    return { message: error.message, code: error.extensions?.code };
  };

  const idsOf = (body: { data: Record<string, unknown> }, field: string) => {
    const value = body.data[field] as
      | { items: { id: string }[] }
      | { id: string }[];
    return (Array.isArray(value) ? value : value.items).map((row) => row.id);
  };

  const rowOf = (kind: string, variant: Variant) => rows[kind][variant]!;

  const createUser = async (key: keyof typeof users, role: Role) => {
    const email = `${token}-${key}@e2e.example.test`;
    const user = await prisma.user.create({
      data: { email, role, status: UserStatus.ACTIVE },
    });
    users[key] = user.id;
    bearer[key] = signAccessToken(user.id, email, role);
  };

  const common = (variant: Variant, kind: string) => ({
    slug: `${token}-${kind}-${variant}`,
    title: `${token} ${kind} ${variant}`,
    description: `A ${variant} ${kind} used by the catalog boundary suite.`,
    deletedAt: variant === "deleted" ? new Date() : null,
    providerId: variant === "otherDraft" ? users.providerB : users.providerA,
  });

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

    await createUser("providerA", Role.PROVIDER);
    await createUser("providerB", Role.PROVIDER);
    await createUser("admin", Role.ADMIN);
    await createUser("professional", Role.PROFESSIONAL);

    for (const kind of KINDS) rows[kind.name] = {};

    for (const variant of KINDS[0].variants) {
      rows.course[variant] = await prisma.course.create({
        data: {
          ...common(variant, "course"),
          isFeatured: true,
          instructor: "Boundary Instructor",
          category: "TECHNOLOGY",
          status: STATUS_BY_VARIANT[variant] as "DRAFT",
        },
        select: { id: true, slug: true },
      });
    }
    for (const variant of KINDS[1].variants) {
      rows.event[variant] = await prisma.event.create({
        data: {
          ...common(variant, "event"),
          type: "WEBINAR",
          deliveryMode: "LIVE_ONLINE",
          category: "TECHNOLOGY",
          status: STATUS_BY_VARIANT[variant],
          startDate: new Date("2031-01-01T10:00:00.000Z"),
          isFree: true,
        },
        select: { id: true, slug: true },
      });
    }
    for (const variant of KINDS[2].variants) {
      rows.podcast[variant] = await prisma.podcast.create({
        data: {
          ...common(variant, "podcast"),
          isFeatured: true,
          host: "Boundary Host",
          category: "AI",
          status: STATUS_BY_VARIANT[variant] as "DRAFT",
        },
        select: { id: true, slug: true },
      });
    }
    for (const variant of KINDS[3].variants) {
      rows.youtube[variant] = await prisma.youTubeChannel.create({
        data: {
          ...common(variant, "youtube"),
          isFeatured: true,
          provider: "Boundary Provider",
          category: "DATA",
          status: STATUS_BY_VARIANT[variant] as "DRAFT",
        },
        select: { id: true, slug: true },
      });
    }

    publishedPodcastId = rowOf("podcast", "published").id;
    draftPodcastId = rowOf("podcast", "draft").id;
    publishedChannelId = rowOf("youtube", "published").id;
    draftChannelId = rowOf("youtube", "draft").id;
    publishedCourseSlug = rowOf("course", "published").slug;

    await prisma.podcastEpisode.createMany({
      data: [publishedPodcastId, draftPodcastId].map((podcastId) => ({
        podcastId,
        title: `${token} episode`,
        episodeNumber: 1,
      })),
    });
    await prisma.youTubeVideo.createMany({
      data: [
        {
          channelId: publishedChannelId,
          title: `${token} public video`,
          status: YouTubeVideoStatus.PUBLISHED,
        },
        {
          channelId: publishedChannelId,
          title: `${token} draft video`,
          status: YouTubeVideoStatus.DRAFT,
        },
        {
          channelId: draftChannelId,
          title: `${token} hidden channel video`,
          status: YouTubeVideoStatus.PUBLISHED,
        },
      ],
    });
    await prisma.curriculumSection.create({
      data: {
        courseId: rowOf("course", "published").id,
        title: `${token} section`,
        order: 1,
        lessons: { create: [{ title: `${token} lesson`, order: 1 }] },
      },
    });
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
      await prisma.user.deleteMany({
        where: { email: { startsWith: token } },
      });
    }
    await app?.close();
  }, 60_000);

  describe.each(KINDS)("$name detail", (kind) => {
    it("serves the published record by id and by slug", async () => {
      const published = rowOf(kind.name, "published");

      const byId = await post(kind.byId(published.id));
      const bySlug = await post(kind.bySlug(published.slug));

      expect(byId.body.errors).toBeUndefined();
      expect(bySlug.body.errors).toBeUndefined();
      expect(Object.values(byId.body.data)).toEqual([
        { id: published.id, slug: published.slug },
      ]);
      expect(Object.values(bySlug.body.data)).toEqual([
        { id: published.id, slug: published.slug },
      ]);
    });

    it.each(
      kind.variants.filter(
        (variant) => variant !== "published" && variant !== "otherDraft",
      ),
    )("answers a %s record exactly like an unknown one", async (variant) => {
      const hidden = rowOf(kind.name, variant);
      const unknownById = await failureOf(kind.byId(`${token}-unknown`));
      const unknownBySlug = await failureOf(kind.bySlug(`${token}-unknown`));

      expect(await failureOf(kind.byId(hidden.id))).toEqual(unknownById);
      expect(await failureOf(kind.bySlug(hidden.slug))).toEqual(unknownBySlug);
      expect(JSON.stringify(unknownById)).not.toContain(hidden.slug);
    });
  });

  describe.each(KINDS)("$name lists", (kind) => {
    it.each(["DRAFT", "ARCHIVED"])(
      "rejects an explicit %s status, with and without a search",
      async (status) => {
        for (const filter of [
          `{ status: ${status} }`,
          `{ status: ${status}, search: "${token}" }`,
        ]) {
          const response = await post(kind.list(filter));
          expect(response.body.errors[0].extensions.code).toBe("FORBIDDEN");
        }
      },
    );

    it.each(["", "status: PUBLISHED"])(
      "returns only the published record when searching with %j",
      async (status) => {
        const body = (
          await post(kind.list(`{ search: "${token}", ${status} }`))
        ).body;
        const field = Object.keys(body.data)[0];

        expect(idsOf(body, field)).toEqual([rowOf(kind.name, "published").id]);
      },
    );

    it("does not list hidden records without a search either", async () => {
      const body = (await post(kind.list("{}"))).body;
      const field = Object.keys(body.data)[0];
      const listed = idsOf(body, field);

      for (const variant of kind.variants.filter((v) => v !== "published"))
        expect(listed).not.toContain(rowOf(kind.name, variant).id);
    });

    it("keeps another provider's drafts out of a provider-filtered list", async () => {
      const body = (
        await post(kind.list(`{ providerId: "${users.providerB}" }`))
      ).body;
      const field = Object.keys(body.data)[0];

      expect(idsOf(body, field)).not.toContain(
        rowOf(kind.name, "otherDraft").id,
      );
    });
  });

  describe("event views", () => {
    const viewsOf = async (variant: Variant) =>
      (
        await prisma.event.findUniqueOrThrow({
          where: { id: rowOf("event", variant).id },
          select: { views: true },
        })
      ).views;

    it("does not count views when a detail record is read", async () => {
      const published = rowOf("event", "published");
      const before = await viewsOf("published");

      await post(KINDS[1].byId(published.id));
      await post(KINDS[1].bySlug(published.slug));

      expect(await viewsOf("published")).toBe(before);
    });

    it("counts an explicit view of a published event once per viewer", async () => {
      const published = rowOf("event", "published");
      const before = await viewsOf("published");
      const mutation = `mutation { recordEventView(eventId: "${published.id}") }`;

      const first = await post(mutation);
      const repeat = await post(mutation);

      expect(first.body.data.recordEventView).toBe(true);
      expect(repeat.body.data.recordEventView).toBe(false);
      expect(await viewsOf("published")).toBe(before + 1);
    });

    it.each(["draft", "deleted"] as const)(
      "counts nothing for a %s event",
      async (variant) => {
        const hidden = rowOf("event", variant);
        const before = await viewsOf(variant);

        const response = await post(
          `mutation { recordEventView(eventId: "${hidden.id}") }`,
        );

        expect(response.body.data.recordEventView).toBe(false);
        expect(await viewsOf(variant)).toBe(before);
      },
    );
  });

  describe("event lists", () => {
    it("rejects a cancelled status", async () => {
      const response = await post(KINDS[1].list("{ status: CANCELLED }"));

      expect(response.body.errors[0].extensions.code).toBe("FORBIDDEN");
    });
  });

  describe("featured lists", () => {
    it.each(KINDS.filter((kind) => kind.featured))(
      "$featured never discloses a hidden $name",
      async (kind) => {
        const body = (await post(`query { ${kind.featured}(take: 50) { id } }`))
          .body;
        const listed = idsOf(body, kind.featured!);

        for (const variant of kind.variants.filter((v) => v !== "published"))
          expect(listed).not.toContain(rowOf(kind.name, variant).id);
      },
    );

    it("never discloses a hidden upcoming event", async () => {
      const body = (await post(`query { upcomingEvents(take: 50) { id } }`))
        .body;
      const listed = idsOf(body, "upcomingEvents");

      for (const variant of KINDS[1].variants.filter((v) => v !== "published"))
        expect(listed).not.toContain(rowOf("event", variant).id);
    });
  });

  describe("children", () => {
    it("lists the episodes of a published podcast", async () => {
      const body = (
        await post(
          `query { podcastEpisodes(podcastId: "${publishedPodcastId}") { id } }`,
        )
      ).body;

      expect(body.errors).toBeUndefined();
      expect(body.data.podcastEpisodes).toHaveLength(1);
    });

    it.each([
      ["a draft podcast", () => draftPodcastId],
      ["an unknown podcast", () => `${token}-unknown`],
    ])("hides the episodes of %s", async (_label, resolveId) => {
      const unknown = await failureOf(
        `query { podcastEpisodes(podcastId: "${token}-unknown") { id } }`,
      );

      expect(
        await failureOf(
          `query { podcastEpisodes(podcastId: "${resolveId()}") { id } }`,
        ),
      ).toEqual(unknown);
    });

    it("lists only the published videos of a published channel", async () => {
      const body = (
        await post(
          `query { youtubeVideos(channelId: "${publishedChannelId}") { title status } }`,
        )
      ).body;

      expect(body.data.youtubeVideos).toEqual([
        { title: `${token} public video`, status: "PUBLISHED" },
      ]);
    });

    it("hides the videos of a draft channel", async () => {
      const unknown = await failureOf(
        `query { youtubeVideos(channelId: "${token}-unknown") { id } }`,
      );

      expect(
        await failureOf(
          `query { youtubeVideos(channelId: "${draftChannelId}") { id } }`,
        ),
      ).toEqual(unknown);
    });

    it("serves the curriculum of a published course", async () => {
      const body = (
        await post(
          `query { courseBySlug(slug: "${publishedCourseSlug}") { curriculumSections { lessons { id } } } }`,
        )
      ).body;

      expect(body.data.courseBySlug.curriculumSections).toHaveLength(1);
      expect(body.data.courseBySlug.curriculumSections[0].lessons).toHaveLength(
        1,
      );
    });
  });

  describe.each(KINDS)("$name management list", (kind) => {
    const draftList = (providerId?: string) =>
      kind.mine(
        providerId
          ? `{ status: DRAFT, providerId: "${providerId}" }`
          : `{ status: DRAFT }`,
      );
    const field = (body: { data: Record<string, unknown> }) =>
      Object.keys(body.data)[0];

    it("lets the owning provider read their own drafts only", async () => {
      for (const providerId of [undefined, users.providerB]) {
        const body = (await post(draftList(providerId), bearer.providerA)).body;
        const listed = idsOf(body, field(body));

        expect(listed).toContain(rowOf(kind.name, "draft").id);
        expect(listed).not.toContain(rowOf(kind.name, "otherDraft").id);
      }
    });

    it("lets an admin read another provider's drafts", async () => {
      const body = (await post(draftList(users.providerB), bearer.admin)).body;

      expect(idsOf(body, field(body))).toContain(
        rowOf(kind.name, "otherDraft").id,
      );
    });

    it("refuses an anonymous caller", async () => {
      const response = await post(draftList());

      expect(response.body.errors[0].extensions.code).toBe("UNAUTHENTICATED");
    });

    it("refuses a caller without the provider role", async () => {
      const response = await post(draftList(), bearer.professional);

      expect(response.body.errors[0].extensions.code).toBe("FORBIDDEN");
    });
  });
});
