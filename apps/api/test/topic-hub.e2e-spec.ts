import { CourseStatus, EventStatus, Role, UserStatus } from "@prisma/client";
import { SecurityApp, bootSecurityApp, errorCode } from "./setup/security";
import { openSession, signAccessToken } from "./setup/access-token";
import { runTogether } from "./setup/concurrency";

import request from "supertest";

const token = `hub10${Date.now().toString(36)}`;

const INTRODUCTION =
  "A short guide to choosing leadership learning that fits the stage of your career and the way you like to study.";
const GUIDANCE =
  "Start by naming the skill you want to change in the next quarter. Then compare formats: a live workshop gives feedback, a self-paced course gives flexibility, and a podcast fits the commute. Pick one item, finish it, and review what changed before choosing the next.";

const ADMIN_FIELDS = `id slug title status version linkCount eligibleLinkCount needsReview excludeFromIndex
  introduction guidance category sections { heading body }
  references { kind contentId slug title isEligible }
  translations { locale title introduction guidance isPublished version }`;

const SAVE = `mutation($input: SaveTopicHubInput!) {
  saveTopicHub(input: $input) { ${ADMIN_FIELDS} }
}`;
const STATUS = `mutation($input: SetTopicHubStatusInput!) {
  setTopicHubStatus(input: $input) { ${ADMIN_FIELDS} }
}`;
const TRANSLATION_PUBLICATION = `mutation($input: SetTopicHubTranslationPublicationInput!) {
  setTopicHubTranslationPublication(input: $input) { ${ADMIN_FIELDS} }
}`;
const EXCLUSION = `mutation($input: SetTopicHubIndexExclusionInput!) {
  setTopicHubIndexExclusion(input: $input) { id excludeFromIndex }
}`;
const ADMIN_LIST = `query { adminTopicHubs { id slug status needsReview eligibleLinkCount linkCount } }`;
const PUBLIC_HUB = `query($slug: String!, $locale: AppLanguage) {
  topicHubBySlug(slug: $slug, locale: $locale) {
    slug title introduction guidance category availableLocales contentLanguage
    excludeFromIndex sections { heading body }
    items { kind slug title summary }
  }
}`;
const PUBLIC_LIST = `query($locale: AppLanguage) { topicHubs(locale: $locale, take: 24) { slug title introduction } }`;
const FOR_CONTENT = `query($kind: ContentUrlKind!, $id: String!) {
  topicHubsForContent(kind: $kind, contentId: $id) { slug title }
}`;
const CHANGE_SLUG = `mutation($input: ChangeContentSlugInput!) {
  changeContentSlug(input: $input) { slug retiredSlugs }
}`;
const URL_SHARDS = `query {
  topicHubUrlShards { isComplete shards { index urlCount startCursor endCursor } }
}`;
const URL_PAGE = `query($start: String!) {
  topicHubUrlPage(input: { startCursor: $start, take: 100 }) {
    items { slug availableLocales }
  }
}`;
const RESOLVE = `query($kind: ContentUrlKind!, $slug: String!) {
  resolveContentUrl(kind: $kind, slug: $slug) { slug }
}`;

