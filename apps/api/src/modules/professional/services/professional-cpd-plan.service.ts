import { CreateCpdPlanFromSuggestionInput } from "@professional/dtos/create-cpd-plan-from-suggestion.input";
import { CertificationSearchService } from "@professional/services/certification-search.service";
import { ProfessionalMessageCode } from "@professional/enums/message-code.enum";
import { CreateCpdPlanInput } from "@professional/dtos/create-cpd-plan.input";
import { UpdateCpdPlanInput } from "@professional/dtos/update-cpd-plan.input";
import { PrismaService } from "@prisma/prisma.service";
import { TUser } from "@common/types/user.types";
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  CPDEvidenceType,
  CPDPlanStatus,
  CPDReportRecipientType,
  PDUStatus,
  Prisma,
  Role,
} from "@prisma/client";
import {
  buildMissingRequirements,
  computeCategoryProgress,
  computeCompliance,
  computeEarned,
  countCategoriesMissing,
  requiresFileEvidence,
  round2,
} from "@professional/utils/cpd-progress.util";

const COUNTED_STATUS: Prisma.EnumPDUStatusFilter = { not: PDUStatus.REJECTED };

const planWithCategories = Prisma.validator<Prisma.CPDPlanDefaultArgs>()({
  include: { categories: { orderBy: { order: "asc" } } },
});

type PlanWithCategories = Prisma.CPDPlanGetPayload<typeof planWithCategories>;

@Injectable()
export class ProfessionalCpdPlanService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly certificationSearchService: CertificationSearchService,
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
      : this.suggestedEnd(
          start,
          cert.suggestedDeadline,
          cert.renewalCycleMonths,
        );
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

  private eligibleActivityWhere(
    user: TUser,
    plan: PlanWithCategories,
  ): Prisma.PDUActivityWhereInput {
    return {
      userId: user.id,
      status: COUNTED_STATUS,
      creditType: plan.creditType,
      date: { gte: plan.reportingStart, lte: plan.reportingEnd },
    };
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
    const earned = computeEarned(plan.initialCompletedCredits, activityCredits);
    const total = plan.totalRequiredCredits;
    const remaining = round2(Math.max(total - earned, 0));
    const progressPercent = total > 0 ? round2((earned / total) * 100) : 0;

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

  async reportRecipients(user: TUser) {
    this.assertProfessional(user);
    const self = await this.prismaService.user.findUnique({
      where: { id: user.id },
      select: { fullName: true, firstName: true, lastName: true, email: true },
    });
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

  private suggestedEnd(
    start: Date,
    suggestedDeadline: Date | null,
    renewalMonths: number | null,
  ) {
    if (suggestedDeadline && suggestedDeadline.getTime() > start.getTime())
      return suggestedDeadline;
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
