import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { CompleteProfessionalOnboardingInput } from "@professional/dtos/complete-professional-onboarding.input";
import { ProfessionalProfileService } from "@professional/services/professional-profile.service";
import { ProfessionalTaxonomyService } from "@professional/services/professional-taxonomy.service";
import { ProfessionalMessageCode } from "@professional/enums/message-code.enum";
import { ONBOARDING_MAX_SKILLS } from "@professional/enums/profile-section.enum";
import { requestContext } from "@infrastructure/observability/request-context";
import { PrismaService } from "@prisma/prisma.service";
import { TUser } from "@common/types/user.types";

import * as P from "@prisma/client";

type TCertificationPlan =
  | { kind: "none" }
  | { kind: "catalogue"; certificationId: string; name: string; issuer: string }
  | { kind: "manual"; name: string; issuer: string | null };

@Injectable()
export class ProfessionalOnboardingService {
  private readonly logger = new Logger(ProfessionalOnboardingService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly profileService: ProfessionalProfileService,
    private readonly taxonomyService: ProfessionalTaxonomyService,
  ) {}

  private assertProfessional(user: TUser) {
    if (user.role !== P.Role.PROFESSIONAL && user.role !== P.Role.ADMIN)
      throw new ForbiddenException(
        ProfessionalMessageCode.PROFESSIONAL_ACCESS_REQUIRED,
      );
  }

  private log(event: string, userId: string, extra: Record<string, unknown>) {
    this.logger.log(
      JSON.stringify({
        event,
        userId,
        correlationId: requestContext.correlationId(),
        ...extra,
      }),
    );
  }

