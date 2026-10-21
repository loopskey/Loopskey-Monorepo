import { PaymentStatus, Prisma, RoadmapEnrollmentStatus } from "@prisma/client";
import { ContentEnrollmentStatus, ContentType } from "@prisma/client";
import { RoadmapStepProgressStatus } from "@prisma/client";
import { ProfessionalEngagementApi } from "@contentAction/public/professional-engagement-api";
import { PrismaService } from "@prisma/prisma.service";
import { Injectable } from "@nestjs/common";

import type { RoadmapEnrollmentReplacement } from "@contentAction/public/professional-engagement-api";
import type { RoadmapEnrollmentInput } from "@contentAction/public/professional-engagement-api";
import type { UnitOfWork } from "@contentAction/public/professional-engagement-api";

@Injectable()
export class ProfessionalEngagementApiService
  implements ProfessionalEngagementApi
{
  constructor(private readonly prisma: PrismaService) {}

  async courseEnrollments(input: {
    userId: string;
    courseIds?: string[];
    cursor?: string;
    take: number;
  }) {
    const where = {
      userId: input.userId,
      contentType: ContentType.COURSE,
      ...(input.courseIds ? { contentId: { in: input.courseIds } } : {}),
    };
    const rows = await this.prisma.contentEnrollment.findMany({
      where,
      take: input.take + 1,
      ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      orderBy: { createdAt: "desc" },
    });
    return {
      rows,
      totalCount: await this.prisma.contentEnrollment.count({ where }),
    };
  }

  async courseCounts(userId: string) {
    const base = { userId, contentType: ContentType.COURSE };
    const [active, completed, total] = await Promise.all([
      this.prisma.contentEnrollment.count({
        where: { ...base, status: ContentEnrollmentStatus.ACTIVE },
      }),
      this.prisma.contentEnrollment.count({
        where: { ...base, status: ContentEnrollmentStatus.COMPLETED },
      }),
      this.prisma.contentEnrollment.count({ where: base }),
    ]);
    return { active, completed, total };
  }

  async roadmapEnrollments(input: {
    userId: string;
    roadmapIds?: string[];
    cursor?: string;
    take: number;
  }) {
    const where = {
      userId: input.userId,
      status: { not: RoadmapEnrollmentStatus.UNENROLLED },
      ...(input.roadmapIds ? { roadmapId: { in: input.roadmapIds } } : {}),
    };
    const rows = await this.prisma.roadmapEnrollment.findMany({
      where,
      take: input.take + 1,
      ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      orderBy: { enrolledAt: "desc" },
    });
    return {
      rows,
      totalCount: await this.prisma.roadmapEnrollment.count({ where }),
    };
  }

  async enrolledRoadmapIds(userId: string) {
    const rows = await this.prisma.roadmapEnrollment.findMany({
      where: { userId, status: { not: RoadmapEnrollmentStatus.UNENROLLED } },
      select: { roadmapId: true },
    });
    return rows.map((row) => row.roadmapId);
  }

  async roadmapStepCompletionCounts(input: {
    userId: string;
    enrollmentIds: string[];
  }) {
    if (!input.enrollmentIds.length) return {};
    const groups = await this.prisma.roadmapStepProgress.groupBy({
      by: ["enrollmentId", "status"],
      where: {
        enrollmentId: { in: input.enrollmentIds },
        enrollment: { userId: input.userId },
      },
      _count: { _all: true },
    });

    const counts: Record<string, number> = {};
    for (const group of groups) {
      counts[group.enrollmentId] ??= 0;
      if (group.status === RoadmapStepProgressStatus.COMPLETED) {
        counts[group.enrollmentId] += group._count._all;
      }
    }
    return counts;
  }

  roadmapEnrollmentById(input: { userId: string; enrollmentId: string }) {
    return this.prisma.roadmapEnrollment.findFirst({
      where: { id: input.enrollmentId, userId: input.userId },
      select: {
        id: true,
        userId: true,
        status: true,
        draftId: true,
        progress: true,
        roadmapId: true,
        targetDate: true,
        completedAt: true,
      },
    });
  }

  async roadmapStepProgress(input: {
    userId: string;
    enrollmentIds: string[];
  }) {
    if (input.enrollmentIds.length === 0) return [];
    return this.prisma.roadmapStepProgress.findMany({
      where: {
        enrollmentId: { in: input.enrollmentIds },
        enrollment: { userId: input.userId },
      },
      select: {
        stepId: true,
        status: true,
        completedAt: true,
        enrollmentId: true,
      },
    });
  }

  async completeRoadmapEnrollment(input: {
    userId: string;
    enrollmentId: string;
  }) {
    await this.prisma.roadmapEnrollment.updateMany({
      where: {
        id: input.enrollmentId,
        userId: input.userId,
        status: { not: RoadmapEnrollmentStatus.COMPLETED },
      },
      data: {
        status: RoadmapEnrollmentStatus.COMPLETED,
        completedAt: new Date(),
      },
    });
  }

  async reopenRoadmapEnrollment(input: {
    userId: string;
    enrollmentId: string;
  }) {
    await this.prisma.roadmapEnrollment.updateMany({
      where: {
        id: input.enrollmentId,
        userId: input.userId,
        status: RoadmapEnrollmentStatus.COMPLETED,
      },
      data: {
        status: RoadmapEnrollmentStatus.ACTIVE,
        completedAt: null,
      },
    });
  }

  private async ownedEnrollment(userId: string, enrollmentId: string) {
    return this.prisma.roadmapEnrollment.findFirst({
      where: { id: enrollmentId, userId },
      select: { id: true },
    });
  }

  async startRoadmapStep(input: {
    userId: string;
    enrollmentId: string;
    stepId: string;
  }) {
    const enrollment = await this.ownedEnrollment(
      input.userId,
      input.enrollmentId,
    );
    if (!enrollment) return null;
    return this.prisma.roadmapStepProgress.upsert({
      where: {
        enrollmentId_stepId: {
          enrollmentId: input.enrollmentId,
          stepId: input.stepId,
        },
      },
      create: {
        enrollmentId: input.enrollmentId,
        stepId: input.stepId,
        status: RoadmapStepProgressStatus.IN_PROGRESS,
      },
      update: {},
    });
  }

  async completeRoadmapStep(input: {
    userId: string;
    enrollmentId: string;
    stepId: string;
  }) {
    const enrollment = await this.ownedEnrollment(
      input.userId,
      input.enrollmentId,
    );
    if (!enrollment) return null;

    const key = {
      enrollmentId_stepId: {
        enrollmentId: input.enrollmentId,
        stepId: input.stepId,
      },
    };
    const existing = await this.prisma.roadmapStepProgress.findUnique({
      where: key,
    });
    if (existing?.status === RoadmapStepProgressStatus.COMPLETED)
      return existing;
    const completedAt = new Date();
    return this.prisma.roadmapStepProgress.upsert({
      where: key,
      create: {
        enrollmentId: input.enrollmentId,
        stepId: input.stepId,
        status: RoadmapStepProgressStatus.COMPLETED,
        completedAt,
      },
      update: {
        status: RoadmapStepProgressStatus.COMPLETED,
        completedAt,
      },
    });
  }

  async payments(input: {
    userId: string;
    search?: string;
    cursor?: string;
    take: number;
  }) {
    const where = {
      userId: input.userId,
      ...(input.search
        ? { title: { contains: input.search, mode: "insensitive" as const } }
        : {}),
    };
    const rows = await this.prisma.payment.findMany({
      where,
      take: input.take + 1,
      ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      orderBy: { createdAt: "desc" },
    });
    const overview = await this.prisma.payment.aggregate({
      where: { userId: input.userId, status: PaymentStatus.PAID },
      _sum: { amount: true },
      _count: { id: true },
    });
    const items = rows.slice(0, input.take);
    return {
      items,
      totalCount: await this.prisma.payment.count({ where }),
      totalSpent: Number(overview._sum.amount ?? 0),
      totalTransactions: overview._count.id,
      pageInfo: {
        hasNextPage: rows.length > input.take,
        nextCursor: rows.length > input.take ? items.at(-1)?.id : null,
      },
    };
  }

  async hasRoadmapEnrollmentForDraft(draftId: string) {
    const found = await this.prisma.roadmapEnrollment.findUnique({
      where: { draftId },
      select: { id: true },
    });
    return found !== null;
  }

  async createRoadmapEnrollment(
    input: RoadmapEnrollmentInput,
    unitOfWork: UnitOfWork,
  ) {
    const writer = unitOfWork as Prisma.TransactionClient;
    const created = await writer.roadmapEnrollment.create({
      data: {
        userId: input.userId,
        draftId: input.draftId,
        roadmapId: input.roadmapId,
        targetDate: input.targetDate,
        status: RoadmapEnrollmentStatus.ACTIVE,
      },
      select: { id: true },
    });
    if (input.replaces)
      await this.carryOverProgress(
        writer,
        { userId: input.userId, enrollmentId: created.id },
        input.replaces,
      );
  }

  private async carryOverProgress(
    writer: Prisma.TransactionClient,
    target: { userId: string; enrollmentId: string },
    replaces: RoadmapEnrollmentReplacement,
  ) {
    const previous = await writer.roadmapEnrollment.findFirst({
      where: {
        userId: target.userId,
        roadmapId: replaces.roadmapId,
        status: { not: RoadmapEnrollmentStatus.UNENROLLED },
      },
      select: { id: true },
    });
    if (!previous) return;

    const retired = await writer.roadmapEnrollment.updateMany({
      where: {
        id: previous.id,
        status: { not: RoadmapEnrollmentStatus.UNENROLLED },
      },
      data: { status: RoadmapEnrollmentStatus.UNENROLLED },
    });
    if (retired.count !== 1) return;

    const targetByStep = new Map(
      replaces.carriedSteps.map((step) => [step.fromStepId, step.toStepId]),
    );
    if (targetByStep.size === 0) return;

    const records = await writer.roadmapStepProgress.findMany({
      where: {
        enrollmentId: previous.id,
        stepId: { in: [...targetByStep.keys()] },
      },
      select: {
        stepId: true,
        status: true,
        startedAt: true,
        completedAt: true,
      },
    });

    const carried = new Map<string, (typeof records)[number]>();
    for (const record of records) {
      const toStepId = targetByStep.get(record.stepId);
      if (!toStepId) continue;
      const kept = carried.get(toStepId);
      const outranks =
        record.status === RoadmapStepProgressStatus.COMPLETED &&
        kept?.status !== RoadmapStepProgressStatus.COMPLETED;
      if (!kept || outranks) carried.set(toStepId, record);
    }
    if (carried.size === 0) return;

    await writer.roadmapStepProgress.createMany({
      data: [...carried].map(([stepId, record]) => ({
        stepId,
        enrollmentId: target.enrollmentId,
        status: record.status,
        startedAt: record.startedAt,
        completedAt: record.completedAt,
      })),
    });

    const completed = [...carried.values()].filter(
      (record) => record.status === RoadmapStepProgressStatus.COMPLETED,
    ).length;
    if (replaces.stepCount > 0 && completed >= replaces.stepCount)
      await writer.roadmapEnrollment.update({
        where: { id: target.enrollmentId },
        data: {
          status: RoadmapEnrollmentStatus.COMPLETED,
          completedAt: new Date(),
        },
      });
  }

  async unenrollRoadmap(input: { userId: string; enrollmentId: string }) {
    await this.prisma.roadmapEnrollment.updateMany({
      where: {
        id: input.enrollmentId,
        userId: input.userId,
        status: { not: RoadmapEnrollmentStatus.UNENROLLED },
      },
      data: { status: RoadmapEnrollmentStatus.UNENROLLED },
    });
  }
}
