import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ProfessionalProfileCompletionService } from "@professional/services/professional-profile-completion.service";
import { UpdateProfessionalBasicProfileInput } from "@professional/dtos/update-professional-basic-profile.input";
import { UpdateProfessionalPreferencesInput } from "@professional/dtos/update-professional-preferences.input";
import { UpdateProfessionalDetailsInput } from "@professional/dtos/update-professional-details.input";
import { type ProfessionalEngagementApi } from "@contentAction/public/professional-engagement-api";
import { UpdateProfessionalSkillsInput } from "@professional/dtos/update-professional-skills.input";
import { type ProfessionalIdentityApi } from "@user/public/professional-identity-api";
import { PROFESSIONAL_ENGAGEMENT_API } from "@contentAction/public/professional-engagement-api";
import { PROFESSIONAL_IDENTITY_API } from "@user/public/professional-identity-api";
import { ProfessionalMessageCode } from "@professional/enums/message-code.enum";
import { PrismaService } from "@prisma/prisma.service";
import { TUser } from "@common/types/user.types";

import * as P from "@prisma/client";
import * as T from "@professional/types/professional-profile.types";

const USAGE_KIND: Record<P.ProfileTermUsage, P.ProfileTaxonomyKind> = {
  [P.ProfileTermUsage.MAIN_SKILL]: P.ProfileTaxonomyKind.SKILL_AREA,
  [P.ProfileTermUsage.SKILL_TO_IMPROVE]: P.ProfileTaxonomyKind.SKILL_AREA,
  [P.ProfileTermUsage.FAVORITE_SUBJECT]: P.ProfileTaxonomyKind.SUBJECT,
};

const PROFILE_INCLUDE = {
  include: {
    terms: {
      include: { term: true },
      orderBy: { term: { sortOrder: "asc" } },
    },
  },
} satisfies P.Prisma.User$professionalProfileArgs;