  async start(user: TUser) {
    this.assertProfessional(user);
    const profile = await this.prismaService.professionalProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        skills: [],
        interests: [],
        onboardingStartedAt: new Date(),
      },
      update: {},
      select: { id: true, onboardingStartedAt: true },
    });

    if (!profile.onboardingStartedAt) {
      await this.prismaService.professionalProfile.update({
        where: { id: profile.id },
        data: { onboardingStartedAt: new Date() },
      });
    }

    this.log("professional.onboarding.started", user.id, {
      resumed: Boolean(profile.onboardingStartedAt),
    });
    return this.profileService.profile(user);
  }

  async dismiss(user: TUser) {
    this.assertProfessional(user);
    const profile = await this.prismaService.professionalProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        skills: [],
        interests: [],
        onboardingDismissedAt: new Date(),
      },
      update: {},
      select: {
        id: true,
        onboardingDismissedAt: true,
        onboardingCompletedAt: true,
      },
    });

    if (!profile.onboardingDismissedAt && !profile.onboardingCompletedAt) {
      await this.prismaService.professionalProfile.update({
        where: { id: profile.id },
        data: { onboardingDismissedAt: new Date() },
      });
      this.log("professional.onboarding.dismissed", user.id, {});
    }

    return this.profileService.profile(user);
  }

  private async resolveSkillIds(input: CompleteProfessionalOnboardingInput) {
    const selected = [...new Set(input.skillsToImproveIds)];
    if (selected.length > ONBOARDING_MAX_SKILLS)
      throw new BadRequestException(
        ProfessionalMessageCode.ONBOARDING_SKILL_LIMIT_EXCEEDED,
      );

    if (selected.length) {
      const found = await this.prismaService.profileTaxonomyTerm.findMany({
        where: {
          id: { in: selected },
          isActive: true,
          kind: P.ProfileTaxonomyKind.SKILL_AREA,
        },
        select: { id: true },
      });
      if (found.length !== selected.length)
        throw new BadRequestException(
          ProfessionalMessageCode.PROFILE_TAXONOMY_TERM_INVALID,
        );
      return selected;
    }

    if (!input.suggestSkills) return [];
    const suggested = await this.taxonomyService.suggestSkills(
      input.currentRoleTermId,
      ONBOARDING_MAX_SKILLS,
    );
    return suggested.items.map((term) => term.id);
  }

  private async resolveCertification(
    input: CompleteProfessionalOnboardingInput,
  ): Promise<TCertificationPlan> {
    if (input.professionalGoal !== P.ProfessionalGoal.MAINTAIN_CERTIFICATION)
      return { kind: "none" };
    if (input.certificationId) {
      const certification = await this.prismaService.certification.findUnique({
        where: { id: input.certificationId },
        select: { id: true, name: true, organization: true },
      });
      if (!certification)
        throw new NotFoundException(
          ProfessionalMessageCode.CERTIFICATION_NOT_FOUND,
        );
      return {
        kind: "catalogue",
        certificationId: certification.id,
        name: certification.name,
        issuer: certification.organization,
      };
    }

    if (input.certificationName)
      return {
        kind: "manual",
        name: input.certificationName,
        issuer: input.certificationIssuer ?? null,
      };

    if (input.certificationIssuer)
      throw new BadRequestException(
        ProfessionalMessageCode.ONBOARDING_CERTIFICATION_NAME_REQUIRED,
      );
    return { kind: "none" };
  }

  private async persistCredential(
    tx: P.Prisma.TransactionClient,
    userId: string,
    plan: TCertificationPlan,
  ) {
    if (plan.kind === "none") return null;
    if (plan.kind === "catalogue") {
      const credential = await tx.professionalCredential.upsert({
        where: {
          userId_certificationId: {
            userId,
            certificationId: plan.certificationId,
          },
        },
        create: {
          userId,
          name: plan.name,
          issuingOrganization: plan.issuer,
          certificationId: plan.certificationId,
        },
        update: { name: plan.name, issuingOrganization: plan.issuer },
        select: { id: true },
      });
      return credential.id;
    }

    const existing = await tx.professionalCredential.findFirst({
      where: {
        userId,
        certificationId: null,
        name: { equals: plan.name, mode: "insensitive" },
      },
      select: { id: true },
    });

    if (existing) {
      await tx.professionalCredential.update({
        where: { id: existing.id },
        data: { issuingOrganization: plan.issuer },
      });
      return existing.id;
    }

    const created = await tx.professionalCredential.create({
      data: { userId, name: plan.name, issuingOrganization: plan.issuer },
      select: { id: true },
    });
    return created.id;
  }

  async complete(user: TUser, input: CompleteProfessionalOnboardingInput) {
    this.assertProfessional(user);
    const role = await this.taxonomyService.resolveCurrentRole(input);
    if (!role.currentRole)
      throw new BadRequestException(
        ProfessionalMessageCode.ONBOARDING_ROLE_REQUIRED,
      );
    const [skillIds, certification] = await Promise.all([
      this.resolveSkillIds(input),
      this.resolveCertification(input),
    ]);
    try {
      await this.prismaService.$transaction(async (tx) => {
        const profile = await tx.professionalProfile.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            skills: [],
            interests: [],
            ...role,
            professionalGoal: input.professionalGoal,
            onboardingStartedAt: new Date(),
            onboardingCompletedAt: new Date(),
          },
          update: {
            ...role,
            professionalGoal: input.professionalGoal,
            onboardingCompletedAt: new Date(),
          },
          select: { id: true },
        });
        await tx.professionalProfileTerm.deleteMany({
          where: {
            profileId: profile.id,
            usage: P.ProfileTermUsage.SKILL_TO_IMPROVE,
          },
        });
        if (skillIds.length)
          await tx.professionalProfileTerm.createMany({
            data: skillIds.map((termId) => ({
              termId,
              profileId: profile.id,
              usage: P.ProfileTermUsage.SKILL_TO_IMPROVE,
            })),
          });

        await this.persistCredential(tx, user.id, certification);
      });
    } catch (error) {
      this.log("professional.onboarding.failed", user.id, {
        goal: input.professionalGoal,
        reason: error instanceof Error ? error.name : "UNKNOWN",
      });
      throw error;
    }

    this.log("professional.onboarding.completed", user.id, {
      goal: input.professionalGoal,
      role: role.currentRoleTermId ? "canonical" : "custom",
      skillCount: skillIds.length,
      certification: certification.kind,
    });
    return this.profileService.profile(user);
  }
}
