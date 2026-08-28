import { ForbiddenException, Inject, Injectable } from "@nestjs/common";
import { ProfessionalPaginationInput } from "@professional/dtos/professional-pagination.input";
import { PROFESSIONAL_ENGAGEMENT_API } from "@contentAction/public/professional-engagement-api";
import { PROFESSIONAL_CATALOG_API } from "@course/public/professional-catalog-api";
import { ProfessionalSearchInput } from "@professional/dtos/professional-search.input";
import { deriveRoadmapProgress } from "@professional/utils/roadmap-progress.util";
import { ContentType, Role } from "@prisma/client";
import { earnedCredits } from "@professional/utils/roadmap-progress.util";
import { EVENTS_API } from "@events/public/events-api.token";
import { TUser } from "@common/types/user.types";

import { type ProfessionalEngagementApi } from "@contentAction/public/professional-engagement-api";
import { type ProfessionalCatalogApi } from "@course/public/professional-catalog-api";
import { type StepProgressRecord } from "@professional/utils/roadmap-progress.util";

import type { EventsApi } from "@events/public/events-api";

import * as T from "@professional/types/professional-service.types";

@Injectable()
export class ProfessionalRoadmapService {
  constructor(
    @Inject(PROFESSIONAL_ENGAGEMENT_API)
    private readonly engagement: ProfessionalEngagementApi,
    @Inject(PROFESSIONAL_CATALOG_API)
    private readonly catalog: ProfessionalCatalogApi,
    @Inject(EVENTS_API) private readonly events: EventsApi,
  ) {}

  private assertProfessional(user: TUser) {
    if (user.role !== Role.PROFESSIONAL)
      throw new ForbiddenException(
        "Only professional users can access this resource.",
      );
  }

  private clampProgress(value: number) {
    return Math.min(Math.max(Math.round(value), 0), 100);
  }

  private mapRoadmapEnrollment(
    item: T.RoadmapEnrollmentWithRoadmap,
    context: {
      records: StepProgressRecord[];
      creditsByContentId: Record<string, number>;
      requiredCredits: number | null;
    },
  ) {
    const roadmap = item.roadmap;
    const phases = roadmap.phases;

    const derived = deriveRoadmapProgress({
      phases,
      records: context.records,
      storedProgress: item.progress,
    });
    const phaseById = new Map(derived.phases.map((phase) => [phase.id, phase]));

    const mappedPhases: T.TMappedRoadmapPhase[] = phases.map((phase) => {
      const phaseProgress = phaseById.get(phase.id);
      return {
        id: phase.id,
        title: phase.title,
        order: phase.order,
        description: phase.description,
        stepsCount: phase.steps.length,
        progress: phaseProgress?.progress ?? 0,
        completed: phaseProgress?.completed ?? false,
        completedSteps: phaseProgress?.completedSteps ?? 0,
        estimatedWeeks: phase.estimatedWeeks,
        steps: phase.steps.map((step) => {
          const stepProgress = derived.steps.get(step.id);
          return {
            ...step,
            status: stepProgress?.status ?? null,
            completedAt: stepProgress?.completedAt ?? null,
          };
        }),
      };
    });

    const completedPhases = mappedPhases.filter(
      (phase) => phase.completed,
    ).length;
    const nextPhase = mappedPhases.find((phase) => !phase.completed);
    const progress = derived.progress;

    const allSteps = phases.flatMap((phase) => phase.steps);
    const earned = earnedCredits({
      steps: allSteps,
      progress: derived.steps,
      creditsByContentId: context.creditsByContentId,
    });

    const nextMilestoneProgress =
      progress >= 100
        ? 100
        : Math.min(Math.ceil((progress + 1) / 25) * 25, 100);

    return {
      id: item.id,
      progress,
      phasesCount: phases.length,
      totalSteps: derived.totalSteps,
      completedSteps: derived.completedSteps,
      completedPhases,
      slug: roadmap.slug,
      userId: item.userId,
      status: item.status,
      title: roadmap.title,
      level: roadmap.level,
      phases: mappedPhases,
      nextMilestoneProgress,
      roadmapId: item.roadmapId,
      updatedAt: item.updatedAt,
      imageUrl: roadmap.imageUrl,
      category: roadmap.category,
      enrolledAt: item.enrolledAt,
      completedAt: item.completedAt,
      roadmapStatus: roadmap.status,
      description: roadmap.description,
      nextPhaseTitle: nextPhase?.title ?? null,
      targetDate: item.targetDate,
      source: roadmap.source,
      coverageNote: roadmap.coverageNote,
      estimatedWeeks: roadmap.estimatedWeeks,
      earnedCredits: earned,
      requiredCredits: context.requiredCredits,
    };
  }

