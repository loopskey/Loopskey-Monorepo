import { ForbiddenException, Injectable } from "@nestjs/common";
import { ProfessionalPaginationInput } from "@professional/dtos/professional-pagination.input";
import { Prisma, RoadmapStatus, Role } from "@prisma/client";
import { RoadmapEnrollmentStatus } from "@prisma/client";
import { ProfessionalSearchInput } from "@professional/dtos/professional-search.input";
import { PrismaService } from "@prisma/prisma.service";

import * as T from "@professional/types/professional-service.types";
import { TUser } from "@common/types/user.types";

@Injectable()
export class ProfessionalRoadmapService {
  constructor(private readonly prismaService: PrismaService) {}

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
    const where: Prisma.RoadmapEnrollmentWhereInput = {
      userId: user.id,
      status: {
        not: RoadmapEnrollmentStatus.UNENROLLED,
      },
      roadmap: {
        deletedAt: null,
      },
    };
    if (search) {
      where.roadmap = {
        deletedAt: null,
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      };
    }
    const rows = await this.prismaService.roadmapEnrollment.findMany({
      where,
      take: take + 1,
      ...(pagination?.cursor
        ? {
            cursor: { id: pagination.cursor },
            skip: 1,
          }
        : {}),
      orderBy: {
        enrolledAt: "desc",
      },
      include: T.roadmapEnrollmentWithRoadmapArgs.include,
    });
    const items = rows.slice(0, take);
    const totalCount = await this.prismaService.roadmapEnrollment.count({
      where,
    });
    return {
      totalCount,
      items: items.map((item) => this.mapRoadmapEnrollment(item)),
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
    const enrolledRoadmaps =
      await this.prismaService.roadmapEnrollment.findMany({
        where: {
          userId: user.id,
          status: {
            not: RoadmapEnrollmentStatus.UNENROLLED,
          },
        },
        select: {
          roadmapId: true,
        },
      });
    const enrolledRoadmapIds = enrolledRoadmaps.map((item) => item.roadmapId);
    const where: Prisma.RoadmapWhereInput = {
      deletedAt: null,
      status: RoadmapStatus.PUBLISHED,
      id: {
        notIn: enrolledRoadmapIds,
      },
    };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    const rows = await this.prismaService.roadmap.findMany({
      where,
      take: take + 1,
      ...(pagination?.cursor
        ? {
            cursor: { id: pagination.cursor },
            skip: 1,
          }
        : {}),
      orderBy: {
        createdAt: "desc",
      },
      include: {
        phases: {
          orderBy: { order: "asc" },
          include: {
            steps: true,
          },
        },
      },
    });
    const items = rows.slice(0, take);
    const totalCount = await this.prismaService.roadmap.count({
      where,
    });
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
