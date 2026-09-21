import { CPDEvidenceType, PDUStatus, Prisma, Role } from "@prisma/client";
import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { CPDPlanStatus, CPDReportRecipientType } from "@prisma/client";
import { NotFoundException, Injectable, Inject } from "@nestjs/common";
import { CreateCpdPlanFromSuggestionInput } from "@professional/dtos/create-cpd-plan-from-suggestion.input";
import { type ProfessionalIdentityApi } from "@user/public/professional-identity-api";
import { CertificationSearchService } from "@professional/services/certification-search.service";
import { PROFESSIONAL_IDENTITY_API } from "@user/public/professional-identity-api";
import { ProfessionalMessageCode } from "@professional/enums/message-code.enum";
import { CreateCpdPlanInput } from "@professional/dtos/create-cpd-plan.input";
import { UpdateCpdPlanInput } from "@professional/dtos/update-cpd-plan.input";
import { PrismaService } from "@prisma/prisma.service";
import { CreditType } from "@prisma/client";
import { TUser } from "@common/types/user.types";
import {
  buildMissingRequirements,
  computeCategoryProgress,
  computeCompliance,
  computeEarned,
  computeProgressPercent,
  countCategoriesMissing,
  requiresFileEvidence,
  round2,
} from "@professional/utils/cpd-progress.util";

const COUNTED_STATUS: Prisma.EnumPDUStatusFilter = { not: PDUStatus.REJECTED };

const PLAN_ACTIVITY_LIMIT = 50;

const planWithCategories = Prisma.validator<Prisma.CPDPlanDefaultArgs>()({
  include: { categories: { orderBy: { order: "asc" } } },
});

type PlanWithCategories = Prisma.CPDPlanGetPayload<typeof planWithCategories>;