  async myRoadmaps(
    user: TUser,
    filter?: ProfessionalSearchInput,
    pagination?: ProfessionalPaginationInput,
  ) {
    this.assertProfessional(user);
    const take = pagination?.take ?? 12;
    const search = filter?.search?.trim();
    const roadmapIds = search
      ? await this.catalog.searchRoadmapIds(search)
      : undefined;
    const result = await this.engagement.roadmapEnrollments({
      userId: user.id,
      roadmapIds,
      cursor: pagination?.cursor,
      take,
    });
    const rows = result.rows;
    const items = rows.slice(0, take);
    const roadmaps = await this.catalog.roadmaps(
      items.map((item) => item.roadmapId as string),
    );
    const roadmapMap = new Map(
      roadmaps.map((roadmap) => [roadmap.id, roadmap]),
    );
    const merged = items.map((item) => ({
      ...item,
      roadmap: roadmapMap.get(item.roadmapId),
    })) as unknown as T.RoadmapEnrollmentWithRoadmap[];
    const records = await this.engagement.roadmapStepProgress({
      userId: user.id,
      enrollmentIds: merged.map((item) => item.id),
    });
    const recordsByEnrollment = new Map<string, StepProgressRecord[]>();
    for (const record of records) {
      const list = recordsByEnrollment.get(record.enrollmentId) ?? [];
      list.push(record);
      recordsByEnrollment.set(record.enrollmentId, list);
    }

    const eventIds = [
      ...new Set(
        merged.flatMap((item) =>
          item.roadmap.phases.flatMap((phase) =>
            phase.steps
              .filter((step) => step.contentType === ContentType.EVENT)
              .map((step) => step.contentId)
              .filter((id): id is string => Boolean(id)),
          ),
        ),
      ),
    ];
    const creditsByContentId = eventIds.length
      ? await this.events.eventCredits(eventIds)
      : {};

    return {
      totalCount: result.totalCount,
      items: merged.map((item) =>
        this.mapRoadmapEnrollment(item, {
          creditsByContentId,
          requiredCredits: null,
          records: recordsByEnrollment.get(item.id) ?? [],
        }),
      ),
      pageInfo: {
        hasNextPage: rows.length > take,
        nextCursor: rows.length > take ? items.at(-1)?.id : null,
      },
    };
  }

  async exploreRoadmaps(
    user: TUser,
    filter?: ProfessionalSearchInput,
    pagination?: ProfessionalPaginationInput,
  ) {
    this.assertProfessional(user);
    const take = pagination?.take ?? 12;
    const search = filter?.search?.trim();
    const enrolledRoadmapIds = await this.engagement.enrolledRoadmapIds(
      user.id,
    );
    const result = await this.catalog.exploreRoadmaps({
      excludedIds: enrolledRoadmapIds,
      search,
      cursor: pagination?.cursor,
      take,
    });
    const rows =
      result.rows as unknown as T.RoadmapEnrollmentWithRoadmap["roadmap"][];
    const items = rows.slice(0, take);
    const totalCount = result.totalCount;
    return {
      totalCount,
      items: items.map((roadmap) => {
        const phasesCount = roadmap.phases.length;
        const totalSteps = roadmap.phases.reduce((sum, phase) => {
          return sum + phase.steps.length;
        }, 0);
        return {
          totalSteps,
          phasesCount,
          id: roadmap.id,
          isEnrolled: false,
          slug: roadmap.slug,
          level: roadmap.level,
          title: roadmap.title,
          status: roadmap.status,
          category: roadmap.category,
          imageUrl: roadmap.imageUrl,
          description: roadmap.description,
          estimatedWeeks: Math.max(phasesCount * 2, 1),
        };
      }),
      pageInfo: {
        hasNextPage: rows.length > take,
        nextCursor: rows.length > take ? items.at(-1)?.id : null,
      },
    };
  }
}
