import { ContentUrlNamespace, Role } from "@prisma/client";
import { CourseStatus, EventStatus, PodcastStatus } from "@prisma/client";
import { UserStatus, YouTubeChannelStatus } from "@prisma/client";
import { SecurityApp, bootSecurityApp, errorCode } from "./setup/security";
import { openSession, signAccessToken } from "./setup/access-token";
import { runTogether } from "./setup/concurrency";

import request from "supertest";

const token = `url09${Date.now().toString(36)}`;

const SETTINGS = `kind contentId slug retiredSlugs`;
const CONTENT_URL = `query($kind: ContentUrlKind!, $contentId: String!) {
  contentUrl(kind: $kind, contentId: $contentId) { ${SETTINGS} }
}`;
const CHANGE = `mutation($input: ChangeContentSlugInput!) {
  changeContentSlug(input: $input) { ${SETTINGS} }
}`;
const RESOLVE = `query($kind: ContentUrlKind!, $slug: String!) {
  resolveContentUrl(kind: $kind, slug: $slug) { slug }
}`;

type Created = { id: string; slug: string };

type KindConfig = {
  kind: ContentUrlNamespace;
  create: (name: string, providerId: string | null) => Promise<Created>;
  hide: (id: string) => Promise<unknown>;
  softDelete: (id: string) => Promise<unknown>;
  slugOf: (id: string) => Promise<string>;
  setSlug: (id: string, slug: string) => Promise<unknown>;
};

