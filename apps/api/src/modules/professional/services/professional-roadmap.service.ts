import { ForbiddenException, Inject, Injectable } from "@nestjs/common";
import { type ProfessionalEngagementApi } from "@contentAction/public/professional-engagement-api";
import { ProfessionalPaginationInput } from "@professional/dtos/professional-pagination.input";
import { type ProfessionalCatalogApi } from "@course/public/professional-catalog-api";
import { PROFESSIONAL_ENGAGEMENT_API } from "@contentAction/public/professional-engagement-api";
import { PROFESSIONAL_CATALOG_API } from "@course/public/professional-catalog-api";
import { ProfessionalSearchInput } from "@professional/dtos/professional-search.input";
import { TUser } from "@common/types/user.types";
import { Role } from "@prisma/client";

import * as T from "@professional/types/professional-service.types";

@Injectable()
export class ProfessionalRoadmapService {
  constructor(
    @Inject(PROFESSIONAL_ENGAGEMENT_API)
    private readonly engagement: ProfessionalEngagementApi,
    @Inject(PROFESSIONAL_CATALOG_API)
    private readonly catalog: ProfessionalCatalogApi,
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

  private getPhaseProgress(
    overallProgress: number,
    phaseIndex: number,
    phasesCount: number,
  ) {
    if (!phasesCount) return 0;
    const phaseStart = (phaseIndex / phasesCount) * 100;
    const phaseEnd = ((phaseIndex + 1) / phasesCount) * 100;
    const phaseSize = phaseEnd - phaseStart;
    const rawProgress = ((overallProgress - phaseStart) / phaseSize) * 100;
    return this.clampProgress(rawProgress);
  }

  private mapRoadmapEnrollment(item: T.RoadmapEnrollmentWithRoadmap) {
    const roadmap = item.roadmap;
    const phases = roadmap.phases;
    const phasesCount = phases.length;
    const totalSteps = phases.reduce(
      (sum: number, phase: T.TRoadmapPhaseWithSteps) => {
        return sum + phase.steps.length;
      },
      0,
    );
    const completedSteps = Math.round((totalSteps * item.progress) / 100);
    const mappedPhases: T.TMappedRoadmapPhase[] = phases.map(
      (phase: T.TRoadmapPhaseWithSteps, index: number) => {
        const phaseProgress = this.getPhaseProgress(
          item.progress,
          index,
          phasesCount,
        );
        return {
          id: phase.id,
          title: phase.title,
          order: phase.order,
          steps: phase.steps,
          progress: phaseProgress,
          description: phase.description,
          stepsCount: phase.steps.length,
          completed: phaseProgress >= 100,
        };
      },
    );

    const completedPhases = mappedPhases.filter(
      (phase: T.TMappedRoadmapPhase) => phase.completed,
    ).length;

    const nextPhase = mappedPhases.find(
      (phase: T.TMappedRoadmapPhase) => !phase.completed,
    );

    const nextMilestoneProgress =
      item.progress >= 100
        ? 100
        : Math.min(Math.ceil((item.progress + 1) / 25) * 25, 100);
    return {
      id: item.id,
      totalSteps,
      phasesCount,
      completedSteps,
      completedPhases,
      slug: roadmap.slug,
      userId: item.userId,
      status: item.status,
      title: roadmap.title,
      level: roadmap.level,
      phases: mappedPhases,
      nextMilestoneProgress,
      progress: item.progress,
      roadmapId: item.roadmapId,
      updatedAt: item.updatedAt,
      imageUrl: roadmap.imageUrl,
      category: roadmap.category,
      enrolledAt: item.enrolledAt,
      completedAt: item.completedAt,
      roadmapStatus: roadmap.status,
      description: roadmap.description,
      nextPhaseTitle: nextPhase?.title ?? null,
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
    return {
      totalCount: result.totalCount,
      items: merged.map((item) => this.mapRoadmapEnrollment(item)),
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