@Injectable()
export class ProfessionalProfileService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly completionService: ProfessionalProfileCompletionService,
    @Inject(PROFESSIONAL_IDENTITY_API)
    private readonly identity: ProfessionalIdentityApi,
    @Inject(PROFESSIONAL_ENGAGEMENT_API)
    private readonly engagement: ProfessionalEngagementApi,
  ) {}

  private assertProfessional(user: TUser) {
    if (user.role !== P.Role.PROFESSIONAL && user.role !== P.Role.ADMIN)
      throw new ForbiddenException(
        ProfessionalMessageCode.PROFESSIONAL_ACCESS_REQUIRED,
      );
  }

  private async ensureProfile(userId: string) {
    return this.prismaService.professionalProfile.upsert({
      where: { userId },
      create: { userId, skills: [], interests: [] },
      update: {},
      select: { id: true },
    });
  }

  private termsFor(
    profile: T.TProfessionalProfileWithTerms | null,
    usage: P.ProfileTermUsage,
  ) {
    if (!profile) return [];
    return profile.terms
      .filter((item) => item.usage === usage)
      .map((item) => item.term);
  }

  async profile(user: TUser) {
    this.assertProfessional(user);
    const [
      identity,
      profile,
      credentials,
      pduActivities,
      certificatesEarned,
      coursesEnrolled,
    ] = await Promise.all([
      this.identity.profile(user.id),
      this.prismaService.professionalProfile.findUnique({
        where: { userId: user.id },
        ...PROFILE_INCLUDE,
      }),
      this.prismaService.professionalCredential.findMany({
        where: { userId: user.id },
        orderBy: { issueDate: "desc" },
      }),
      this.prismaService.pDUActivity.findMany({
        where: { userId: user.id },
        select: { pdus: true },
      }),
      this.prismaService.certificate.count({ where: { userId: user.id } }),
      this.engagement.courseCounts(user.id).then((counts) => counts.total),
    ]);
    if (!identity)
      throw new NotFoundException(ProfessionalMessageCode.USER_NOT_FOUND);
    const isEmailVerified = Boolean(identity.emailVerifiedAt && identity.email);

    return {
      id: identity.id,
      bio: identity.bio,
      role: identity.role,
      email: identity.email,
      phone: identity.phone,
      status: identity.status,
      fullName: identity.fullName,
      avatarUrl: identity.avatarUrl,
      isEmailVerified,

      linkedInUrl: profile?.linkedInUrl ?? null,
      countryCode: profile?.countryCode ?? null,
      language: profile?.language ?? null,
      timeZone: profile?.timeZone ?? null,

      profession: profile?.profession ?? null,
      industry: profile?.industry ?? null,
      currentRole: profile?.currentRole ?? null,
      experienceRange: profile?.experienceRange ?? null,
      workLocation: profile?.workLocation ?? null,
      professionalSummary: profile?.professionalSummary ?? null,

      professionalGoal: profile?.professionalGoal ?? null,
      onboardingCompletedAt: profile?.onboardingCompletedAt ?? null,
      onboardingDismissedAt: profile?.onboardingDismissedAt ?? null,

      currentSkillLevel: profile?.currentSkillLevel ?? null,
      targetSkillLevel: profile?.targetSkillLevel ?? null,
      mainSkillAreas: this.termsFor(profile, P.ProfileTermUsage.MAIN_SKILL),
      favoriteSubjects: this.termsFor(
        profile,
        P.ProfileTermUsage.FAVORITE_SUBJECT,
      ),
      skillsToImprove: this.termsFor(
        profile,
        P.ProfileTermUsage.SKILL_TO_IMPROVE,
      ),

      preferredLearningFormats: profile?.preferredLearningFormats ?? [],
      learningTimeCommitment: profile?.learningTimeCommitment ?? null,
      learningBudgetPreference: profile?.learningBudgetPreference ?? null,

      credentials,
      certificatesEarned,
      coursesEnrolled,
      learningHours: pduActivities.reduce(
        (sum, item) => sum + Number(item.pdus ?? 0),
        0,
      ),

      completion: this.completionService.calculate({
        profile,
        isEmailVerified,
        fullName: identity.fullName,
        credentialCount: credentials.length,
      }),
    };
  }

  async taxonomy(user: TUser, kind?: P.ProfileTaxonomyKind) {
    this.assertProfessional(user);
    const terms = await this.prismaService.profileTaxonomyTerm.findMany({
      where: { isActive: true, ...(kind ? { kind } : {}) },
      orderBy: [{ kind: "asc" }, { sortOrder: "asc" }, { label: "asc" }],
    });
    const groups = new Map<string, T.TTaxonomyGroup>();
    for (const term of terms) {
      const mapKey = `${term.kind}:${term.groupKey}`;
      const group = groups.get(mapKey);
      if (group) {
        group.terms.push(term);
        continue;
      }
      groups.set(mapKey, {
        kind: term.kind,
        groupKey: term.groupKey,
        groupLabel: term.groupLabel,
        terms: [term],
      });
    }
    return [...groups.values()];
  }

  async cpdPlans(user: TUser) {
    this.assertProfessional(user);
    return this.prismaService.pDUTarget.findMany({
      where: { userId: user.id },
      orderBy: [{ year: "desc" }, { category: "asc" }],
      select: { id: true, year: true, category: true, target: true },
    });
  }

  async updateBasicProfile(
    user: TUser,
    input: UpdateProfessionalBasicProfileInput,
  ) {
    this.assertProfessional(user);
    const { fullName, ...profileData } = input;
    await this.prismaService.$transaction(async (tx) => {
      await this.identity.update(user.id, { fullName }, tx);
      await tx.professionalProfile.upsert({
        where: { userId: user.id },
        create: { userId: user.id, skills: [], interests: [], ...profileData },
        update: profileData,
      });
    });
    return this.profile(user);
  }

  async updateDetails(user: TUser, input: UpdateProfessionalDetailsInput) {
    this.assertProfessional(user);
    await this.prismaService.professionalProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, skills: [], interests: [], ...input },
      update: input,
    });
    return this.profile(user);
  }

  async updatePreferences(
    user: TUser,
    input: UpdateProfessionalPreferencesInput,
  ) {
    this.assertProfessional(user);
    await this.prismaService.professionalProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, skills: [], interests: [], ...input },
      update: input,
    });
    return this.profile(user);
  }

  private async assertTermsValid(selections: T.TTermSelection[]) {
    const allIds = [...new Set(selections.flatMap((item) => item.ids))];
    if (!allIds.length) return;
    const terms = await this.prismaService.profileTaxonomyTerm.findMany({
      where: { id: { in: allIds }, isActive: true },
      select: { id: true, kind: true },
    });
    const kindById = new Map(terms.map((term) => [term.id, term.kind]));
    for (const selection of selections) {
      for (const id of selection.ids) {
        const kind = kindById.get(id);
        if (!kind || kind !== USAGE_KIND[selection.usage])
          throw new BadRequestException(
            ProfessionalMessageCode.PROFILE_TAXONOMY_TERM_INVALID,
          );
      }
    }
  }

  async updateSkills(user: TUser, input: UpdateProfessionalSkillsInput) {
    this.assertProfessional(user);
    const selections: T.TTermSelection[] = [
      { ids: input.mainSkillAreaIds, usage: P.ProfileTermUsage.MAIN_SKILL },
      {
        ids: input.favoriteSubjectIds,
        usage: P.ProfileTermUsage.FAVORITE_SUBJECT,
      },
      {
        ids: input.skillsToImproveIds,
        usage: P.ProfileTermUsage.SKILL_TO_IMPROVE,
      },
    ];
    await this.assertTermsValid(selections);
    const { id: profileId } = await this.ensureProfile(user.id);
    const usages = selections.map((selection) => selection.usage);
    const rows = selections.flatMap((selection) =>
      selection.ids.map((termId) => ({
        profileId,
        termId,
        usage: selection.usage,
      })),
    );
    await this.prismaService.$transaction([
      this.prismaService.professionalProfileTerm.deleteMany({
        where: { profileId, usage: { in: usages } },
      }),
      this.prismaService.professionalProfileTerm.createMany({ data: rows }),
      this.prismaService.professionalProfile.update({
        where: { id: profileId },
        data: {
          currentSkillLevel: input.currentSkillLevel ?? null,
          targetSkillLevel: input.targetSkillLevel ?? null,
        },
      }),
    ]);
    return this.profile(user);
  }
}
