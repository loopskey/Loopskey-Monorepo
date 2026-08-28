import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { ProfessionalRoadmapCandidateService } from "@professional/services/professional-roadmap-candidate.service";
import { RoadmapStepProgressStatus, Role } from "@prisma/client";
import { PROFESSIONAL_ENGAGEMENT_API } from "@contentAction/public/professional-engagement-api";
import { ForbiddenException, Inject } from "@nestjs/common";
import { PROFESSIONAL_CATALOG_API } from "@course/public/professional-catalog-api";
import { ProfessionalMessageCode } from "@professional/enums/message-code.enum";
import { deriveRoadmapProgress } from "@professional/utils/roadmap-progress.util";
import { BadRequestException } from "@nestjs/common";
import { requestContext } from "@infrastructure/observability/request-context";
import { PrismaService } from "@prisma/prisma.service";
import { RoadmapShape } from "@professional/types/professional-roadmap-chat.types";
import { TUser } from "@common/types/user.types";

import { type ProfessionalEngagementApi } from "@contentAction/public/professional-engagement-api";
import { type ProfessionalCatalogApi } from "@course/public/professional-catalog-api";

@Injectable()
export class ProfessionalRoadmapProgressService {
  private readonly logger = new Logger(ProfessionalRoadmapProgressService.name);

  constructor(
    @Inject(PROFESSIONAL_ENGAGEMENT_API)
    private readonly engagement: ProfessionalEngagementApi,
    @Inject(PROFESSIONAL_CATALOG_API)
    private readonly catalog: ProfessionalCatalogApi,
    private readonly candidates: ProfessionalRoadmapCandidateService,
    private readonly prisma: PrismaService,
  ) {}

  private assertProfessional(user: TUser) {
    if (user.role !== Role.PROFESSIONAL)
      throw new ForbiddenException(
        "Only professional users can access this resource.",
      );
  }

  private async resolveTarget(
    user: TUser,
    enrollmentId: string,
    stepId: string,
  ) {
    const enrollment = await this.engagement.roadmapEnrollmentById({
      userId: user.id,
      enrollmentId,
    });
    if (!enrollment)
      throw new NotFoundException(
        ProfessionalMessageCode.ROADMAP_ENROLLMENT_NOT_FOUND,
      );

    const [roadmap] = (await this.catalog.roadmaps([
      enrollment.roadmapId,
    ])) as unknown as RoadmapShape[];
    if (!roadmap)
      throw new NotFoundException(
        ProfessionalMessageCode.ROADMAP_ENROLLMENT_NOT_FOUND,
      );

    const belongs = roadmap.phases.some((phase) =>
      phase.steps.some((step) => step.id === stepId),
    );
    if (!belongs)
      throw new BadRequestException(
        ProfessionalMessageCode.ROADMAP_STEP_NOT_IN_ENROLLMENT,
      );

    return { enrollment, roadmap };
  }

  async startStep(user: TUser, enrollmentId: string, stepId: string) {
    this.assertProfessional(user);
    await this.resolveTarget(user, enrollmentId, stepId);
    await this.engagement.startRoadmapStep({
      userId: user.id,
      enrollmentId,
      stepId,
    });
    return this.summarise(user, enrollmentId, stepId);
  }

  async completeStep(user: TUser, enrollmentId: string, stepId: string) {
    this.assertProfessional(user);
    const { roadmap } = await this.resolveTarget(user, enrollmentId, stepId);
    await this.engagement.completeRoadmapStep({
      userId: user.id,
      enrollmentId,
      stepId,
    });
    const summary = await this.summarise(user, enrollmentId, stepId, roadmap);
    if (summary.progress >= 100)
      await this.engagement.completeRoadmapEnrollment({
        userId: user.id,
        enrollmentId,
      });
    this.logger.log("Roadmap step completed", {
      stepId,
      enrollmentId,
      progress: summary.progress,
      correlationId: requestContext.correlationId() ?? null,
    });

    return summary;
  }

  private async summarise(
    user: TUser,
    enrollmentId: string,
    stepId: string,
    known?: RoadmapShape,
  ) {
    const enrollment = await this.engagement.roadmapEnrollmentById({
      userId: user.id,
      enrollmentId,
    });
    if (!enrollment)
      throw new NotFoundException(
        ProfessionalMessageCode.ROADMAP_ENROLLMENT_NOT_FOUND,
      );

    const roadmap =
      known ??
      (
        (await this.catalog.roadmaps([
          enrollment.roadmapId,
        ])) as unknown as RoadmapShape[]
      )[0];

    const records = await this.engagement.roadmapStepProgress({
      userId: user.id,
      enrollmentIds: [enrollmentId],
    });

    const derived = deriveRoadmapProgress({
      phases: roadmap?.phases ?? [],
      records,
      storedProgress: enrollment.progress,
    });

    const phase = (roadmap?.phases ?? []).find((item) =>
      item.steps.some((step) => step.id === stepId),
    );
    const phaseProgress = derived.phases.find((item) => item.id === phase?.id);
    const step = derived.steps.get(stepId);

    return {
      stepId,
      enrollmentId,
      progress: derived.progress,
      totalSteps: derived.totalSteps,
      completedSteps: derived.completedSteps,
      phaseId: phase?.id ?? null,
      phaseProgress: phaseProgress?.progress ?? 0,
      phaseCompleted: phaseProgress?.completed ?? false,
      status: step?.status ?? RoadmapStepProgressStatus.IN_PROGRESS,
      completedAt: step?.completedAt ?? null,
    };
  }

  async recommendations(user: TUser, enrollmentId: string, take = 6) {
    this.assertProfessional(user);

    const enrollment = await this.engagement.roadmapEnrollmentById({
      userId: user.id,
      enrollmentId,
    });
    if (!enrollment)
      throw new NotFoundException(
        ProfessionalMessageCode.ROADMAP_ENROLLMENT_NOT_FOUND,
      );

    const [roadmap] = (await this.catalog.roadmaps([
      enrollment.roadmapId,
    ])) as unknown as {
      phases: { steps: { contentId: string | null }[] }[];
    }[];

    const draft = enrollment.draftId
      ? await this.prisma.roadmapDraft.findUnique({
          where: { id: enrollment.draftId },
          select: {
            subjects: true,
            skillLevel: true,
            budgetPreference: true,
            preferredContentTypes: true,
          },
        })
      : null;
    if (!draft) return [];
    const alreadyInRoadmap = new Set(
      (roadmap?.phases ?? []).flatMap((phase) =>
        phase.steps
          .map((step) => step.contentId)
          .filter((id): id is string => Boolean(id)),
      ),
    );

    const pool = await this.candidates.build({
      cap: take + alreadyInRoadmap.size,
      subjects: draft.subjects,
      skillLevel: draft.skillLevel,
      budgetPreference: draft.budgetPreference,
      preferredContentTypes: draft.preferredContentTypes,
      creditsNeeded: false,
    });

    return pool
      .filter((item) => !alreadyInRoadmap.has(item.contentId))
      .slice(0, take)
      .map((item) => ({
        title: item.title,
        isFree: item.isFree,
        summary: item.summary,
        credits: item.credits,
        contentId: item.contentId,
        contentType: item.contentType,
        durationMinutes: item.durationMinutes,
      }));
  }
}
