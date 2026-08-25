import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { ProfessionalRoadmapCandidateService } from "@professional/services/professional-roadmap-candidate.service";
import { PROFESSIONAL_ENGAGEMENT_API } from "@contentAction/public/professional-engagement-api";
import { ForbiddenException, Inject } from "@nestjs/common";
import { RoadmapGenerationViolation } from "@professional/utils/roadmap-generation-verify.util";
import { RoadmapDraftStatus, Role } from "@prisma/client";
import { PROFESSIONAL_CATALOG_API } from "@course/public/professional-catalog-api";
import { ProfessionalMessageCode } from "@professional/enums/message-code.enum";
import { verifyGeneratedRoadmap } from "@professional/utils/roadmap-generation-verify.util";
import { BadRequestException } from "@nestjs/common";
import { isDraftComplete } from "@professional/utils/roadmap-step-machine.util";
import { requestContext } from "@infrastructure/observability/request-context";
import { OutboxDeferral } from "@infrastructure/outbox/outbox-handler.port";
import { OutboxService } from "@infrastructure/outbox/outbox.service";
import { PrismaService } from "@prisma/prisma.service";
import { DraftRow } from "../types/professional-roadmap-chat.types";
import { slugify } from "@utils/slug.util";
import { TUser } from "@common/types/user.types";

import type { RankableCandidate } from "@professional/utils/roadmap-candidate-ranking.util";

import { type ProfessionalEngagementApi } from "@contentAction/public/professional-engagement-api";
import { type ProfessionalCatalogApi } from "@course/public/professional-catalog-api";
import { type CandidateKey } from "@professional/utils/roadmap-generation-verify.util";

import {
  SERVICE_AI_LIMITS,
  SERVICE_AI_PORT,
  type GenerateData,
  type PlatformContentType,
  type RoadmapContentCandidate,
  type RoadmapCpdContext,
  type ServiceAiPort,
} from "@infrastructure/service-ai/service-ai.port";

import {
  LOCAL_CAPACITY_WAIT_SECONDS,
  MAX_CONCURRENT_GENERATIONS,
  REDUCED_CANDIDATE_CAP,
  ROADMAP_GENERATION_EVENT,
  RoadmapGenerationPayload,
  round2,
} from "@professional/utils/professional.helper";