describe("Topic hubs (e2e)", () => {
  let ctx: SecurityApp;
  let admin: { id: string; bearer: string };
  let provider: { id: string; bearer: string };
  let professional: { id: string; bearer: string };
  let sequence = 0;
  const userIds: string[] = [];
  const hubIds: string[] = [];

  const word = (name: string) => `${token}-${name}-${(sequence += 1)}`;

  const call = (
    query: string,
    variables: Record<string, unknown>,
    bearer?: string,
  ) => {
    const req = request(ctx.app.getHttpServer()).post("/graphql");
    if (bearer) req.set("Authorization", `Bearer ${bearer}`);
    return req.send({ query, variables });
  };

  const makeUser = async (role: Role, name: string) => {
    const email = `${name}-${token}@topic-hub.e2e.test`;
    const user = await ctx.prisma.user.create({
      data: { email, role, status: UserStatus.ACTIVE },
    });
    userIds.push(user.id);
    await openSession(ctx.prisma, user.id);
    return { id: user.id, bearer: signAccessToken(user.id, email, role) };
  };

  const course = (
    name: string,
    status: CourseStatus = CourseStatus.PUBLISHED,
  ) =>
    ctx.prisma.course.create({
      data: {
        slug: word(name),
        title: `${token} course ${name}`,
        instructor: "Instructor",
        description: `Description for ${name}`,
        category: "LEADERSHIP",
        status,
        providerId: provider.id,
      },
    });

  const event = (name: string) =>
    ctx.prisma.event.create({
      data: {
        slug: word(name),
        title: `${token} event ${name}`,
        type: "WORKSHOP",
        deliveryMode: "LIVE_ONLINE",
        category: "LEADERSHIP",
        description: `Description for ${name}`,
        startDate: new Date("2031-03-01T10:00:00.000Z"),
        isFree: true,
        status: EventStatus.PUBLISHED,
        providerId: provider.id,
      },
    });

  const input = (overrides: Record<string, unknown> = {}) => ({
    locale: "EN",
    title: `${token} hub`,
    introduction: INTRODUCTION,
    guidance: GUIDANCE,
    sections: [
      { heading: "How to choose", body: "Compare format and effort." },
    ],
    category: "LEADERSHIP",
    ...overrides,
  });

  const createHub = async (
    references: { kind: string; contentId: string }[] = [],
    overrides: Record<string, unknown> = {},
  ) => {
    const response = await call(
      SAVE,
      { input: input({ slug: word("hub"), references, ...overrides }) },
      admin.bearer,
    );
    expect(response.body.errors).toBeUndefined();
    const hub = response.body.data.saveTopicHub;
    hubIds.push(hub.id);
    return hub as { id: string; slug: string; version: number };
  };

  const setStatus = (
    hub: { id: string },
    status: string,
    expectedVersion: number,
    bearer = admin.bearer,
  ) =>
    call(STATUS, { input: { hubId: hub.id, status, expectedVersion } }, bearer);

  const publicHub = async (slug: string, locale?: string) =>
    call(PUBLIC_HUB, { slug, locale });

  beforeAll(async () => {
    ctx = await bootSecurityApp();
    admin = await makeUser(Role.ADMIN, "admin");
    provider = await makeUser(Role.PROVIDER, "provider");
    professional = await makeUser(Role.PROFESSIONAL, "professional");
  }, 120_000);

  afterAll(async () => {
    if (ctx) {
      await ctx.prisma.topicHub.deleteMany({
        where: { title: { startsWith: token } },
      });
      await ctx.prisma.course.deleteMany({
        where: { title: { startsWith: token } },
      });
      await ctx.prisma.event.deleteMany({
        where: { title: { startsWith: token } },
      });
      await ctx.prisma.contentUrlClaim.deleteMany({
        where: { slug: { startsWith: token } },
      });
      await ctx.prisma.auditLog.deleteMany({
        where: { actorId: { in: userIds } },
      });
      await ctx.prisma.authSession.deleteMany({
        where: { userId: { in: userIds } },
      });
      await ctx.prisma.user.deleteMany({ where: { id: { in: userIds } } });
    }
    await ctx?.app.close();
  }, 60_000);

  describe("authorization", () => {
    it("lets only an administrator curate hubs", async () => {
      const deniedSlug = word("deny");
      const variables = { input: input({ slug: deniedSlug }) };
      expect(errorCode(await call(SAVE, variables))).toBe("UNAUTHENTICATED");
      for (const user of [provider, professional]) {
        const response = await call(SAVE, variables, user.bearer);
        expect(response.body.data?.saveTopicHub).toBeFalsy();
        expect(errorCode(response)).toBeDefined();
      }
      expect(
        await ctx.prisma.topicHub.count({
          where: { slug: deniedSlug },
        }),
      ).toBe(0);
      const list = await call(ADMIN_LIST, {}, provider.bearer);
      expect(list.body.data?.adminTopicHubs).toBeFalsy();
    });
  });

  describe("publication", () => {
    it("claims a hub slug in the shared registry and rejects a taken one", async () => {
      const hub = await createHub();
      const claim = await ctx.prisma.contentUrlClaim.findUnique({
        where: { namespace_slug: { namespace: "TOPIC", slug: hub.slug } },
      });
      expect(claim).toMatchObject({ targetId: hub.id, isCurrent: true });
      const duplicate = await call(
        SAVE,
        { input: input({ slug: hub.slug }) },
        admin.bearer,
      );
      expect(errorCode(duplicate)).toBe("CONTENT_URL_SLUG_TAKEN");
      const sameWord = await call(
        SAVE,
        { input: input({ slug: hub.slug.toUpperCase() }) },
        admin.bearer,
      );
      expect(errorCode(sameWord)).toBe("CONTENT_URL_SLUG_TAKEN");
    });

    it("refuses to publish a hub with no eligible link", async () => {
      const hub = await createHub();
      const draftCourse = await course("draft-only", CourseStatus.DRAFT);
      const withDraftLink = await createHub([
        { kind: "COURSE", contentId: draftCourse.id },
      ]);
      for (const candidate of [hub, withDraftLink]) {
        const response = await setStatus(
          candidate,
          "PUBLISHED",
          candidate.version,
        );
        expect(errorCode(response)).toBe("TOPIC_HUB_NO_ELIGIBLE_LINKS");
        expect(
          (
            await ctx.prisma.topicHub.findUniqueOrThrow({
              where: { id: candidate.id },
            })
          ).status,
        ).toBe("DRAFT");
      }
    });

    it("refuses to publish copy that is too thin", async () => {
      const linked = await course("thin-link");
      const hub = await createHub([{ kind: "COURSE", contentId: linked.id }], {
        introduction: "Too short.",
        guidance: "Also short.",
      });
      const response = await setStatus(hub, "PUBLISHED", hub.version);
      expect(errorCode(response)).toBe("TOPIC_HUB_INCOMPLETE_COPY");
      expect((await publicHub(hub.slug)).body.errors).toBeDefined();
    });

    it("publishes a reviewed hub and serves only eligible content in server data", async () => {
      const live = await course("live");
      const hidden = await course("hidden", CourseStatus.DRAFT);
      const live2 = await event("live-event");
      const hub = await createHub([
        { kind: "COURSE", contentId: live.id },
        { kind: "COURSE", contentId: hidden.id },
        { kind: "EVENT", contentId: live2.id },
      ]);
      expect((await publicHub(hub.slug)).body.errors).toBeDefined();

      const published = await setStatus(hub, "PUBLISHED", hub.version);
      expect(published.body.errors).toBeUndefined();
      expect(published.body.data.setTopicHubStatus).toMatchObject({
        status: "PUBLISHED",
        linkCount: 3,
        eligibleLinkCount: 2,
        needsReview: false,
      });

      const body = (await publicHub(hub.slug)).body.data.topicHubBySlug;
      expect(body.title).toBe(`${token} hub`);
      expect(body.sections).toEqual([
        { heading: "How to choose", body: "Compare format and effort." },
      ]);
      expect(body.items.map((item: { slug: string }) => item.slug)).toEqual([
        live.slug,
        live2.slug,
      ]);
      expect(JSON.stringify(body)).not.toContain(hidden.slug);
      expect(body.availableLocales).toEqual(["EN"]);

      const list = (await call(PUBLIC_LIST, {})).body.data.topicHubs;
      expect(list.map((entry: { slug: string }) => entry.slug)).toContain(
        hub.slug,
      );
      const linked = await call(FOR_CONTENT, { kind: "COURSE", id: live.id });
      expect(linked.body.data.topicHubsForContent).toEqual([
        expect.objectContaining({ slug: hub.slug }),
      ]);
    });

    it("keeps a substantive hub public, with an honest empty state and a review flag, when every link is lost", async () => {
      const linked = await course("soon-gone");
      const hub = await createHub([{ kind: "COURSE", contentId: linked.id }]);
      await setStatus(hub, "PUBLISHED", hub.version);
      await ctx.prisma.course.update({
        where: { id: linked.id },
        data: { status: CourseStatus.ARCHIVED },
      });

      const body = (await publicHub(hub.slug)).body.data.topicHubBySlug;
      expect(body.items).toEqual([]);
      expect(body.guidance).toBe(GUIDANCE);

      const list = (await call(ADMIN_LIST, {}, admin.bearer)).body.data
        .adminTopicHubs as { id: string; needsReview: boolean }[];
      expect(list.find((entry) => entry.id === hub.id)?.needsReview).toBe(true);
    });

    it("withdraws a hub from public view and publishes it again", async () => {
      const linked = await course("withdraw");
      const hub = await createHub([{ kind: "COURSE", contentId: linked.id }]);
      const published = await setStatus(hub, "PUBLISHED", hub.version);
      const version = published.body.data.setTopicHubStatus.version;
      const withdrawn = await setStatus(hub, "WITHDRAWN", version);
      expect(withdrawn.body.data.setTopicHubStatus.status).toBe("WITHDRAWN");
      expect((await publicHub(hub.slug)).body.errors).toBeDefined();
      expect(
        (await call(PUBLIC_LIST, {})).body.data.topicHubs.map(
          (entry: { slug: string }) => entry.slug,
        ),
      ).not.toContain(hub.slug);

      const again = await setStatus(
        hub,
        "PUBLISHED",
        withdrawn.body.data.setTopicHubStatus.version,
      );
      expect(again.body.data.setTopicHubStatus.status).toBe("PUBLISHED");
      expect((await publicHub(hub.slug)).body.errors).toBeUndefined();
    });

    it("rejects an invalid status transition and a stale version", async () => {
      const linked = await course("transition");
      const hub = await createHub([{ kind: "COURSE", contentId: linked.id }]);
      expect(errorCode(await setStatus(hub, "WITHDRAWN", hub.version))).toBe(
        "TOPIC_HUB_INVALID_STATE",
      );
      expect(
        errorCode(await setStatus(hub, "PUBLISHED", hub.version + 5)),
      ).toBe("TOPIC_HUB_VERSION_CONFLICT");
      expect(
        (await ctx.prisma.topicHub.findUniqueOrThrow({ where: { id: hub.id } }))
          .status,
      ).toBe("DRAFT");
    });
  });

  describe("editing", () => {
    it("rejects markup, oversize and unsupported input", async () => {
      const cases: [string, Record<string, unknown>][] = [
        [
          "markup",
          { introduction: `${INTRODUCTION} <script>alert(1)</script>` },
        ],
        ["empty title", { title: "   " }],
        ["category", { category: "NOT_A_CATEGORY" }],
        [
          "too many sections",
          {
            sections: Array.from({ length: 9 }, (_, index) => ({
              heading: `Heading ${index}`,
              body: "Body",
            })),
          },
        ],
        [
          "markup in a section",
          { sections: [{ heading: "Heading", body: "<img src=x onerror=1>" }] },
        ],
        [
          "too many references",
          {
            references: Array.from({ length: 49 }, (_, index) => ({
              kind: "COURSE",
              contentId: `missing-${index}`,
            })),
          },
        ],
        [
          "a hub as a reference kind",
          { references: [{ kind: "TOPIC", contentId: "x" }] },
        ],
      ];
      for (const [name, overrides] of cases) {
        const response = await call(
          SAVE,
          { input: input({ slug: word("bad"), ...overrides }) },
          admin.bearer,
        );
        expect([name, response.body.data?.saveTopicHub ?? null]).toEqual([
          name,
          null,
        ]);
      }
      expect(
        await ctx.prisma.topicHub.count({
          where: { slug: { startsWith: `${token}-bad` } },
        }),
      ).toBe(0);
    });

    it("keeps published copy complete and lets editors replace links", async () => {
      const first = await course("edit-first");
      const second = await course("edit-second");
      const hub = await createHub([{ kind: "COURSE", contentId: first.id }]);
      const published = (await setStatus(hub, "PUBLISHED", hub.version)).body
        .data.setTopicHubStatus;

      const thin = await call(
        SAVE,
        {
          input: input({
            hubId: hub.id,
            guidance: "Too short to keep a published page useful.",
            expectedVersion: published.version,
          }),
        },
        admin.bearer,
      );
      expect(errorCode(thin)).toBe("TOPIC_HUB_INCOMPLETE_COPY");

      const edited = await call(
        SAVE,
        {
          input: input({
            hubId: hub.id,
            title: `${token} hub renamed`,
            references: [
              { kind: "COURSE", contentId: second.id },
              { kind: "COURSE", contentId: first.id },
            ],
            expectedVersion: published.version,
          }),
        },
        admin.bearer,
      );
      expect(edited.body.errors).toBeUndefined();
      const body = (await publicHub(hub.slug)).body.data.topicHubBySlug;
      expect(body.title).toBe(`${token} hub renamed`);
      expect(body.items.map((item: { slug: string }) => item.slug)).toEqual([
        second.slug,
        first.slug,
      ]);
    });

    it("lets one of several simultaneous edits win and leaves one final state", async () => {
      const linked = await course("race-edit");
      const hub = await createHub([{ kind: "COURSE", contentId: linked.id }]);
      const outcomes = await runTogether(6, (index) =>
        call(
          SAVE,
          {
            input: input({
              hubId: hub.id,
              title: `${token} racer ${index}`,
              expectedVersion: hub.version,
            }),
          },
          admin.bearer,
        ),
      );
      const codes = outcomes.map((outcome) =>
        outcome.status === "fulfilled"
          ? (errorCode(outcome.value) ?? "OK")
          : "REJECTED",
      );
      expect(codes.filter((code) => code === "OK")).toHaveLength(1);
      expect(
        codes.filter((code) => code === "TOPIC_HUB_VERSION_CONFLICT"),
      ).toHaveLength(5);
      const row = await ctx.prisma.topicHub.findUniqueOrThrow({
        where: { id: hub.id },
        include: { references: true },
      });
      expect(row.version).toBe(hub.version + 1);
      expect(row.references).toHaveLength(1);
    });

    it("lets exactly one of a publish and an edit from the same version win", async () => {
      const linked = await course("race-publish");
      const hub = await createHub([{ kind: "COURSE", contentId: linked.id }]);
      const [publish, edit] = await runTogether(2, (index) =>
        index === 0
          ? setStatus(hub, "PUBLISHED", hub.version)
          : call(
              SAVE,
              {
                input: input({
                  hubId: hub.id,
                  title: `${token} raced edit`,
                  references: [],
                  expectedVersion: hub.version,
                }),
              },
              admin.bearer,
            ),
      );
      const codes = [publish, edit].map((outcome) =>
        outcome.status === "fulfilled"
          ? (errorCode(outcome.value) ?? "OK")
          : "REJECTED",
      );
      expect(codes.filter((code) => code === "OK")).toHaveLength(1);
      expect(codes).toContain("TOPIC_HUB_VERSION_CONFLICT");
      const row = await ctx.prisma.topicHub.findUniqueOrThrow({
        where: { id: hub.id },
        include: { references: true },
      });
      expect(row.version).toBe(hub.version + 1);
      if (row.status === "PUBLISHED") expect(row.references).toHaveLength(1);
      else expect(row.references).toHaveLength(0);
    });
  });

  describe("languages", () => {
    it("serves a French body only after it is saved and published", async () => {
      const linked = await course("french");
      const hub = await createHub([{ kind: "COURSE", contentId: linked.id }]);
      await setStatus(hub, "PUBLISHED", hub.version);

      const saved = await call(
        SAVE,
        {
          input: input({
            hubId: hub.id,
            locale: "FR",
            title: `${token} guide`,
            introduction: `${INTRODUCTION} En francais.`,
            guidance: `${GUIDANCE} En francais.`,
            sections: [],
          }),
        },
        admin.bearer,
      );
      expect(saved.body.errors).toBeUndefined();
      const translation = saved.body.data.saveTopicHub.translations[0];
      expect(translation).toMatchObject({ locale: "FR", isPublished: false });

      const hidden = (await publicHub(hub.slug, "FR")).body.data.topicHubBySlug;
      expect(hidden.availableLocales).toEqual(["EN"]);
      expect(hidden.title).toBe(`${token} hub`);
      expect(
        (await call(PUBLIC_LIST, { locale: "FR" })).body.data.topicHubs.map(
          (entry: { slug: string }) => entry.slug,
        ),
      ).not.toContain(hub.slug);

      const published = await call(
        TRANSLATION_PUBLICATION,
        {
          input: {
            hubId: hub.id,
            locale: "FR",
            published: true,
            expectedVersion: translation.version,
          },
        },
        admin.bearer,
      );
      expect(published.body.errors).toBeUndefined();
      const french = (await publicHub(hub.slug, "FR")).body.data.topicHubBySlug;
      expect(french.availableLocales).toEqual(["EN", "FR"]);
      expect(french.title).toBe(`${token} guide`);
      expect(french.contentLanguage).toBe("FR");
      expect(
        (await call(PUBLIC_LIST, { locale: "FR" })).body.data.topicHubs.map(
          (entry: { slug: string }) => entry.slug,
        ),
      ).toContain(hub.slug);

      const stale = await call(
        TRANSLATION_PUBLICATION,
        {
          input: {
            hubId: hub.id,
            locale: "FR",
            published: false,
            expectedVersion: translation.version,
          },
        },
        admin.bearer,
      );
      expect(errorCode(stale)).toBe("TOPIC_HUB_VERSION_CONFLICT");
    });

    it("refuses to publish a thin translation", async () => {
      const linked = await course("french-thin");
      const hub = await createHub([{ kind: "COURSE", contentId: linked.id }]);
      const saved = await call(
        SAVE,
        {
          input: input({
            hubId: hub.id,
            locale: "FR",
            introduction: "Court.",
            guidance: "Court aussi.",
          }),
        },
        admin.bearer,
      );
      const version = saved.body.data.saveTopicHub.translations[0].version;
      const response = await call(
        TRANSLATION_PUBLICATION,
        {
          input: {
            hubId: hub.id,
            locale: "FR",
            published: true,
            expectedVersion: version,
          },
        },
        admin.bearer,
      );
      expect(errorCode(response)).toBe("TOPIC_HUB_INCOMPLETE_COPY");
    });
  });

  describe("indexing and slug history", () => {
    it("lets only an administrator change indexing", async () => {
      const hub = await createHub();
      const denied = await call(
        EXCLUSION,
        { input: { hubId: hub.id, excluded: true } },
        provider.bearer,
      );
      expect(denied.body.data?.setTopicHubIndexExclusion).toBeFalsy();
      const changed = await call(
        EXCLUSION,
        { input: { hubId: hub.id, excluded: true } },
        admin.bearer,
      );
      expect(changed.body.data.setTopicHubIndexExclusion.excludeFromIndex).toBe(
        true,
      );
      expect(
        await ctx.prisma.auditLog.count({
          where: {
            entityId: hub.id,
            action: "TOPIC_HUB_INDEX_EXCLUSION_CHANGED",
          },
        }),
      ).toBe(1);
    });

    it("keeps old hub links resolving after an administrator changes the slug", async () => {
      const linked = await course("slug-history");
      const hub = await createHub([{ kind: "COURSE", contentId: linked.id }]);
      await setStatus(hub, "PUBLISHED", hub.version);
      const renamed = word("renamed-hub");

      const denied = await call(
        CHANGE_SLUG,
        {
          input: {
            kind: "TOPIC",
            contentId: hub.id,
            slug: renamed,
            expectedSlug: hub.slug,
          },
        },
        provider.bearer,
      );
      expect(errorCode(denied)).toBe("CONTENT_URL_ACCESS_DENIED");

      const changed = await call(
        CHANGE_SLUG,
        {
          input: {
            kind: "TOPIC",
            contentId: hub.id,
            slug: renamed,
            expectedSlug: hub.slug,
          },
        },
        admin.bearer,
      );
      expect(changed.body.data.changeContentSlug).toEqual({
        slug: renamed,
        retiredSlugs: [hub.slug],
      });
      const resolved = await call(RESOLVE, { kind: "TOPIC", slug: hub.slug });
      expect(resolved.body.data.resolveContentUrl).toEqual({ slug: renamed });
      expect((await publicHub(renamed)).body.errors).toBeUndefined();
      expect((await publicHub(hub.slug)).body.errors).toBeDefined();

      await setStatus(
        hub,
        "WITHDRAWN",
        (await ctx.prisma.topicHub.findUniqueOrThrow({ where: { id: hub.id } }))
          .version,
      );
      const hidden = await call(RESOLVE, { kind: "TOPIC", slug: hub.slug });
      expect(hidden.body.data.resolveContentUrl).toBeNull();
    });

    it("refuses direct writes that would reuse a retired hub slug", async () => {
      const hub = await createHub();
      const renamed = word("direct-renamed");
      await ctx.prisma.topicHub.update({
        where: { id: hub.id },
        data: { slug: renamed },
      });
      const second = await createHub();
      const failure = await ctx.prisma.topicHub
        .update({ where: { id: second.id }, data: { slug: hub.slug } })
        .then(
          () => null,
          (error: unknown) => error,
        );
      expect(failure).toMatchObject({ code: "P2002" });
    });
  });

  describe("sitemap enumeration", () => {
    it("lists only published, indexable hubs with their real locales", async () => {
      const linked = await course("sitemap");
      const refs = [{ kind: "COURSE", contentId: linked.id }];
      const live = await createHub(refs);
      await setStatus(live, "PUBLISHED", live.version);
      const draft = await createHub(refs);
      const withdrawn = await createHub(refs);
      const withdrawnVersion = (
        await setStatus(withdrawn, "PUBLISHED", withdrawn.version)
      ).body.data.setTopicHubStatus.version;
      await setStatus(withdrawn, "WITHDRAWN", withdrawnVersion);
      const excluded = await createHub(refs);
      await setStatus(excluded, "PUBLISHED", excluded.version);
      await call(
        EXCLUSION,
        { input: { hubId: excluded.id, excluded: true } },
        admin.bearer,
      );

      const french = await call(
        SAVE,
        {
          input: input({
            hubId: live.id,
            locale: "FR",
            title: `${token} guide`,
            introduction: `${INTRODUCTION} En francais.`,
            guidance: `${GUIDANCE} En francais.`,
          }),
        },
        admin.bearer,
      );
      await call(
        TRANSLATION_PUBLICATION,
        {
          input: {
            hubId: live.id,
            locale: "FR",
            published: true,
            expectedVersion:
              french.body.data.saveTopicHub.translations[0].version,
          },
        },
        admin.bearer,
      );

      const shards = (await call(URL_SHARDS, {})).body.data.topicHubUrlShards;
      expect(shards.isComplete).toBe(true);
      const items: { slug: string; availableLocales: string[] }[] = [];
      for (const shard of shards.shards) {
        const page = await call(URL_PAGE, { start: shard.startCursor });
        expect(page.body.errors).toBeUndefined();
        items.push(...page.body.data.topicHubUrlPage.items);
      }
      const bySlug = new Map(items.map((item) => [item.slug, item]));
      expect(bySlug.get(live.slug)?.availableLocales).toEqual(["EN", "FR"]);
      for (const absent of [draft, withdrawn, excluded])
        expect(bySlug.has(absent.slug)).toBe(false);
    });
  });

  describe("bounded reads", () => {
    it("returns every eligible link of a full hub from one request", async () => {
      const courses = await Promise.all(
        Array.from({ length: 24 }, (_, index) => course(`bulk-${index}`)),
      );
      const hub = await createHub(
        courses.map((entry) => ({ kind: "COURSE", contentId: entry.id })),
      );
      await setStatus(hub, "PUBLISHED", hub.version);
      const body = (await publicHub(hub.slug)).body.data.topicHubBySlug;
      expect(body.items).toHaveLength(24);
    });
  });
});
