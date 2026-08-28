import { EventDeliveryMode, EventRegistrationStatus } from "@prisma/client";
import {
  ProfessionalCatalogApi,
  RoadmapCandidateQuery,
  type GeneratedRoadmapInput,
  type UnitOfWork,
} from "@course/public/professional-catalog-api";
import { CourseStatus, RoadmapStatus } from "@prisma/client";
import { Prisma, RoadmapSource } from "@prisma/client";
import { PrismaService } from "@prisma/prisma.service";
import { Injectable } from "@nestjs/common";

const ROADMAP_INCLUDE = {
  phases: { orderBy: { order: "asc" as const }, include: { steps: true } },
};

@Injectable()
export class ProfessionalCatalogApiService implements ProfessionalCatalogApi {
  constructor(private readonly prisma: PrismaService) {}

  async searchCourseIds(search: string) {
    const rows = await this.prisma.course.findMany({
      where: {
        deletedAt: null,
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { instructor: { contains: search, mode: "insensitive" } },
        ],
      },
      select: { id: true },
      take: 100,
    });
    return rows.map((row) => row.id);
  }

  courses(ids: string[]) {
    return this.prisma.course.findMany({
      where: { id: { in: ids }, deletedAt: null },
      select: {
        id: true,
        slug: true,
        title: true,
        level: true,
        price: true,
        rating: true,
        isFree: true,
        imageUrl: true,
        category: true,
        currency: true,
        description: true,
        ratingCount: true,
        durationMinutes: true,
        providerId: true,
      },
    });
  }

  roadmaps(ids: string[]) {
    return this.prisma.roadmap.findMany({
      where: { id: { in: ids }, deletedAt: null },
      include: ROADMAP_INCLUDE,
    });
  }

  async searchRoadmapIds(search: string) {
    const rows = await this.prisma.roadmap.findMany({
      where: {
        deletedAt: null,
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      },
      select: { id: true },
    });
    return rows.map((row) => row.id);
  }

  async exploreRoadmaps(input: {
    excludedIds: string[];
    search?: string;
    cursor?: string;
    take: number;
  }) {
    const where: Prisma.RoadmapWhereInput = {
      deletedAt: null,
      status: RoadmapStatus.PUBLISHED,
      id: { notIn: input.excludedIds },
      ...(input.search
        ? {
            OR: [
              { title: { contains: input.search, mode: "insensitive" } },
              { description: { contains: input.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    const rows = await this.prisma.roadmap.findMany({
      where,
      take: input.take + 1,
      ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      orderBy: { createdAt: "desc" },
      include: ROADMAP_INCLUDE,
    });
    return { rows, totalCount: await this.prisma.roadmap.count({ where }) };
  }

  async calendarRegistrations(input: {
    userId: string;
    search?: string;
    deliveryMode?: string;
    status?: string;
    from?: Date;
    to?: Date;
    cursor?: string;
    take: number;
  }) {
    const event: Prisma.EventWhereInput = {
      deletedAt: null,
      ...(input.search
        ? {
            OR: [
              { title: { contains: input.search, mode: "insensitive" } },
              { location: { contains: input.search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(input.deliveryMode
        ? { deliveryMode: input.deliveryMode as EventDeliveryMode }
        : {}),
      ...(input.from || input.to
        ? {
            startDate: {
              ...(input.from ? { gte: input.from } : {}),
              ...(input.to ? { lte: input.to } : {}),
            },
          }
        : {}),
    };
    const where: Prisma.EventRegistrationWhereInput = {
      userId: input.userId,
      ...(input.status
        ? { status: input.status as EventRegistrationStatus }
        : {}),
      event,
    };
    const rows = await this.prisma.eventRegistration.findMany({
      where,
      include: {
        event: {
          select: {
            id: true,
            pdu: true,
            slug: true,
            type: true,
            title: true,
            endDate: true,
            location: true,
            timezone: true,
            startDate: true,
            onlineUrl: true,
            deliveryMode: true,
          },
        },
      },
      take: input.take + 1,
      ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      orderBy: { event: { startDate: "asc" } },
    });
    return {
      rows,
      totalCount: await this.prisma.eventRegistration.count({ where }),
    };
  }

  upcomingRegistrationCount(userId: string) {
    return this.prisma.eventRegistration.count({
      where: {
        userId,
        status: EventRegistrationStatus.REGISTERED,
        event: { startDate: { gte: new Date() }, deletedAt: null },
      },
    });
  }

  roadmapCandidateCourses(query: RoadmapCandidateQuery) {
    const subjects = query.subjects.filter((subject) => subject.trim());
    return this.prisma.course.findMany({
      where: {
        deletedAt: null,
        status: CourseStatus.PUBLISHED,
        ...(query.freeOnly ? { isFree: true } : {}),
        ...(subjects.length
          ? {
              OR: subjects.flatMap((subject) => [
                { title: { contains: subject, mode: "insensitive" as const } },
                {
                  description: {
                    contains: subject,
                    mode: "insensitive" as const,
                  },
                },
              ]),
            }
          : {}),
      },
      select: {
        id: true,
        title: true,
        level: true,
        rating: true,
        isFree: true,
        category: true,
        isFeatured: true,
        description: true,
        ratingCount: true,
        professionals: true,
        durationMinutes: true,
      },
      orderBy: [
        { isFeatured: "desc" },
        { rating: "desc" },
        { professionals: "desc" },
        { id: "asc" },
      ],
      take: query.take,
    });
  }

  async createGeneratedRoadmap(
    input: GeneratedRoadmapInput,
    unitOfWork: UnitOfWork,
  ) {
    const writer = unitOfWork as Prisma.TransactionClient;
    return writer.roadmap.create({
      data: {
        slug: input.slug,
        title: input.title,
        ownerId: input.ownerId,
        source: RoadmapSource.GENERATED,
        description: input.description,
        coverageNote: input.coverageNote,
        estimatedWeeks: input.estimatedWeeks,
        phases: {
          create: input.phases.map((phase) => ({
            order: phase.order,
            title: phase.title,
            description: phase.description,
            estimatedWeeks: phase.estimatedWeeks,
            steps: {
              create: phase.steps.map((step) => ({
                order: step.order,
                title: step.title,
                description: step.description,
                contentId: step.contentId,
                contentType: step.contentType,
                estimatedMinutes: step.estimatedMinutes,
              })),
            },
          })),
        },
      },
      select: { id: true },
    });
  }
}
