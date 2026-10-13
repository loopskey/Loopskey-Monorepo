import { CourseStatus, Role, UserStatus } from "@prisma/client";
import { SecurityApp, bootSecurityApp, errorCode } from "./setup/security";
import { openSession, signAccessToken } from "./setup/access-token";
import { runTogether } from "./setup/concurrency";

import request from "supertest";

const token = `prov10${Date.now().toString(36)}`;

const BIOGRAPHY =
  "We design practical leadership programmes for working professionals, with live cohorts, coaching and a library of short self-paced lessons.";
const PRIVATE_EMAIL = `private-${token}@contact.e2e.test`;

const OWN_FIELDS = `id slug status reviewState displayName biography websiteUrl logoImageId logoPath
  draftVersion submittedAt reviewedAt reviewNote publishedAt isLive hasUnpublishedChanges
  links { label url }`;
const ADMIN_FIELDS = `${OWN_FIELDS} providerId providerName excludeFromIndex withdrawnAt`;

const SAVE = `mutation($input: SaveProviderPublicProfileInput!) {
  saveProviderPublicProfile(input: $input) { ${OWN_FIELDS} }
}`;
const SUBMIT = `mutation($input: SubmitProviderPublicProfileInput!) {
  submitProviderPublicProfile(input: $input) { ${OWN_FIELDS} }
}`;
const WITHDRAW = `mutation { withdrawProviderPublicProfile { ${OWN_FIELDS} } }`;
const OWN = `query { myProviderPublicProfile { ${OWN_FIELDS} } }`;
const REVIEW = `mutation($input: ReviewProviderPublicProfileInput!) {
  reviewProviderPublicProfile(input: $input) { ${ADMIN_FIELDS} }
}`;
const ADMIN_WITHDRAW = `mutation($input: ModerateProviderPublicProfileInput!) {
  withdrawProviderPublicProfileAsAdmin(input: $input) { ${ADMIN_FIELDS} }
}`;
const EXCLUSION = `mutation($input: SetProviderPublicProfileIndexExclusionInput!) {
  setProviderPublicProfileIndexExclusion(input: $input) { id excludeFromIndex }
}`;
const ADMIN_LIST = `query($state: ProviderProfileReviewState) {
  adminProviderPublicProfiles(reviewState: $state) { ${ADMIN_FIELDS} }
}`;
const PUBLIC = `query($slug: String!) {
  providerPublicProfileBySlug(slug: $slug) {
    slug displayName biography logoPath websiteUrl excludeFromIndex
    links { label url }
    items { kind slug title summary }
  }
}`;
const BYLINE = `query($kind: ContentUrlKind!, $id: String!) {
  providerPublicBylineForContent(kind: $kind, contentId: $id) { slug displayName }
}`;
const URL_PAGE = `query($start: String!) {
  providerProfileUrlShards { shardSize isComplete shards { index urlCount startCursor endCursor } }
  page: providerProfileUrlPage(input: { startCursor: $start, take: 100 }) {
    items { slug availableLocales }
  }
}`;
const URL_SHARDS = `query {
  providerProfileUrlShards { shards { index urlCount startCursor endCursor } }
}`;
const CHANGE_SLUG = `mutation($input: ChangeContentSlugInput!) {
  changeContentSlug(input: $input) { slug retiredSlugs }
}`;
const RESOLVE = `query($kind: ContentUrlKind!, $slug: String!) {
  resolveContentUrl(kind: $kind, slug: $slug) { slug }
}`;

type Account = { id: string; email: string; bearer: string };