@Injectable()
export class ProfessionalRoadmapGenerationService {
  private readonly logger = new Logger(
    ProfessionalRoadmapGenerationService.name,
  );
  private inFlight = 0;

  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
    private readonly candidates: ProfessionalRoadmapCandidateService,
    @Inject(SERVICE_AI_PORT) private readonly ai: ServiceAiPort,
    @Inject(PROFESSIONAL_CATALOG_API)
    private readonly catalog: ProfessionalCatalogApi,
    @Inject(PROFESSIONAL_ENGAGEMENT_API)
    private readonly engagement: ProfessionalEngagementApi,
  ) {}

  private assertProfessional(user: TUser) {
    if (user.role !== Role.PROFESSIONAL)
      throw new ForbiddenException(
        "Only professional users can access this resource.",
      );
  }

  async requestGeneration(user: TUser, draftId: string) {
    this.assertProfessional(user);

    const draft = await this.prisma.roadmapDraft.findFirst({
      where: { id: draftId, userId: user.id },
      include: { enrollment: true },
    });
    if (!draft)
      throw new NotFoundException(
        ProfessionalMessageCode.ROADMAP_DRAFT_NOT_FOUND,
      );

    if (draft.enrollment)
      throw new BadRequestException(
        ProfessionalMessageCode.ROADMAP_DRAFT_NOT_READY,
      );

    if (!isDraftComplete(draft))
      throw new BadRequestException(
        ProfessionalMessageCode.ROADMAP_DRAFT_NOT_READY,
      );

    const correlationId = requestContext.correlationId() ?? undefined;
    const claimed = await this.prisma.$transaction(async (tx) => {
      const moved = await tx.roadmapDraft.updateMany({
        where: {
          id: draftId,
          userId: user.id,
          status: { in: [RoadmapDraftStatus.READY, RoadmapDraftStatus.FAILED] },
        },
        data: { status: RoadmapDraftStatus.GENERATING, failureReason: null },
      });
      if (moved.count === 0) return false;

      await this.outbox.append(
        {
          correlationId,
          eventName: ROADMAP_GENERATION_EVENT,
          aggregateId: draftId,
          aggregateType: "RoadmapDraft",
          payload: { draftId } satisfies RoadmapGenerationPayload,
        },
        tx,
      );
      return true;
    });

    if (!claimed && draft.status !== RoadmapDraftStatus.GENERATING)
      throw new BadRequestException(
        ProfessionalMessageCode.ROADMAP_DRAFT_NOT_READY,
      );

    return this.prisma.roadmapDraft.findUniqueOrThrow({
      where: { id: draftId },
    });
  }

  async runGeneration(draftId: string) {
    if (this.inFlight >= MAX_CONCURRENT_GENERATIONS)
      throw new OutboxDeferral(
        LOCAL_CAPACITY_WAIT_SECONDS,
        "Local generation concurrency limit reached.",
      );

    this.inFlight += 1;
    try {
      await this.generate(draftId);
    } finally {
      this.inFlight -= 1;
    }
  }

  private async generate(draftId: string) {
    const draft = await this.prisma.roadmapDraft.findUnique({
      where: { id: draftId },
      include: { cpdPlan: true, certification: true },
    });
    if (!draft) return;
    const existing =
      await this.engagement.hasRoadmapEnrollmentForDraft(draftId);
    if (existing) {
      await this.prisma.roadmapDraft.updateMany({
        where: { id: draftId, status: RoadmapDraftStatus.GENERATING },
        data: { status: RoadmapDraftStatus.COMPLETED },
      });
      return;
    }

    const cpd = await this.buildCpdContext(draft);
    const started = Date.now();

    let cap: number = SERVICE_AI_LIMITS.candidatesMaxItems;
    let attempted = 0;
    let selected: RankableCandidate[] = [];
    let data: GenerateData | null = null;
    while (attempted < 2 && data === null) {
      attempted += 1;
      selected = await this.candidates.build({
        cap,
        subjects: draft.subjects,
        skillLevel: draft.skillLevel,
        budgetPreference: draft.budgetPreference,
        preferredContentTypes: draft.preferredContentTypes,
        creditsNeeded: (cpd?.remainingCredits ?? 0) > 0,
      });

      if (selected.length === 0) {
        await this.fail(draftId, "NO_CANDIDATES");
        return;
      }

      const result = await this.ai.generate({
        cpd,
        today: new Date(),
        draft: this.toDraftState(draft),
        maxPhases: SERVICE_AI_LIMITS.maxPhasesDefault,
        candidates: selected.map(toContentCandidate),
      });

      if (result.ok) {
        data = result.data;
        break;
      }

      if (result.kind === "truncated" && attempted < 2) {
        cap = Math.min(REDUCED_CANDIDATE_CAP, selected.length - 1);
        if (cap < 1) {
          await this.fail(draftId, result.messageCode);
          return;
        }
        continue;
      }

      if (result.kind === "busy")
        throw new OutboxDeferral(
          result.retryAfterSeconds ?? LOCAL_CAPACITY_WAIT_SECONDS,
          "Roadmap AI service reported capacity limits.",
        );

      if (result.kind === "refused") {
        await this.fail(draftId, result.messageCode);
        return;
      }

      if (!result.retryable) {
        await this.fail(draftId, result.messageCode);
        return;
      }
      throw new Error(`Roadmap generation failed: ${result.messageCode}`);
    }

    if (!data) {
      await this.fail(
        draftId,
        ProfessionalMessageCode.ROADMAP_GENERATION_FAILED,
      );
      return;
    }

    const verdict = verifyGeneratedRoadmap({
      data,
      freeOnly: draft.budgetPreference === "FREE_ONLY",
      candidates: selected.map(toCandidateKey),
    });

    if (!verdict.ok) {
      this.logger.error("Generated roadmap violated a guarantee", {
        draftId,
        violation: verdict.violation,
      });
      await this.fail(draftId, verdict.violation);
      return;
    }

    await this.persist({ draft, data, verdict });

    this.logger.log("Roadmap generated", {
      draftId,
      attempts: attempted,
      candidateCount: selected.length,
      phaseCount: verdict.phases.length,
      stepCount: verdict.phases.reduce(
        (sum, phase) => sum + phase.steps.length,
        0,
      ),
      droppedContentIds: verdict.droppedContentIds.length,
      durationMs: Date.now() - started,
    });
  }

  private async persist(input: {
    draft: DraftRow;
    data: GenerateData;
    verdict: Extract<ReturnType<typeof verifyGeneratedRoadmap>, { ok: true }>;
  }) {
    const { draft, data, verdict } = input;
    const coverage = verdict.droppedContentIds.length
      ? [
          data.coverageNote,
          `${verdict.droppedContentIds.length} suggested items were not in this catalogue and are shown as guidance without a link.`,
        ]
          .filter(Boolean)
          .join(" ")
      : data.coverageNote;
    await this.prisma.$transaction(async (tx) => {
      const roadmap = await this.catalog.createGeneratedRoadmap(
        {
          title: data.title,
          ownerId: draft.userId,
          description: data.description,
          coverageNote: coverage,
          estimatedWeeks: data.estimatedWeeks,
          slug: `${slugify(data.title).slice(0, 60)}-${draft.id.slice(-8)}`,
          phases: verdict.phases.map((phase) => ({
            order: phase.order,
            title: phase.title,
            description: phase.description,
            estimatedWeeks: phase.estimatedWeeks,
            steps: phase.steps.map((step) => ({
              order: step.order,
              title: step.title,
              description: step.description,
              contentId: step.contentId,
              contentType: step.contentType,
              estimatedMinutes: step.estimatedMinutes,
            })),
          })),
        },
        tx,
      );

      await this.engagement.createRoadmapEnrollment(
        {
          draftId: draft.id,
          userId: draft.userId,
          roadmapId: roadmap.id,
          targetDate: draft.targetDate,
        },
        tx,
      );

      await tx.roadmapDraft.update({
        where: { id: draft.id },
        data: { status: RoadmapDraftStatus.COMPLETED, failureReason: null },
      });
    });
  }

  async fail(draftId: string, reason: string) {
    await this.prisma.roadmapDraft.updateMany({
      where: { id: draftId, status: RoadmapDraftStatus.GENERATING },
      data: { status: RoadmapDraftStatus.FAILED, failureReason: reason },
    });
  }

  private toDraftState(draft: DraftRow) {
    return {
      goal: draft.goal,
      context: draft.context,
      subjects: draft.subjects,
      goalReason: draft.goalReason,
      targetRole: draft.targetRole,
      targetDate: draft.targetDate,
      cpdEnabled: draft.cpdEnabled,
      skillLevel: draft.skillLevel,
      timeCommitment: draft.timeCommitment,
      budgetPreference: draft.budgetPreference,
      preferredFormats: draft.preferredFormats,
      preferredContentTypes: draft.preferredContentTypes,
      certificationName:
        draft.certification?.name ?? draft.certificationName ?? null,
    };
  }

  private async buildCpdContext(
    draft: DraftRow,
  ): Promise<RoadmapCpdContext | null> {
    if (!draft.cpdEnabled) return null;

    const certificationName =
      draft.certification?.name ?? draft.certificationName;
    if (!certificationName) return null;

    const plan = draft.cpdPlan;
    let required = draft.requiredCredits ?? 0;
    let completed = draft.completedCredits ?? 0;
    let organization = draft.certification?.organization ?? "Self-reported";
    let reportingEnd: Date | null = null;

    if (plan) {
      const aggregate = await this.prisma.pDUActivity.aggregate({
        where: {
          userId: draft.userId,
          creditType: plan.creditType,
          date: { gte: plan.reportingStart, lte: plan.reportingEnd },
        },
        _sum: { pdus: true },
      });
      required = plan.totalRequiredCredits;
      completed = round2(
        plan.initialCompletedCredits + Number(aggregate._sum.pdus ?? 0),
      );
      organization = plan.organization;
      reportingEnd = plan.reportingEnd;
    }

    return {
      organization,
      certificationName,
      reportingEnd,
      completedCredits: round2(completed),
      totalRequiredCredits: round2(required),
      remainingCredits: round2(Math.max(required - completed, 0)),
    };
  }
}

const toContentCandidate = (
  candidate: RankableCandidate,
): RoadmapContentCandidate => ({
  tags: candidate.tags,
  title: candidate.title,
  isFree: candidate.isFree,
  summary: candidate.summary,
  credits: candidate.credits,
  contentId: candidate.contentId,
  contentType: candidate.contentType,
  durationMinutes: candidate.durationMinutes,
  level: candidate.level,
});

const toCandidateKey = (candidate: RankableCandidate): CandidateKey => ({
  isFree: candidate.isFree,
  contentId: candidate.contentId,
  contentType: candidate.contentType as PlatformContentType,
});

export { RoadmapGenerationViolation };
