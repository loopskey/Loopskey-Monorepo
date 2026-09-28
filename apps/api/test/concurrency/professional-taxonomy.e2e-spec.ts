import { ProfessionalOnboardingService } from "@professional/services/professional-onboarding.service";
import { ProfessionalTaxonomyService } from "@professional/services/professional-taxonomy.service";
import { ProfessionalProfileService } from "@professional/services/professional-profile.service";
import { ProfessionalGoal } from "@prisma/client";
import { ProfileTaxonomyKind } from "@prisma/client";
import { ProfileTermUsage } from "@prisma/client";
import { Role, UserStatus } from "@prisma/client";
import { HttpException } from "@nestjs/common";
import { bootApp } from "../setup/concurrency";
import { fulfilled } from "../setup/concurrency";
import { runTogether } from "../setup/concurrency";
import { suiteScope } from "../setup/concurrency";

import type { ConcurrencyApp } from "../setup/concurrency";

const scope = suiteScope("professional-taxonomy");

const RETIRED_KEY_PREFIX = "E2E_TAXONOMY_RETIRED_";

jest.setTimeout(60_000);

describe("Professional role and skill taxonomy (e2e)", () => {
  let ctx: ConcurrencyApp;
  let taxonomy: ProfessionalTaxonomyService;
  let onboarding: ProfessionalOnboardingService;
  let profiles: ProfessionalProfileService;
  let user: { id: string; role: Role };
  let retiredSkillId: string;

  const professionalUser = async (label: string) => {
    const created = await ctx.prisma.user.create({
      data: {
        email: scope.email(label),
        role: Role.PROFESSIONAL,
        status: UserStatus.ACTIVE,
        fullName: `Taxonomy ${label}`,
      },
    });
    return { id: created.id, role: Role.PROFESSIONAL };
  };

  const removeRetiredFixtures = () =>
    ctx.prisma.profileTaxonomyTerm.deleteMany({
      where: { key: { startsWith: RETIRED_KEY_PREFIX } },
    });

  const termId = async (kind: ProfileTaxonomyKind, label: string) =>
    (
      await ctx.prisma.profileTaxonomyTerm.findFirstOrThrow({
        where: { kind, label },
        select: { id: true },
      })
    ).id;

  beforeAll(async () => {
    ctx = await bootApp();
    taxonomy = ctx.app.get(ProfessionalTaxonomyService);
    onboarding = ctx.app.get(ProfessionalOnboardingService);
    profiles = ctx.app.get(ProfessionalProfileService);
    await scope.cleanup(ctx.prisma);
    await removeRetiredFixtures();
    user = await professionalUser("owner");

    const group = await ctx.prisma.profileTaxonomyGroup.findFirstOrThrow({
      where: { kind: ProfileTaxonomyKind.SKILL_AREA, isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true },
    });
    const suffix = Date.now().toString(36).toUpperCase();
    retiredSkillId = (
      await ctx.prisma.profileTaxonomyTerm.create({
        data: {
          id: `pt_skill_e2e_retired_${suffix.toLowerCase()}`,
          kind: ProfileTaxonomyKind.SKILL_AREA,
          key: `${RETIRED_KEY_PREFIX}${suffix}`,
          label: `Retired E2E Skill ${suffix}`,
          groupId: group.id,
          isActive: false,
        },
      })
    ).id;
  }, 120_000);

  afterAll(async () => {
    if (ctx?.prisma) {
      await scope.cleanup(ctx.prisma);
      await removeRetiredFixtures();
    }
    await ctx?.app?.close();
  }, 60_000);

  describe("categories", () => {
    it("lists every role and skill category with its active term count", async () => {
      const roles = await taxonomy.groups(user, ProfileTaxonomyKind.ROLE);
      const skills = await taxonomy.groups(
        user,
        ProfileTaxonomyKind.SKILL_AREA,
      );

      expect(roles).toHaveLength(37);
      expect(roles.reduce((total, group) => total + group.termCount, 0)).toBe(
        710,
      );
      expect(skills).toHaveLength(47);
      expect(skills.reduce((total, group) => total + group.termCount, 0)).toBe(
        713,
      );
      expect(roles[0]).toMatchObject({ key: "SOFTWARE_ENGINEERING" });
    });

    it("refuses a non-professional caller", async () => {
      await expect(
        taxonomy.groups(
          { id: user.id, role: Role.PROVIDER },
          ProfileTaxonomyKind.ROLE,
        ),
      ).rejects.toBeInstanceOf(HttpException);
    });
  });

  describe("terms", () => {
    it("walks one category page by page without gaps or repeats", async () => {
      const [group] = await taxonomy.groups(user, ProfileTaxonomyKind.ROLE);
      const seen: string[] = [];
      let cursor: string | null = null;
      let pages = 0;
      do {
        const page = await taxonomy.terms(user, {
          kind: ProfileTaxonomyKind.ROLE,
          groupKey: group.key,
          cursor,
          take: 20,
        });
        expect(page.totalCount).toBe(group.termCount);
        expect(page.items.length).toBeLessThanOrEqual(20);
        expect(page.items.every((item) => item.groupKey === group.key)).toBe(
          true,
        );
        seen.push(...page.items.map((item) => item.id));
        cursor = page.pageInfo.nextCursor;
        pages += 1;
      } while (cursor);

      expect(seen).toHaveLength(group.termCount);
      expect(new Set(seen).size).toBe(seen.length);
      expect(pages).toBe(Math.ceil(group.termCount / 20));
    });

    it("searches across categories case-insensitively", async () => {
      const page = await taxonomy.terms(user, {
        kind: ProfileTaxonomyKind.ROLE,
        search: "DATA ENG",
      });
      expect(page.totalCount).toBeGreaterThan(0);
      expect(
        page.items.every((item) =>
          item.label.toLowerCase().includes("data eng"),
        ),
      ).toBe(true);
    });

    it("never returns an Other marker or an inactive legacy term", async () => {
      const others = await taxonomy.terms(user, {
        kind: ProfileTaxonomyKind.SKILL_AREA,
        search: "other",
        take: 50,
      });
      expect(
        others.items.filter((item) => /^other\b/i.test(item.label)),
      ).toEqual([]);

      const retired = await taxonomy.terms(user, {
        kind: ProfileTaxonomyKind.SKILL_AREA,
        search: "Retired E2E Skill",
      });
      expect(retired.items.map((item) => item.id)).not.toContain(
        retiredSkillId,
      );
    });

    it("rejects a one-character global search", async () => {
      await expect(
        taxonomy.terms(user, { kind: ProfileTaxonomyKind.ROLE, search: "a" }),
      ).rejects.toBeInstanceOf(HttpException);
    });

    it("still hydrates a saved term that has since been retired", async () => {
      const [hydrated] = await taxonomy.termsByIds(user, [retiredSkillId]);
      expect(hydrated).toMatchObject({ id: retiredSkillId, isActive: false });
    });
  });

  describe("current role", () => {
    it("stores a canonical role as its id and label snapshot", async () => {
      const member = await professionalUser("canonical");
      const roleId = await termId(ProfileTaxonomyKind.ROLE, "Data Analyst");

      await onboarding.complete(member, {
        professionalGoal: ProfessionalGoal.GROW_IN_CURRENT_ROLE,
        currentRoleTermId: roleId,
        skillsToImproveIds: [],
        suggestSkills: false,
      });

      const profile = await ctx.prisma.professionalProfile.findUniqueOrThrow({
        where: { userId: member.id },
      });
      expect(profile).toMatchObject({
        currentRole: "Data Analyst",
        currentRoleTermId: roleId,
      });
    });

    it("stores a custom role as text with no term id", async () => {
      const member = await professionalUser("custom");

      await onboarding.complete(member, {
        professionalGoal: ProfessionalGoal.GROW_IN_CURRENT_ROLE,
        currentRole: "  Chief   Tinkerer ",
        skillsToImproveIds: [],
        suggestSkills: false,
      });

      const profile = await ctx.prisma.professionalProfile.findUniqueOrThrow({
        where: { userId: member.id },
      });
      expect(profile).toMatchObject({
        currentRole: "Chief Tinkerer",
        currentRoleTermId: null,
      });
    });

    it.each([
      ["a skill id used as a role", "skill"],
      ["an id paired with a custom label", "conflict"],
      ["no role at all", "missing"],
    ])("rejects %s without writing anything", async (_case, variant) => {
      const member = await professionalUser(`bad-${variant}`);
      const skillId = await termId(ProfileTaxonomyKind.SKILL_AREA, "Python");
      const roleId = await termId(ProfileTaxonomyKind.ROLE, "Data Analyst");
      const choice =
        variant === "skill"
          ? { currentRoleTermId: skillId }
          : variant === "conflict"
            ? { currentRoleTermId: roleId, currentRole: "Something else" }
            : {};

      await expect(
        onboarding.complete(member, {
          professionalGoal: ProfessionalGoal.GROW_IN_CURRENT_ROLE,
          skillsToImproveIds: [],
          suggestSkills: false,
          ...choice,
        }),
      ).rejects.toBeInstanceOf(HttpException);

      const profile = await ctx.prisma.professionalProfile.findUnique({
        where: { userId: member.id },
      });
      expect(profile?.onboardingCompletedAt ?? null).toBeNull();
    });

    it("switches the profile between canonical and custom roles", async () => {
      const member = await professionalUser("details");
      const roleId = await termId(ProfileTaxonomyKind.ROLE, "Data Analyst");

      await profiles.updateDetails(member, { currentRoleTermId: roleId });
      await profiles.updateDetails(member, {
        currentRole: "Data Whisperer",
        currentRoleTermId: null,
      });

      const profile = await ctx.prisma.professionalProfile.findUniqueOrThrow({
        where: { userId: member.id },
      });
      expect(profile).toMatchObject({
        currentRole: "Data Whisperer",
        currentRoleTermId: null,
      });
    });
  });

  describe("skills", () => {
    it("suggests skills from the role's mapped categories", async () => {
      const roleId = await termId(
        ProfileTaxonomyKind.ROLE,
        "Software Engineer",
      );
      const result = await taxonomy.skillSuggestions(user, roleId);

      expect(result.isFallback).toBe(false);
      expect(result.items).toHaveLength(8);
      expect(result.items[0].groupKey).toBe("SOFTWARE_ENGINEERING");
      expect(new Set(result.items.map((item) => item.groupKey))).toEqual(
        new Set([
          "SOFTWARE_ENGINEERING",
          "PROGRAMMING_LANGUAGES",
          "WEB_DEVELOPMENT",
          "MOBILE_DEVELOPMENT",
          "DATABASES",
        ]),
      );
    });

    it("marks the suggestions for a custom role as a fallback", async () => {
      const result = await taxonomy.skillSuggestions(user, null);
      expect(result.isFallback).toBe(true);
      expect(result.items.length).toBeGreaterThan(0);
    });

    it("fills three suggested skills on completion from the mapped categories", async () => {
      const member = await professionalUser("suggested");
      const roleId = await termId(
        ProfileTaxonomyKind.ROLE,
        "Software Engineer",
      );

      await onboarding.complete(member, {
        professionalGoal: ProfessionalGoal.GROW_IN_CURRENT_ROLE,
        currentRoleTermId: roleId,
        skillsToImproveIds: [],
        suggestSkills: true,
      });

      const saved = await ctx.prisma.professionalProfileTerm.findMany({
        where: {
          profile: { userId: member.id },
          usage: ProfileTermUsage.SKILL_TO_IMPROVE,
        },
        select: { term: { select: { group: { select: { key: true } } } } },
      });
      expect(saved).toHaveLength(3);
    });

    it("rejects a fourth skill and a wrong-kind or retired id atomically", async () => {
      const member = await professionalUser("limits");
      const skills = await ctx.prisma.profileTaxonomyTerm.findMany({
        where: { kind: ProfileTaxonomyKind.SKILL_AREA, isActive: true },
        take: 4,
        select: { id: true },
      });
      const roleId = await termId(ProfileTaxonomyKind.ROLE, "Data Analyst");
      const base = {
        professionalGoal: ProfessionalGoal.GROW_IN_CURRENT_ROLE,
        currentRoleTermId: roleId,
        suggestSkills: false,
      };

      for (const skillsToImproveIds of [
        skills.map((skill) => skill.id),
        [skills[0].id, roleId],
        [skills[0].id, retiredSkillId],
      ])
        await expect(
          onboarding.complete(member, { ...base, skillsToImproveIds }),
        ).rejects.toBeInstanceOf(HttpException);

      expect(
        await ctx.prisma.professionalProfileTerm.count({
          where: { profile: { userId: member.id } },
        }),
      ).toBe(0);
    });

    it("converges when the same completion is submitted simultaneously", async () => {
      const member = await professionalUser("twin");
      const roleId = await termId(ProfileTaxonomyKind.ROLE, "Data Analyst");
      const skillIds = (
        await ctx.prisma.profileTaxonomyTerm.findMany({
          where: { kind: ProfileTaxonomyKind.SKILL_AREA, isActive: true },
          take: 2,
          select: { id: true },
        })
      ).map((skill) => skill.id);

      const results = await runTogether(3, () =>
        onboarding.complete(member, {
          professionalGoal: ProfessionalGoal.GROW_IN_CURRENT_ROLE,
          currentRoleTermId: roleId,
          skillsToImproveIds: skillIds,
          suggestSkills: false,
        }),
      );

      expect(fulfilled(results)).toHaveLength(3);
      expect(
        await ctx.prisma.professionalProfileTerm.count({
          where: {
            profile: { userId: member.id },
            usage: ProfileTermUsage.SKILL_TO_IMPROVE,
          },
        }),
      ).toBe(2);
    });
  });

  it("keeps the error codes stable for clients", async () => {
    await expect(
      taxonomy.terms(user, { kind: ProfileTaxonomyKind.ROLE, search: "x" }),
    ).rejects.toMatchObject({ message: "PROFILE_TAXONOMY_SEARCH_TOO_SHORT" });
  });
});