describe("Provider public profiles (e2e)", () => {
  let ctx: SecurityApp;
  let admin: Account;
  let professional: Account;
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

  const makeUser = async (role: Role, name: string): Promise<Account> => {
    const email = `${name}-${token}@provider-profile.e2e.test`;
    const user = await ctx.prisma.user.create({
      data: { email, role, status: UserStatus.ACTIVE, fullName: name },
    });
    userIds.push(user.id);
    await openSession(ctx.prisma, user.id);
    return {
      id: user.id,
      email,
      bearer: signAccessToken(user.id, email, role),
    };
  };

  const makeProvider = async (name: string) => {
    const account = await makeUser(Role.PROVIDER, name);
    await ctx.prisma.providerSettings.create({
      data: {
        providerId: account.id,
        contactEmail: PRIVATE_EMAIL,
        organizationName: `${token} private organization`,
        aboutOrganization: `${token} private about`,
      },
    });
    return account;
  };

  const course = (
    owner: Account,
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
        providerId: owner.id,
      },
    });

  const logo = (owner: Account) =>
    ctx.prisma.contentSocialImage.create({
      data: {
        ownerId: owner.id,
        storageKey: `${token}-${(sequence += 1)}.png`,
        mimeType: "image/png",
        sizeBytes: 100,
      },
    });

  const draftInput = (overrides: Record<string, unknown> = {}) => ({
    displayName: `${token} Studio ${(sequence += 1)}`,
    biography: BIOGRAPHY,
    websiteUrl: "https://studio.example.com/about",
    links: [{ label: "Profile", url: "https://profile.example.com/studio" }],
    ...overrides,
  });

  const save = (owner: Account, overrides: Record<string, unknown> = {}) =>
    call(SAVE, { input: draftInput(overrides) }, owner.bearer);

  const draftOf = async (owner: Account, overrides = {}) => {
    const response = await save(owner, overrides);
    expect(response.body.errors).toBeUndefined();
    return response.body.data.saveProviderPublicProfile as {
      id: string;
      slug: string;
      draftVersion: number;
    };
  };

  const submit = (owner: Account, expectedVersion: number) =>
    call(SUBMIT, { input: { expectedVersion } }, owner.bearer);

  const review = (
    profile: { id: string },
    decision: string,
    expectedDraftVersion: number,
    note?: string,
    bearer = admin.bearer,
  ) =>
    call(
      REVIEW,
      {
        input: { profileId: profile.id, decision, expectedDraftVersion, note },
      },
      bearer,
    );

  const publish = async (owner: Account, overrides = {}) => {
    const draft = await draftOf(owner, overrides);
    expect(
      (await submit(owner, draft.draftVersion)).body.errors,
    ).toBeUndefined();
    const reviewed = await review(draft, "APPROVE", draft.draftVersion);
    expect(reviewed.body.errors).toBeUndefined();
    return draft;
  };

  const publicProfile = (slug: string) => call(PUBLIC, { slug });

  const codeOf = (outcome: PromiseSettledResult<request.Response>) =>
    outcome.status === "fulfilled"
      ? (errorCode(outcome.value) ?? "OK")
      : "REJECTED";

  beforeAll(async () => {
    ctx = await bootSecurityApp();
    admin = await makeUser(Role.ADMIN, "admin");
    professional = await makeUser(Role.PROFESSIONAL, "professional");
  }, 120_000);

  afterAll(async () => {
    if (ctx) {
      await ctx.prisma.providerPublicProfile.deleteMany({
        where: { providerId: { in: userIds } },
      });
      await ctx.prisma.course.deleteMany({
        where: { title: { startsWith: token } },
      });
      await ctx.prisma.contentSocialImage.deleteMany({
        where: { ownerId: { in: userIds } },
      });
      await ctx.prisma.contentUrlClaim.deleteMany({
        where: { slug: { contains: token.toLowerCase() } },
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
    it("lets only providers edit their own draft and only administrators review", async () => {
      const owner = await makeProvider("auth-owner");
      const input = { input: draftInput() };
      expect(errorCode(await call(SAVE, input))).toBe("UNAUTHENTICATED");
      for (const user of [admin, professional]) {
        const response = await call(SAVE, input, user.bearer);
        expect(response.body.data?.saveProviderPublicProfile).toBeFalsy();
      }
      expect(
        await ctx.prisma.providerPublicProfile.count({
          where: { providerId: { in: [admin.id, professional.id] } },
        }),
      ).toBe(0);

      const draft = await draftOf(owner);
      await submit(owner, draft.draftVersion);
      for (const user of [owner, professional]) {
        const response = await review(
          draft,
          "APPROVE",
          draft.draftVersion,
          undefined,
          user.bearer,
        );
        expect(response.body.data?.reviewProviderPublicProfile).toBeFalsy();
      }
      expect(
        (await call(ADMIN_LIST, {}, owner.bearer)).body.data
          ?.adminProviderPublicProfiles,
      ).toBeFalsy();
      const row = await ctx.prisma.providerPublicProfile.findUniqueOrThrow({
        where: { id: draft.id },
      });
      expect(row).toMatchObject({
        status: "UNPUBLISHED",
        reviewState: "SUBMITTED",
      });
    });

    it("never lets one provider read or change another provider's profile", async () => {
      const first = await makeProvider("iso-first");
      const second = await makeProvider("iso-second");
      const draft = await draftOf(first);
      const own = await call(OWN, {}, second.bearer);
      expect(own.body.data.myProviderPublicProfile).toBeNull();
      const seen = await call(OWN, {}, first.bearer);
      expect(seen.body.data.myProviderPublicProfile.id).toBe(draft.id);

      const edit = await save(second, { displayName: `${token} Second` });
      const created = edit.body.data.saveProviderPublicProfile;
      expect(created.id).not.toBe(draft.id);
      const stillFirst =
        await ctx.prisma.providerPublicProfile.findUniqueOrThrow({
          where: { id: draft.id },
        });
      expect(stillFirst.providerId).toBe(first.id);
      expect(stillFirst.draftVersion).toBe(draft.draftVersion);
    });
  });

  describe("draft", () => {
    it("creates a private draft with a claimed slug and no public page", async () => {
      const owner = await makeProvider("draft");
      const draft = await draftOf(owner);
      const claim = await ctx.prisma.contentUrlClaim.findUnique({
        where: { namespace_slug: { namespace: "PROVIDER", slug: draft.slug } },
      });
      expect(claim).toMatchObject({ targetId: draft.id, isCurrent: true });
      expect((await publicProfile(draft.slug)).body.errors).toBeDefined();
      const own = (await call(OWN, {}, owner.bearer)).body.data
        .myProviderPublicProfile;
      expect(own).toMatchObject({
        status: "UNPUBLISHED",
        reviewState: "DRAFT",
        isLive: false,
        draftVersion: 1,
      });
    });

    it("rejects markup, unsafe links, oversize and bad logo input", async () => {
      const owner = await makeProvider("invalid");
      const other = await makeProvider("invalid-other");
      const foreignLogo = await logo(other);
      const cases: [string, Record<string, unknown>][] = [
        ["markup name", { displayName: "<b>Studio</b>" }],
        ["blank name", { displayName: "   " }],
        ["markup biography", { biography: `${BIOGRAPHY} <script>x</script>` }],
        ["javascript website", { websiteUrl: "javascript:alert(1)" }],
        ["ftp website", { websiteUrl: "ftp://files.example.com" }],
        [
          "credentials in website",
          { websiteUrl: "https://user:pass@example.com" },
        ],
        ["localhost website", { websiteUrl: "http://localhost:3000" }],
        ["ip website", { websiteUrl: "http://10.0.0.5/admin" }],
        [
          "bad link scheme",
          { links: [{ label: "x", url: "data:text/html,boom" }] },
        ],
        [
          "markup link label",
          { links: [{ label: "<i>x</i>", url: "https://ok.example.com" }] },
        ],
        [
          "too many links",
          {
            links: Array.from({ length: 6 }, (_, index) => ({
              label: `Link ${index}`,
              url: `https://link${index}.example.com`,
            })),
          },
        ],
        ["foreign logo", { logoImageId: foreignLogo.id }],
        ["unknown logo", { logoImageId: "does-not-exist" }],
      ];
      for (const [name, overrides] of cases) {
        const response = await save(owner, overrides);
        expect([
          name,
          response.body.data?.saveProviderPublicProfile ?? null,
        ]).toEqual([name, null]);
      }
      expect(
        await ctx.prisma.providerPublicProfile.count({
          where: { providerId: owner.id },
        }),
      ).toBe(0);
    });

    it("accepts the provider's own logo and keeps it private until approval", async () => {
      const owner = await makeProvider("logo");
      const image = await logo(owner);
      const draft = await draftOf(owner, { logoImageId: image.id });
      const own = (await call(OWN, {}, owner.bearer)).body.data
        .myProviderPublicProfile;
      expect(own.logoImageId).toBe(image.id);
      expect(own.logoPath).toContain(image.id);
      expect((await publicProfile(draft.slug)).body.errors).toBeDefined();
    });

    it("resolves two simultaneous first saves to one profile", async () => {
      const owner = await makeProvider("first-race");
      const outcomes = await runTogether(4, (index) =>
        save(owner, { displayName: `${token} Race ${index}` }),
      );
      const codes = outcomes.map(codeOf);
      expect(codes.filter((code) => code === "OK")).toHaveLength(1);
      expect(
        codes.filter((code) => code === "PROVIDER_PROFILE_VERSION_CONFLICT"),
      ).toHaveLength(3);
      expect(
        await ctx.prisma.providerPublicProfile.count({
          where: { providerId: owner.id },
        }),
      ).toBe(1);
    });

    it("requires the expected version for edits and refuses a stale one", async () => {
      const owner = await makeProvider("version");
      const draft = await draftOf(owner);
      expect(errorCode(await save(owner))).toBe(
        "PROVIDER_PROFILE_VERSION_CONFLICT",
      );
      const edited = await save(owner, { expectedVersion: draft.draftVersion });
      expect(edited.body.data.saveProviderPublicProfile.draftVersion).toBe(
        draft.draftVersion + 1,
      );
      const stale = await save(owner, { expectedVersion: draft.draftVersion });
      expect(errorCode(stale)).toBe("PROVIDER_PROFILE_VERSION_CONFLICT");
    });
  });

  describe("review", () => {
    it("refuses to submit an incomplete draft", async () => {
      const owner = await makeProvider("incomplete");
      const draft = await draftOf(owner, { biography: "Too short." });
      const response = await submit(owner, draft.draftVersion);
      expect(errorCode(response)).toBe("PROVIDER_PROFILE_INCOMPLETE");
      expect(
        (
          await ctx.prisma.providerPublicProfile.findUniqueOrThrow({
            where: { id: draft.id },
          })
        ).reviewState,
      ).toBe("DRAFT");
    });

    it("submits once, treats a repeat as the same request and refuses a stale version", async () => {
      const owner = await makeProvider("submit");
      const draft = await draftOf(owner);
      expect(
        (await submit(owner, draft.draftVersion)).body.data
          .submitProviderPublicProfile.reviewState,
      ).toBe("SUBMITTED");
      expect(
        (await submit(owner, draft.draftVersion)).body.errors,
      ).toBeUndefined();
      expect(errorCode(await submit(owner, draft.draftVersion + 3))).toBe(
        "PROVIDER_PROFILE_VERSION_CONFLICT",
      );
      const queue = (
        await call(ADMIN_LIST, { state: "SUBMITTED" }, admin.bearer)
      ).body.data.adminProviderPublicProfiles as { id: string }[];
      expect(queue.some((entry) => entry.id === draft.id)).toBe(true);
    });

    it("publishes only on explicit approval and exposes only approved public fields", async () => {
      const owner = await makeProvider("approve");
      const stranger = await makeProvider("approve-stranger");
      const image = await logo(owner);
      const own = await course(owner, "own-live");
      const hidden = await course(owner, "own-draft", CourseStatus.DRAFT);
      const foreign = await course(stranger, "foreign-live");
      const draft = await draftOf(owner, { logoImageId: image.id });
      await submit(owner, draft.draftVersion);
      expect((await publicProfile(draft.slug)).body.errors).toBeDefined();

      const reviewed = await review(draft, "APPROVE", draft.draftVersion);
      expect(reviewed.body.data.reviewProviderPublicProfile).toMatchObject({
        status: "PUBLISHED",
        reviewState: "APPROVED",
        isLive: true,
        hasUnpublishedChanges: false,
      });

      const body = (await publicProfile(draft.slug)).body.data
        .providerPublicProfileBySlug;
      expect(Object.keys(body).sort()).toEqual(
        [
          "biography",
          "displayName",
          "excludeFromIndex",
          "items",
          "links",
          "logoPath",
          "slug",
          "websiteUrl",
        ].sort(),
      );
      expect(body.websiteUrl).toBe("https://studio.example.com/about");
      expect(body.logoPath).toContain(image.id);
      expect(body.items.map((item: { slug: string }) => item.slug)).toEqual([
        own.slug,
      ]);
      const serialised = JSON.stringify(body);
      for (const secret of [
        PRIVATE_EMAIL,
        `${token} private`,
        hidden.slug,
        foreign.slug,
        owner.id,
        owner.email,
      ])
        expect(serialised).not.toContain(secret);

      const probe = await call(
        `query($slug: String!) { providerPublicProfileBySlug(slug: $slug) { contactEmail } }`,
        { slug: draft.slug },
      );
      expect(probe.body.errors).toBeDefined();
      expect(probe.body.data).toBeFalsy();
    });

    it("sends a rejected draft back with a private note that never reaches the public page", async () => {
      const owner = await makeProvider("reject");
      const draft = await draftOf(owner);
      await submit(owner, draft.draftVersion);
      const rejected = await review(
        draft,
        "REJECT",
        draft.draftVersion,
        "Please describe your programmes.",
      );
      expect(rejected.body.data.reviewProviderPublicProfile).toMatchObject({
        reviewState: "REJECTED",
        status: "UNPUBLISHED",
      });
      const own = (await call(OWN, {}, owner.bearer)).body.data
        .myProviderPublicProfile;
      expect(own.reviewNote).toBe("Please describe your programmes.");
      expect((await publicProfile(draft.slug)).body.errors).toBeDefined();
      expect(
        (await submit(owner, draft.draftVersion)).body.errors,
      ).toBeUndefined();
    });

    it("keeps unreviewed edits private while the approved revision stays live", async () => {
      const owner = await makeProvider("live-edit");
      const draft = await publish(owner, { displayName: `${token} Original` });
      const edited = await save(owner, {
        displayName: `${token} Edited unreviewed`,
        biography: `${BIOGRAPHY} Extra unreviewed sentence.`,
        expectedVersion: draft.draftVersion,
      });
      expect(edited.body.data.saveProviderPublicProfile).toMatchObject({
        status: "PUBLISHED",
        reviewState: "DRAFT",
        hasUnpublishedChanges: true,
      });
      const live = (await publicProfile(draft.slug)).body.data
        .providerPublicProfileBySlug;
      expect(live.displayName).toBe(`${token} Original`);
      expect(live.biography).toBe(BIOGRAPHY);

      const version = edited.body.data.saveProviderPublicProfile.draftVersion;
      await submit(owner, version);
      const approved = await review(draft, "APPROVE", version);
      expect(approved.body.errors).toBeUndefined();
      const updated = (await publicProfile(draft.slug)).body.data
        .providerPublicProfileBySlug;
      expect(updated.displayName).toBe(`${token} Edited unreviewed`);
      expect(
        await ctx.prisma.providerPublicRevision.count({
          where: { profileId: draft.id },
        }),
      ).toBe(2);
    });

    it("refuses an approval of a draft that changed after submission", async () => {
      const owner = await makeProvider("stale-approval");
      const draft = await draftOf(owner);
      await submit(owner, draft.draftVersion);
      await save(owner, { expectedVersion: draft.draftVersion });
      const response = await review(draft, "APPROVE", draft.draftVersion);
      expect(errorCode(response)).toBe("PROVIDER_PROFILE_VERSION_CONFLICT");
      const row = await ctx.prisma.providerPublicProfile.findUniqueOrThrow({
        where: { id: draft.id },
      });
      expect(row).toMatchObject({
        status: "UNPUBLISHED",
        reviewState: "DRAFT",
      });
      expect(
        await ctx.prisma.providerPublicRevision.count({
          where: { profileId: draft.id },
        }),
      ).toBe(0);
    });

    it("lets exactly one of an approval and an edit from the same version win", async () => {
      const owner = await makeProvider("approve-race");
      const draft = await draftOf(owner);
      await submit(owner, draft.draftVersion);
      const outcomes = await runTogether(2, (index) =>
        index === 0
          ? review(draft, "APPROVE", draft.draftVersion)
          : save(owner, {
              displayName: `${token} Raced edit`,
              expectedVersion: draft.draftVersion,
            }),
      );
      const [approval, edit] = outcomes.map(codeOf);
      const row = await ctx.prisma.providerPublicProfile.findUniqueOrThrow({
        where: { id: draft.id },
      });
      const revisions = await ctx.prisma.providerPublicRevision.findMany({
        where: { profileId: draft.id },
      });
      if (approval === "OK") {
        expect(row.status).toBe("PUBLISHED");
        expect(revisions).toHaveLength(1);
        expect(revisions[0].displayName).not.toBe(`${token} Raced edit`);
        expect(["OK", "PROVIDER_PROFILE_VERSION_CONFLICT"]).toContain(edit);
      } else {
        expect(approval).toBe("PROVIDER_PROFILE_VERSION_CONFLICT");
        expect(edit).toBe("OK");
        expect(row.status).toBe("UNPUBLISHED");
        expect(revisions).toHaveLength(0);
      }
    });

    it("ends withdrawn whichever of a withdrawal and a pending approval lands first", async () => {
      const owner = await makeProvider("withdraw-race");
      const draft = await publish(owner);
      const edited = await save(owner, { expectedVersion: draft.draftVersion });
      const version = edited.body.data.saveProviderPublicProfile.draftVersion;
      await submit(owner, version);
      const outcomes = await runTogether(2, (index) =>
        index === 0
          ? review(draft, "APPROVE", version)
          : call(WITHDRAW, {}, owner.bearer),
      );
      const [approval, withdrawal] = outcomes.map(codeOf);
      expect(withdrawal).toBe("OK");
      expect(["OK", "PROVIDER_PROFILE_VERSION_CONFLICT"]).toContain(approval);
      const row = await ctx.prisma.providerPublicProfile.findUniqueOrThrow({
        where: { id: draft.id },
      });
      expect(row.status).toBe("WITHDRAWN");
      const revisions = await ctx.prisma.providerPublicRevision.count({
        where: { profileId: draft.id },
      });
      expect(revisions).toBe(approval === "OK" ? 2 : 1);
      expect((await publicProfile(draft.slug)).body.errors).toBeDefined();
    });
  });

  describe("withdrawal and moderation", () => {
    it("lets the provider withdraw and requires a fresh approval to return", async () => {
      const owner = await makeProvider("withdraw");
      const draft = await publish(owner);
      const withdrawn = await call(WITHDRAW, {}, owner.bearer);
      expect(withdrawn.body.data.withdrawProviderPublicProfile).toMatchObject({
        status: "WITHDRAWN",
        isLive: false,
      });
      expect((await publicProfile(draft.slug)).body.errors).toBeDefined();
      expect(errorCode(await call(WITHDRAW, {}, owner.bearer))).toBe(
        "PROVIDER_PROFILE_INVALID_STATE",
      );

      const edited = await save(owner, { expectedVersion: draft.draftVersion });
      expect((await publicProfile(draft.slug)).body.errors).toBeDefined();
      const version = edited.body.data.saveProviderPublicProfile.draftVersion;
      await submit(owner, version);
      await review(draft, "APPROVE", version);
      expect((await publicProfile(draft.slug)).body.errors).toBeUndefined();
    });

    it("lets an administrator withdraw a profile and change indexing", async () => {
      const owner = await makeProvider("moderate");
      const draft = await publish(owner);
      const denied = await call(
        EXCLUSION,
        { input: { profileId: draft.id, excluded: true } },
        owner.bearer,
      );
      expect(
        denied.body.data?.setProviderPublicProfileIndexExclusion,
      ).toBeFalsy();
      await call(
        EXCLUSION,
        { input: { profileId: draft.id, excluded: true } },
        admin.bearer,
      );
      expect(
        (await publicProfile(draft.slug)).body.data.providerPublicProfileBySlug
          .excludeFromIndex,
      ).toBe(true);

      const ownerAttempt = await call(
        ADMIN_WITHDRAW,
        { input: { profileId: draft.id } },
        owner.bearer,
      );
      expect(
        ownerAttempt.body.data?.withdrawProviderPublicProfileAsAdmin,
      ).toBeFalsy();
      const moderated = await call(
        ADMIN_WITHDRAW,
        { input: { profileId: draft.id, note: "Policy review" } },
        admin.bearer,
      );
      expect(
        moderated.body.data.withdrawProviderPublicProfileAsAdmin.status,
      ).toBe("WITHDRAWN");
      expect((await publicProfile(draft.slug)).body.errors).toBeDefined();
    });
  });

  describe("account eligibility", () => {
    it("hides the profile while the provider account is suspended or deleted", async () => {
      const owner = await makeProvider("eligibility");
      const draft = await publish(owner);
      expect((await publicProfile(draft.slug)).body.errors).toBeUndefined();

      await ctx.prisma.user.update({
        where: { id: owner.id },
        data: { status: UserStatus.DISABLED },
      });
      expect((await publicProfile(draft.slug)).body.errors).toBeDefined();
      expect(
        (await call(RESOLVE, { kind: "PROVIDER", slug: draft.slug })).body.data
          .resolveContentUrl,
      ).toBeNull();

      await ctx.prisma.user.update({
        where: { id: owner.id },
        data: { status: UserStatus.ACTIVE, deletedAt: new Date() },
      });
      expect((await publicProfile(draft.slug)).body.errors).toBeDefined();

      await ctx.prisma.user.update({
        where: { id: owner.id },
        data: { deletedAt: null },
      });
      expect((await publicProfile(draft.slug)).body.errors).toBeUndefined();
    });

    it("refuses to approve a profile of a suspended provider", async () => {
      const owner = await makeProvider("suspended-approve");
      const draft = await draftOf(owner);
      await submit(owner, draft.draftVersion);
      await ctx.prisma.user.update({
        where: { id: owner.id },
        data: { status: UserStatus.DISABLED },
      });
      const response = await review(draft, "APPROVE", draft.draftVersion);
      expect(errorCode(response)).toBe("PROVIDER_PROFILE_INVALID_STATE");
    });
  });

  describe("slug history and discovery", () => {
    it("keeps old profile links working after an administrator changes the slug", async () => {
      const owner = await makeProvider("slug");
      const draft = await publish(owner);
      const renamed = word("renamed-profile");
      const input = {
        input: {
          kind: "PROVIDER",
          contentId: draft.id,
          slug: renamed,
          expectedSlug: draft.slug,
        },
      };
      expect(errorCode(await call(CHANGE_SLUG, input, owner.bearer))).toBe(
        "CONTENT_URL_ACCESS_DENIED",
      );
      const changed = await call(CHANGE_SLUG, input, admin.bearer);
      expect(changed.body.data.changeContentSlug).toEqual({
        slug: renamed,
        retiredSlugs: [draft.slug],
      });
      expect(
        (await call(RESOLVE, { kind: "PROVIDER", slug: draft.slug })).body.data
          .resolveContentUrl,
      ).toEqual({ slug: renamed });
      expect((await publicProfile(renamed)).body.errors).toBeUndefined();
      expect((await publicProfile(draft.slug)).body.errors).toBeDefined();
    });

    it("lists only live, eligible, indexable profiles for the sitemap", async () => {
      const live = await makeProvider("sitemap-live");
      const draft = await makeProvider("sitemap-draft");
      const hidden = await makeProvider("sitemap-hidden");
      const livePublished = await publish(live);
      const draftOnly = await draftOf(draft);
      const hiddenPublished = await publish(hidden);
      await call(
        EXCLUSION,
        { input: { profileId: hiddenPublished.id, excluded: true } },
        admin.bearer,
      );

      const slugs: string[] = [];
      const shards = (await call(URL_SHARDS, {})).body.data
        .providerProfileUrlShards.shards as { startCursor: string }[];
      for (const shard of shards) {
        const page = await call(URL_PAGE, { start: shard.startCursor });
        expect(page.body.errors).toBeUndefined();
        for (const item of page.body.data.page.items) slugs.push(item.slug);
      }
      expect(slugs).toContain(livePublished.slug);
      expect(slugs).not.toContain(draftOnly.slug);
      expect(slugs).not.toContain(hiddenPublished.slug);
      const entry = await call(URL_PAGE, { start: shards[0].startCursor });
      for (const item of entry.body.data.page.items)
        expect(item.availableLocales).toEqual(["EN"]);
    });

    it("links a live provider's content to the profile as a byline", async () => {
      const owner = await makeProvider("byline");
      const bare = await makeProvider("byline-bare");
      const draft = await publish(owner, {
        displayName: `${token} Byline Studio`,
      });
      const mine = await course(owner, "byline-live");
      const draftCourse = await course(
        owner,
        "byline-draft",
        CourseStatus.DRAFT,
      );
      const theirs = await course(bare, "byline-bare");

      const byline = (id: string) =>
        call(BYLINE, { kind: "COURSE", id }).then(
          (response) => response.body.data.providerPublicBylineForContent,
        );
      expect(await byline(mine.id)).toEqual({
        slug: draft.slug,
        displayName: `${token} Byline Studio`,
      });
      expect(await byline(draftCourse.id)).toBeNull();
      expect(await byline(theirs.id)).toBeNull();
    });
  });
});
