import { Injectable } from "@nestjs/common";
import {
  ContentEnrollmentStatus,
  ContentType,
  PaymentStatus,
  RoadmapEnrollmentStatus,
} from "@prisma/client";
import { PrismaService } from "@prisma/prisma.service";
import type { ProfessionalEngagementApi } from "@contentAction/public/professional-engagement-api";

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
}