describe("Content slug history and redirects (e2e)", () => {
  let ctx: SecurityApp;
  let owner: { id: string; bearer: string };
  let stranger: { id: string; bearer: string };
  let admin: { id: string; bearer: string };
  let professional: { id: string; bearer: string };
  let sequence = 0;
  const userIds: string[] = [];

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
    const email = `${name}-${token}@content-url.e2e.test`;
    const user = await ctx.prisma.user.create({
      data: { email, role, status: UserStatus.ACTIVE },
    });
    userIds.push(user.id);
    await openSession(ctx.prisma, user.id);
    return { id: user.id, bearer: signAccessToken(user.id, email, role) };
  };

  const change = (
    config: KindConfig,
    created: { id: string },
    slug: string,
    expectedSlug: string,
    bearer = owner.bearer,
  ) =>
    call(
      CHANGE,
      {
        input: {
          kind: config.kind,
          contentId: created.id,
          slug,
          expectedSlug,
        },
      },
      bearer,
    );

  const resolve = async (config: KindConfig, slug: string) => {
    const response = await call(RESOLVE, { kind: config.kind, slug });
    return response.body.data?.resolveContentUrl?.slug ?? null;
  };

  const claims = (config: KindConfig, targetId: string) =>
    ctx.prisma.contentUrlClaim.findMany({
      where: { namespace: config.kind, targetId },
      orderBy: { createdAt: "asc" },
    });

  const configs = (): KindConfig[] => [
    {
      kind: ContentUrlNamespace.COURSE,
      create: (name, providerId) =>
        ctx.prisma.course.create({
          data: {
            slug: word(name),
            title: `${token} course`,
            instructor: "Instructor",
            description: "Description",
            category: "TECHNOLOGY",
            status: CourseStatus.PUBLISHED,
            providerId,
          },
        }),
      hide: (id) =>
        ctx.prisma.course.update({
          where: { id },
          data: { status: CourseStatus.DRAFT },
        }),
      softDelete: (id) =>
        ctx.prisma.course.update({
          where: { id },
          data: { deletedAt: new Date() },
        }),
      slugOf: async (id) =>
        (await ctx.prisma.course.findUniqueOrThrow({ where: { id } })).slug,
      setSlug: (id, slug) =>
        ctx.prisma.course.update({ where: { id }, data: { slug } }),
    },
    {
      kind: ContentUrlNamespace.EVENT,
      create: (name, providerId) =>
        ctx.prisma.event.create({
          data: {
            slug: word(name),
            title: `${token} event`,
            type: "WORKSHOP",
            deliveryMode: "LIVE_ONLINE",
            category: "TECHNOLOGY",
            description: "Description",
            startDate: new Date("2031-03-01T10:00:00.000Z"),
            isFree: true,
            status: EventStatus.PUBLISHED,
            providerId,
          },
        }),
      hide: (id) =>
        ctx.prisma.event.update({
          where: { id },
          data: { status: EventStatus.DRAFT },
        }),
      softDelete: (id) =>
        ctx.prisma.event.update({
          where: { id },
          data: { deletedAt: new Date() },
        }),
      slugOf: async (id) =>
        (await ctx.prisma.event.findUniqueOrThrow({ where: { id } })).slug,
      setSlug: (id, slug) =>
        ctx.prisma.event.update({ where: { id }, data: { slug } }),
    },
    {
      kind: ContentUrlNamespace.PODCAST,
      create: (name, providerId) =>
        ctx.prisma.podcast.create({
          data: {
            slug: word(name),
            title: `${token} podcast`,
            host: "Host",
            description: "Description",
            category: "TECHNOLOGY",
            status: PodcastStatus.PUBLISHED,
            providerId,
          },
        }),
      hide: (id) =>
        ctx.prisma.podcast.update({
          where: { id },
          data: { status: PodcastStatus.DRAFT },
        }),
      softDelete: (id) =>
        ctx.prisma.podcast.update({
          where: { id },
          data: { deletedAt: new Date() },
        }),
      slugOf: async (id) =>
        (await ctx.prisma.podcast.findUniqueOrThrow({ where: { id } })).slug,
      setSlug: (id, slug) =>
        ctx.prisma.podcast.update({ where: { id }, data: { slug } }),
    },
    {
      kind: ContentUrlNamespace.YOUTUBE,
      create: (name, providerId) =>
        ctx.prisma.youTubeChannel.create({
          data: {
            slug: word(name),
            title: `${token} channel`,
            description: "Description",
            provider: "Provider",
            category: "TECHNOLOGY",
            status: YouTubeChannelStatus.PUBLISHED,
            providerId,
          },
        }),
      hide: (id) =>
        ctx.prisma.youTubeChannel.update({
          where: { id },
          data: { status: YouTubeChannelStatus.DRAFT },
        }),
      softDelete: (id) =>
        ctx.prisma.youTubeChannel.update({
          where: { id },
          data: { deletedAt: new Date() },
        }),
      slugOf: async (id) =>
        (await ctx.prisma.youTubeChannel.findUniqueOrThrow({ where: { id } }))
          .slug,
      setSlug: (id, slug) =>
        ctx.prisma.youTubeChannel.update({ where: { id }, data: { slug } }),
    },
  ];

  beforeAll(async () => {
    ctx = await bootSecurityApp();
    owner = await makeUser(Role.PROVIDER, "owner");
    stranger = await makeUser(Role.PROVIDER, "stranger");
    admin = await makeUser(Role.ADMIN, "admin");
    professional = await makeUser(Role.PROFESSIONAL, "professional");
  }, 120_000);

  afterAll(async () => {
    if (ctx) {
      await ctx.prisma.course.deleteMany({
        where: { title: { startsWith: token } },
      });
      await ctx.prisma.event.deleteMany({
        where: { title: { startsWith: token } },
      });
      await ctx.prisma.podcast.deleteMany({
        where: { title: { startsWith: token } },
      });
      await ctx.prisma.youTubeChannel.deleteMany({
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

  describe.each(configs().map((config) => [config.kind, config] as const))(
    "%s",
    (_kind, config) => {
      it("claims the slug of every new record as its current URL", async () => {
        const created = await config.create("fresh", owner.id);
        const rows = await claims(config, created.id);
        expect(rows).toHaveLength(1);
        expect(rows[0]).toMatchObject({
          slug: created.slug,
          isCurrent: true,
          retiredAt: null,
        });
      });

      it("keeps the old link working through one current slug after a deliberate change", async () => {
        const created = await config.create("change", owner.id);
        const next = word("renamed");
        const response = await change(config, created, next, created.slug);
        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.changeContentSlug).toEqual({
          kind: config.kind,
          contentId: created.id,
          slug: next,
          retiredSlugs: [created.slug],
        });
        expect(await config.slugOf(created.id)).toBe(next);
        expect(await resolve(config, created.slug)).toBe(next);
        expect(await resolve(config, next)).toBe(next);
        const audit = await ctx.prisma.auditLog.findMany({
          where: { entityId: created.id, action: "CONTENT_SLUG_CHANGED" },
        });
        expect(audit).toHaveLength(1);
        expect(audit[0].metadata).toEqual({ from: created.slug, to: next });
      });

      it("points A to B to C straight at C and lets a record return to its own old slug", async () => {
        const created = await config.create("chain", owner.id);
        const first = created.slug;
        const second = word("second");
        const third = word("third");
        await change(config, created, second, first);
        await change(config, created, third, second);
        expect(await resolve(config, first)).toBe(third);
        expect(await resolve(config, second)).toBe(third);
        expect((await claims(config, created.id)).length).toBe(3);

        const back = await change(config, created, first, third);
        expect(back.body.errors).toBeUndefined();
        expect(await config.slugOf(created.id)).toBe(first);
        expect(await resolve(config, second)).toBe(first);
        expect(await resolve(config, third)).toBe(first);
        const rows = await claims(config, created.id);
        expect(rows).toHaveLength(3);
        expect(rows.filter((row) => row.isCurrent)).toHaveLength(1);
        expect(rows.find((row) => row.isCurrent)?.slug).toBe(first);
      });

      it("treats a repeat of a completed change as a no-op", async () => {
        const created = await config.create("repeat", owner.id);
        const next = word("repeat-next");
        await change(config, created, next, created.slug);
        const again = await change(config, created, next, created.slug);
        expect(again.body.errors).toBeUndefined();
        expect(again.body.data.changeContentSlug.slug).toBe(next);
        expect(
          await ctx.prisma.auditLog.count({
            where: { entityId: created.id, action: "CONTENT_SLUG_CHANGED" },
          }),
        ).toBe(1);
      });

      it("refuses a stale expected slug and leaves the record untouched", async () => {
        const created = await config.create("stale", owner.id);
        await change(config, created, word("moved"), created.slug);
        const before = await config.slugOf(created.id);
        const stale = await change(config, created, word("late"), created.slug);
        expect(errorCode(stale)).toBe("CONTENT_URL_VERSION_CONFLICT");
        expect(await config.slugOf(created.id)).toBe(before);
      });

      it.each([
        ["empty", ""],
        ["blank", "   "],
        ["path traversal", "../secret"],
        ["a path separator", "a/b"],
        ["an encoded separator", "a%2Fb"],
        ["an absolute URL", "https://evil.test/x"],
        ["a space", "two words"],
        ["a leading hyphen", "-edge"],
        ["a doubled hyphen", "edge--case"],
        ["a control character", "bad\u0000slug"],
        ["a non-ASCII letter", "café"],
        ["a reserved word", "new"],
        ["over-long input", "a".repeat(201)],
      ])("rejects %s as a slug", async (_name, slug) => {
        const created = await config.create("invalid", owner.id);
        const response = await change(config, created, slug, created.slug);
        expect(errorCode(response)).toBe("CONTENT_URL_INVALID_SLUG");
        expect(await config.slugOf(created.id)).toBe(created.slug);
      });

      it("lower-cases an otherwise valid slug", async () => {
        const created = await config.create("case", owner.id);
        const requested = word("Mixed-CASE");
        const response = await change(config, created, requested, created.slug);
        expect(response.body.data.changeContentSlug.slug).toBe(
          requested.toLowerCase(),
        );
      });

      it("refuses a slug that is current or retired for another record", async () => {
        const holder = await config.create("holder", owner.id);
        const mover = await config.create("mover", owner.id);
        const taken = await change(config, mover, holder.slug, mover.slug);
        expect(errorCode(taken)).toBe("CONTENT_URL_SLUG_TAKEN");

        const retiredWord = holder.slug;
        await change(config, holder, word("holder-next"), holder.slug);
        const reuse = await change(config, mover, retiredWord, mover.slug);
        expect(errorCode(reuse)).toBe("CONTENT_URL_SLUG_TAKEN");
        expect(await config.slugOf(mover.id)).toBe(mover.slug);
        expect(await resolve(config, retiredWord)).not.toBeNull();
      });

      it("refuses direct writes that would reuse a retired slug", async () => {
        const created = await config.create("direct", owner.id);
        await change(config, created, word("direct-next"), created.slug);
        const second = await config.create("victim", owner.id);
        const failure = await config.setSlug(second.id, created.slug).then(
          () => null,
          (error: unknown) => error,
        );
        expect(failure).toMatchObject({ code: "P2002" });
        expect(JSON.stringify((failure as { meta: unknown }).meta)).toContain(
          "slug",
        );
        expect(await config.slugOf(second.id)).toBe(second.slug);
        const rows = await claims(config, second.id);
        expect(rows).toHaveLength(1);
        expect(rows[0].isCurrent).toBe(true);
      });

      it("resolves two simultaneous claims of one slug to a single winner", async () => {
        const left = await config.create("race-left", owner.id);
        const right = await config.create("race-right", owner.id);
        const wanted = word("race-wanted");
        const outcomes = await runTogether(2, (index) =>
          change(
            config,
            index === 0 ? left : right,
            wanted,
            index === 0 ? left.slug : right.slug,
          ),
        );
        const codes = outcomes.map((outcome) =>
          outcome.status === "fulfilled"
            ? (errorCode(outcome.value) ?? "OK")
            : "REJECTED",
        );
        expect(codes.sort()).toEqual(["CONTENT_URL_SLUG_TAKEN", "OK"]);
        const holders = [
          await config.slugOf(left.id),
          await config.slugOf(right.id),
        ].filter((slug) => slug === wanted);
        expect(holders).toHaveLength(1);
        const rows = await ctx.prisma.contentUrlClaim.findMany({
          where: { namespace: config.kind, slug: wanted },
        });
        expect(rows).toHaveLength(1);
        for (const record of [left, right]) {
          const own = await claims(config, record.id);
          expect(own.filter((row) => row.isCurrent)).toHaveLength(1);
        }
      });

      it("lets one of several simultaneous edits of one record win", async () => {
        const created = await config.create("race-same", owner.id);
        const outcomes = await runTogether(6, (index) =>
          change(config, created, word(`race-same-${index}`), created.slug),
        );
        const codes = outcomes.map((outcome) =>
          outcome.status === "fulfilled"
            ? (errorCode(outcome.value) ?? "OK")
            : "REJECTED",
        );
        expect(codes.filter((code) => code === "OK")).toHaveLength(1);
        expect(
          codes.filter((code) => code === "CONTENT_URL_VERSION_CONFLICT"),
        ).toHaveLength(5);
        const rows = await claims(config, created.id);
        expect(rows.filter((row) => row.isCurrent)).toHaveLength(1);
        expect(rows.find((row) => row.isCurrent)?.slug).toBe(
          await config.slugOf(created.id),
        );
      });

      it("shares one word between different route namespaces", async () => {
        const created = await config.create("shared", owner.id);
        const sibling = configs().find((other) => other.kind !== config.kind)!;
        const other = await sibling.create("sibling", owner.id);
        const response = await change(sibling, other, created.slug, other.slug);
        expect(response.body.errors).toBeUndefined();
        expect(await sibling.slugOf(other.id)).toBe(created.slug);
        expect(await config.slugOf(created.id)).toBe(created.slug);
      });

      it("denies anonymous, wrong-role and wrong-owner callers and writes nothing", async () => {
        const created = await config.create("authz", owner.id);
        const wanted = word("authz-wanted");
        const anonymous = await call(CHANGE, {
          input: {
            kind: config.kind,
            contentId: created.id,
            slug: wanted,
            expectedSlug: created.slug,
          },
        });
        expect(errorCode(anonymous)).toBe("UNAUTHENTICATED");
        const wrongRole = await change(
          config,
          created,
          wanted,
          created.slug,
          professional.bearer,
        );
        expect(errorCode(wrongRole)).toBeDefined();
        expect(wrongRole.body.data?.changeContentSlug).toBeFalsy();
        const wrongOwner = await change(
          config,
          created,
          wanted,
          created.slug,
          stranger.bearer,
        );
        expect(errorCode(wrongOwner)).toBe("CONTENT_URL_ACCESS_DENIED");
        const read = await call(
          CONTENT_URL,
          { kind: config.kind, contentId: created.id },
          stranger.bearer,
        );
        expect(errorCode(read)).toBe("CONTENT_URL_ACCESS_DENIED");
        expect(await config.slugOf(created.id)).toBe(created.slug);
        expect(await resolve(config, wanted)).toBeNull();
      });

      it("lets an administrator change another provider's slug", async () => {
        const created = await config.create("admin", owner.id);
        const next = word("admin-next");
        const response = await change(
          config,
          created,
          next,
          created.slug,
          admin.bearer,
        );
        expect(response.body.errors).toBeUndefined();
        expect(await config.slugOf(created.id)).toBe(next);
      });

      it("answers an unknown or deleted record as not found", async () => {
        const unknown = await change(
          config,
          { id: "missing-record" },
          word("nowhere"),
          "anything",
        );
        expect(errorCode(unknown)).toBe("CONTENT_URL_NOT_FOUND");
        const removed = await config.create("removed", owner.id);
        await config.softDelete(removed.id);
        const response = await change(
          config,
          removed,
          word("removed-next"),
          removed.slug,
        );
        expect(errorCode(response)).toBe("CONTENT_URL_NOT_FOUND");
        expect(await config.slugOf(removed.id)).toBe(removed.slug);
      });

      it("never resolves an old path to hidden or deleted content", async () => {
        const hidden = await config.create("hidden", owner.id);
        const hiddenNext = word("hidden-next");
        await change(config, hidden, hiddenNext, hidden.slug);
        expect(await resolve(config, hidden.slug)).toBe(hiddenNext);
        await config.hide(hidden.id);
        expect(await resolve(config, hidden.slug)).toBeNull();
        expect(await resolve(config, hiddenNext)).toBeNull();

        const deleted = await config.create("deleted", owner.id);
        await change(config, deleted, word("deleted-next"), deleted.slug);
        await config.softDelete(deleted.id);
        expect(await resolve(config, deleted.slug)).toBeNull();
      });

      it("keeps a retired slug reserved after the record is soft deleted", async () => {
        const created = await config.create("tomb", owner.id);
        await change(config, created, word("tomb-next"), created.slug);
        await config.softDelete(created.id);
        const taker = await config.create("taker", owner.id);
        const response = await change(config, taker, created.slug, taker.slug);
        expect(errorCode(response)).toBe("CONTENT_URL_SLUG_TAKEN");
      });

      it("resolves nothing for malformed or unknown paths", async () => {
        for (const slug of [
          "../etc/passwd",
          "a%2Fb",
          "https://evil.test",
          "a".repeat(300),
          "does-not-exist-anywhere",
          "",
        ])
          expect(await resolve(config, slug)).toBeNull();
      });
    },
  );
});