@Injectable()
export class ProfessionalCpdPlanService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly certificationSearchService: CertificationSearchService,
    @Inject(PROFESSIONAL_IDENTITY_API)
    private readonly identity: ProfessionalIdentityApi,
  ) {}

  private assertProfessional(user: TUser) {
    if (user.role !== Role.PROFESSIONAL && user.role !== Role.ADMIN)
      throw new ForbiddenException(
        ProfessionalMessageCode.PROFESSIONAL_ACCESS_REQUIRED,
      );
  }

  private async findOwnedPlan(user: TUser, planId: string) {
    const plan = await this.prismaService.cPDPlan.findFirst({
      where: { id: planId, userId: user.id },
      ...planWithCategories,
    });
    if (!plan)
      throw new NotFoundException(ProfessionalMessageCode.CPD_PLAN_NOT_FOUND);
    return plan;
  }

  async myPlans(user: TUser) {
    this.assertProfessional(user);
    return this.prismaService.cPDPlan.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      ...planWithCategories,
    });
  }

  async plan(user: TUser, planId: string) {
    this.assertProfessional(user);
    return this.findOwnedPlan(user, planId);
  }

  private validateAndBuild(input: CreateCpdPlanInput) {
    const start = new Date(input.reportingStart);
    const end = new Date(input.reportingEnd);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()))
      throw new BadRequestException(
        ProfessionalMessageCode.CPD_PLAN_INVALID_PERIOD,
      );
    if (end.getTime() < start.getTime())
      throw new BadRequestException(
        ProfessionalMessageCode.CPD_PLAN_INVALID_PERIOD,
      );
    const categories = input.categories ?? [];
    const seen = new Set<string>();
    for (const category of categories) {
      const key = category.name.trim().toLowerCase();
      if (!key) continue;
      if (seen.has(key))
        throw new BadRequestException(
          ProfessionalMessageCode.CPD_PLAN_DUPLICATE_CATEGORY,
        );
      seen.add(key);
    }

    const targetTotal = categories.reduce(
      (sum, category) => sum + category.target,
      0,
    );
    if (round2(targetTotal) > round2(input.totalRequiredCredits))
      throw new BadRequestException(
        ProfessionalMessageCode.CPD_PLAN_CATEGORY_TARGET_MISMATCH,
      );
    const remindersEnabled = input.remindersEnabled ?? false;
    return {
      start,
      end,
      data: {
        certificationId: input.certificationId ?? null,
        certificationName: input.certificationName.trim(),
        organization: input.organization.trim(),
        reportingStart: start,
        reportingEnd: end,
        creditType: input.creditType,
        totalRequiredCredits: input.totalRequiredCredits,
        initialCompletedCredits: input.initialCompletedCredits ?? 0,
        timeAvailable: input.timeAvailable ?? null,
        preferredFormats: input.preferredFormats ?? [],
        evidenceTypes: input.evidenceTypes,
        evidenceOtherNote: input.evidenceTypes.includes(CPDEvidenceType.OTHER)
          ? (input.evidenceOtherNote ?? null)
          : null,
        reportRecipientType: input.reportRecipientType,
        reportRecipientLabel: input.reportRecipientLabel?.trim() || null,
        remindersEnabled,
        reminderTiming: remindersEnabled
          ? (input.reminderTiming ?? null)
          : null,
      },
      categories: categories.map((category, index) => ({
        name: category.name.trim(),
        targetCredits: category.target,
        completedCredits: category.completed ?? 0,
        order: index,
      })),
    };
  }

  private async assertNoDuplicate(
    user: TUser,
    certificationName: string,
    start: Date,
    end: Date,
    allowDuplicate: boolean,
    excludePlanId?: string,
  ) {
    if (allowDuplicate) return;
    const existing = await this.prismaService.cPDPlan.findFirst({
      where: {
        userId: user.id,
        id: excludePlanId ? { not: excludePlanId } : undefined,
        certificationName: { equals: certificationName, mode: "insensitive" },
        reportingStart: { lte: end },
        reportingEnd: { gte: start },
      },
      select: { id: true },
    });
    if (existing)
      throw new BadRequestException(ProfessionalMessageCode.CPD_PLAN_DUPLICATE);
  }

  async createPlan(user: TUser, input: CreateCpdPlanInput) {
    this.assertProfessional(user);
    const { start, end, data, categories } = this.validateAndBuild(input);
    await this.assertNoDuplicate(
      user,
      data.certificationName,
      start,
      end,
      input.allowDuplicate ?? false,
    );

    return this.prismaService.cPDPlan.create({
      data: {
        userId: user.id,
        status: CPDPlanStatus.ACTIVE,
        ...data,
        categories: { create: categories },
      },
      ...planWithCategories,
    });
  }

  async createPlanFromSuggestion(
    user: TUser,
    input: CreateCpdPlanFromSuggestionInput,
  ) {
    this.assertProfessional(user);
    const cert = await this.certificationSearchService.findById(
      user,
      input.certificationId,
    );
    if (!cert)
      throw new NotFoundException(
        ProfessionalMessageCode.CERTIFICATION_NOT_FOUND,
      );

    const start = input.reportingStart
      ? new Date(input.reportingStart)
      : this.startOfTodayUtc();
    const end = input.reportingEnd
      ? new Date(input.reportingEnd)
      : this.suggestedEnd(start, cert.renewalCycleMonths);
    const certificationName = `${cert.abbreviation} (${cert.name})`;
    const existing = await this.prismaService.cPDPlan.findFirst({
      where: {
        userId: user.id,
        certificationId: cert.id,
        reportingStart: { lte: end },
        reportingEnd: { gte: start },
      },
      ...planWithCategories,
    });
    if (existing) return existing;
    return this.prismaService.cPDPlan.create({
      data: {
        userId: user.id,
        certificationId: cert.id,
        certificationName,
        organization: cert.association ?? cert.organization,
        reportingStart: start,
        reportingEnd: end,
        creditType: cert.creditType,
        totalRequiredCredits: cert.totalRequiredCredits,
        initialCompletedCredits: 0,
        preferredFormats: [],
        evidenceTypes: [CPDEvidenceType.CERTIFICATE],
        reportRecipientType: CPDReportRecipientType.SELF,
        remindersEnabled: false,
        status: CPDPlanStatus.ACTIVE,
        categories: {
          create: cert.categories.map((category, index) => ({
            name: category.name,
            targetCredits: category.requiredCredits,
            completedCredits: 0,
            order: index,
          })),
        },
      },
      ...planWithCategories,
    });
  }

  async upsertDraftPlan(
    user: TUser,
    input: {
      planId?: string | null;
      certificationId?: string | null;
      certificationName?: string | null;
      organization?: string | null;
      reportingStart?: string | null;
      reportingEnd?: string | null;
      totalRequiredCredits?: number | null;
      categories?:
        | { name: string; target: number; completed?: number }[]
        | null;
      evidenceTypes?: CPDEvidenceType[] | null;
      evidenceOtherNote?: string | null;
      reportRecipientType?: CPDReportRecipientType | null;
      reportRecipientLabel?: string | null;
    },
  ): Promise<PlanWithCategories> {
    this.assertProfessional(user);

    const existing = input.planId
      ? await this.findOwnedPlan(user, input.planId)
      : null;

    let catalog: {
      certificationId: string;
      certificationName: string;
      organization: string;
      creditType: PlanWithCategories["creditType"];
      totalRequiredCredits: number;
      reportingStart: Date;
      reportingEnd: Date;
      categories: { name: string; target: number; completed: number }[];
    } | null = null;

    if (input.certificationId) {
      const cert = await this.certificationSearchService.findById(
        user,
        input.certificationId,
      );
      if (!cert)
        throw new NotFoundException(
          ProfessionalMessageCode.CERTIFICATION_NOT_FOUND,
        );
      const start = existing?.reportingStart ?? this.startOfTodayUtc();
      catalog = {
        certificationId: cert.id,
        certificationName: `${cert.abbreviation} (${cert.name})`,
        organization: cert.association ?? cert.organization,
        creditType: cert.creditType,
        totalRequiredCredits: cert.totalRequiredCredits,
        reportingStart: start,
        reportingEnd: this.suggestedEnd(start, cert.renewalCycleMonths),
        categories: cert.categories.map((category) => ({
          name: category.name,
          target: category.requiredCredits,
          completed: 0,
        })),
      };
    }

    const start = input.reportingStart
      ? new Date(input.reportingStart)
      : (catalog?.reportingStart ??
        existing?.reportingStart ??
        this.startOfTodayUtc());
    const end = input.reportingEnd
      ? new Date(input.reportingEnd)
      : (catalog?.reportingEnd ??
        existing?.reportingEnd ??
        this.suggestedEnd(start, null));

    const data = {
      certificationId:
        input.certificationId !== undefined
          ? (catalog?.certificationId ?? null)
          : (existing?.certificationId ?? null),
      certificationName:
        input.certificationName ??
        catalog?.certificationName ??
        existing?.certificationName ??
        "",
      organization:
        input.organization ??
        catalog?.organization ??
        existing?.organization ??
        "",
      reportingStart: start,
      reportingEnd: end,
      creditType: catalog?.creditType ?? existing?.creditType ?? CreditType.CPD,
      totalRequiredCredits:
        input.totalRequiredCredits ??
        catalog?.totalRequiredCredits ??
        existing?.totalRequiredCredits ??
        0,
      evidenceTypes: input.evidenceTypes ?? existing?.evidenceTypes ?? [],
      evidenceOtherNote:
        input.evidenceOtherNote !== undefined
          ? input.evidenceOtherNote
          : (existing?.evidenceOtherNote ?? null),
      reportRecipientType:
        input.reportRecipientType ??
        existing?.reportRecipientType ??
        CPDReportRecipientType.SELF,
      reportRecipientLabel:
        input.reportRecipientLabel !== undefined
          ? input.reportRecipientLabel
          : (existing?.reportRecipientLabel ?? null),
    } as const;

    const categorySource = input.categories ?? catalog?.categories ?? null;
    const categories = categorySource?.map((category, index) => ({
      name: category.name,
      targetCredits: category.target,
      completedCredits: category.completed ?? 0,
      order: index,
    }));

    if (existing) {
      return this.prismaService.cPDPlan.update({
        where: { id: existing.id },
        data: {
          ...data,
          ...(categories
            ? { categories: { deleteMany: {}, create: categories } }
            : {}),
        },
        ...planWithCategories,
      });
    }

    return this.prismaService.cPDPlan.create({
      data: {
        userId: user.id,
        status: CPDPlanStatus.ACTIVE,
        ...data,
        categories: { create: categories ?? [] },
      },
      ...planWithCategories,
    });
  }

  async updatePlan(user: TUser, input: UpdateCpdPlanInput) {
    this.assertProfessional(user);
    await this.findOwnedPlan(user, input.id);
    const { start, end, data, categories } = this.validateAndBuild(input);
    await this.assertNoDuplicate(
      user,
      data.certificationName,
      start,
      end,
      input.allowDuplicate ?? false,
      input.id,
    );
    return this.prismaService.cPDPlan.update({
      where: { id: input.id },
      data: {
        ...data,
        categories: { deleteMany: {}, create: categories },
      },
      ...planWithCategories,
    });
  }

  async deletePlan(user: TUser, planId: string) {
    this.assertProfessional(user);
    await this.findOwnedPlan(user, planId);
    await this.prismaService.cPDPlan.delete({ where: { id: planId } });
    return { id: planId };
  }

  async progress(user: TUser, planId: string) {
    this.assertProfessional(user);
    const plan = await this.findOwnedPlan(user, planId);
    return this.computeProgress(user, plan);
  }

  private linkedActivityWhere(
    user: TUser,
    plan: PlanWithCategories,
  ): Prisma.PDUActivityWhereInput {
    return {
      userId: user.id,
      OR: [
        { cpdPlanId: plan.id },
        {
          cpdPlanId: null,
          associationRequirementId: null,
          creditType: plan.creditType,
          date: { gte: plan.reportingStart, lte: plan.reportingEnd },
        },
      ],
    };
  }

  private eligibleActivityWhere(
    user: TUser,
    plan: PlanWithCategories,
  ): Prisma.PDUActivityWhereInput {
    return { ...this.linkedActivityWhere(user, plan), status: COUNTED_STATUS };
  }

  async planActivities(user: TUser, planId: string) {
    this.assertProfessional(user);
    const plan = await this.findOwnedPlan(user, planId);
    return this.prismaService.pDUActivity.findMany({
      where: this.linkedActivityWhere(user, plan),
      orderBy: { date: "desc" },
      take: PLAN_ACTIVITY_LIMIT,
      include: { evidenceFiles: { orderBy: { createdAt: "asc" } } },
    });
  }

  private async computeProgress(user: TUser, plan: PlanWithCategories) {
    const where = this.eligibleActivityWhere(user, plan);
    const [aggregate, evidenceMissing] = await Promise.all([
      this.prismaService.pDUActivity.aggregate({
        where,
        _sum: { pdus: true },
        _count: true,
      }),
      requiresFileEvidence(plan.evidenceTypes)
        ? this.prismaService.pDUActivity.count({
            where: { ...where, evidenceFiles: { none: {} } },
          })
        : Promise.resolve(0),
    ]);

    const activityCredits = round2(Number(aggregate._sum.pdus ?? 0));
    const activitiesCounted = aggregate._count;
    // earnedCredits is activity-based only: startingCredits (the historical
    // initialCompletedCredits) is reported separately and never folds into
    // earned, remaining, the donut, or compliance so every progress surface
    // agrees on one activity-based definition.
    const earned = activityCredits;
    const startingCredits = round2(plan.initialCompletedCredits);
    const total = plan.totalRequiredCredits;
    const remaining = round2(Math.max(total - earned, 0));
    const progressPercent = computeProgressPercent(earned, total);

    const categories = computeCategoryProgress(plan.categories);
    const categoriesMissing = countCategoriesMissing(categories);

    const now = new Date();
    const complianceStatus = computeCompliance({
      earned,
      total,
      categoriesMissing,
      evidenceMissing,
      reportingStart: plan.reportingStart,
      reportingEnd: plan.reportingEnd,
      now,
    });
    const missingRequirements = buildMissingRequirements({
      earned,
      total,
      categories,
      evidenceMissing,
      reportRecipientType: plan.reportRecipientType,
      reportRecipientLabel: plan.reportRecipientLabel,
      reportingStart: plan.reportingStart,
      reportingEnd: plan.reportingEnd,
      now,
    });

    return {
      planId: plan.id,
      earnedCredits: earned,
      startingCredits,
      initialCompletedCredits: round2(plan.initialCompletedCredits),
      activityCredits,
      totalRequiredCredits: total,
      remainingCredits: remaining,
      progressPercent,
      categoriesMissing,
      evidenceMissing,
      activitiesCounted,
      complianceStatus,
      reportingExpired: now.getTime() > plan.reportingEnd.getTime(),
      reportingNotStarted: now.getTime() < plan.reportingStart.getTime(),
      categories,
      missingRequirements,
    };
  }

  async certificationCredits(user: TUser, certificationId: string) {
    this.assertProfessional(user);
    const certification = await this.certificationSearchService.findById(
      user,
      certificationId,
    );
    if (!certification) return null;

    const plan = await this.prismaService.cPDPlan.findFirst({
      where: {
        userId: user.id,
        certificationId,
        status: CPDPlanStatus.ACTIVE,
      },
      orderBy: { reportingEnd: "desc" },
      ...planWithCategories,
    });
    if (!plan)
      return {
        certification,
        planId: null,
        requiredCredits: round2(certification.totalRequiredCredits),
        completedCredits: 0,
      };

    const aggregate = await this.prismaService.pDUActivity.aggregate({
      where: this.eligibleActivityWhere(user, plan),
      _sum: { pdus: true },
    });
    return {
      certification,
      planId: plan.id,
      requiredCredits: round2(plan.totalRequiredCredits),
      completedCredits: computeEarned(
        plan.initialCompletedCredits,
        round2(Number(aggregate._sum.pdus ?? 0)),
      ),
    };
  }

  async reportRecipients(user: TUser) {
    this.assertProfessional(user);
    const self = await this.identity.profile(user.id);
    const selfLabel =
      self?.fullName?.trim() ||
      [self?.firstName, self?.lastName].filter(Boolean).join(" ").trim() ||
      self?.email ||
      "Myself";

    return [
      {
        type: CPDReportRecipientType.SELF,
        label: selfLabel,
        description: null,
      },
      {
        type: CPDReportRecipientType.MANAGER,
        label: "My manager",
        description: null,
      },
      {
        type: CPDReportRecipientType.ORGANIZATION,
        label: "My organization",
        description: null,
      },
      {
        type: CPDReportRecipientType.ASSOCIATION,
        label: "Certifying association",
        description: null,
      },
      {
        type: CPDReportRecipientType.OTHER,
        label: "Other recipient",
        description: null,
      },
    ];
  }

  private startOfTodayUtc() {
    const now = new Date();
    return new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
  }

  private suggestedEnd(start: Date, renewalMonths: number | null) {
    const months = renewalMonths && renewalMonths > 0 ? renewalMonths : 12;
    return new Date(
      Date.UTC(
        start.getUTCFullYear(),
        start.getUTCMonth() + months,
        start.getUTCDate(),
      ),
    );
  }
}
