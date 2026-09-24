import { EventDeliveryMode, EventRegistrationStatus } from "@prisma/client";
import { CourseCategory, CourseStatus, RoadmapStatus } from "@prisma/client";
import { ProfessionalCatalogApi } from "@course/public/professional-catalog-api";
import { RoadmapCandidateQuery } from "@course/public/professional-catalog-api";
import { Prisma, RoadmapSource } from "@prisma/client";
import { TCourseCandidateRow } from "@course/types/application.types";
import { PrismaService } from "@prisma/prisma.service";
import { Injectable } from "@nestjs/common";

import { type GeneratedRoadmapInput } from "@course/public/professional-catalog-api";
import { type UnitOfWork } from "@course/public/professional-catalog-api";

const ROADMAP_INCLUDE = {
  phases: { orderBy: { order: "asc" as const }, include: { steps: true } },
};

const WORD_SIMILARITY_THRESHOLD = 0.3;
const VALID_CATEGORIES = new Set<string>(Object.values(CourseCategory));

const trimmedTerms = (terms: readonly string[]) => [
  ...new Set(terms.map((term) => term.trim()).filter(Boolean)),
];

const lowerTerms = (terms: readonly string[]) =>
  trimmedTerms(terms).map((term) => term.toLowerCase());

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
        sourceUrl: true,
        providerId: true,
        description: true,
        ratingCount: true,
        durationMinutes: true,
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

  roadmapCandidateCourses(
    query: RoadmapCandidateQuery,
  ): Promise<TCourseCandidateRow[]> {
    const subjects = trimmedTerms(query.subjects);
    const freeOnly = query.freeOnly;
    switch (query.tier) {
      case "EXACT":
        return this.exactTierCourses(subjects, freeOnly, query.take);
      case "SIMILAR":
        return this.similarTierCourses(
          lowerTerms([...query.subjects, ...query.keywords]),
          freeOnly,
          query.take,
        );
      case "RELATED":
        return this.relatedTierCourses(query.groupKeys, freeOnly, query.take);
      case "BROAD":
        return this.broadTierCourses(freeOnly, query.take);
    }
  }

  private exactTierCourses(
    subjects: readonly string[],
    freeOnly: boolean,
    take: number,
  ) {
    return this.prisma.$queryRaw<TCourseCandidateRow[]>`
      SELECT
        c."id", c."title", c."level", c."rating", c."isFree", c."category",
        c."description", c."ratingCount", c."isFeatured", c."professionals",
        c."durationMinutes", 1.0::float AS "matchScore"
      FROM "Course" c
      WHERE c."deletedAt" IS NULL
        AND c."status" = ${CourseStatus.PUBLISHED}::"CourseStatus"
        AND (${freeOnly} = false OR c."isFree" = true)
        AND (
          ${subjects.length === 0}
          OR ${Prisma.join(
            subjects.flatMap((subject) => [
              Prisma.sql`c."title" ILIKE ${"%" + subject + "%"}`,
              Prisma.sql`c."description" ILIKE ${"%" + subject + "%"}`,
              Prisma.sql`roadmap_enum_text(c."category") ILIKE ${"%" + subject + "%"}`,
            ]),
            " OR ",
          )}
        )
      ORDER BY c."isFeatured" DESC, c."rating" DESC, c."professionals" DESC, c."id" ASC
      LIMIT ${take};
    `;
  }

  private async similarTierCourses(
    terms: readonly string[],
    freeOnly: boolean,
    take: number,
  ) {
    if (terms.length === 0) return this.exactTierCourses([], freeOnly, take);
    return this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SET LOCAL pg_trgm.word_similarity_threshold = ${WORD_SIMILARITY_THRESHOLD}`;
      return tx.$queryRaw<TCourseCandidateRow[]>`
        SELECT
          c."id", c."title", c."level", c."rating", c."isFree", c."category",
          c."description", c."ratingCount", c."isFeatured", c."professionals",
          c."durationMinutes",
          GREATEST(${Prisma.join(
            terms.map(
              (term) =>
                Prisma.sql`word_similarity(${term}, lower(c."title" || ' ' || roadmap_enum_text(c."category")))`,
            ),
            ", ",
          )}) AS "matchScore"
        FROM "Course" c
        WHERE c."deletedAt" IS NULL
          AND c."status" = ${CourseStatus.PUBLISHED}::"CourseStatus"
          AND (${freeOnly} = false OR c."isFree" = true)
          AND (${Prisma.join(
            terms.map(
              (term) =>
                Prisma.sql`lower(c."title" || ' ' || roadmap_enum_text(c."category")) %> ${term}`,
            ),
            " OR ",
          )})
        ORDER BY "matchScore" DESC, c."isFeatured" DESC, c."rating" DESC, c."professionals" DESC, c."id" ASC
        LIMIT ${take};
      `;
    });
  }

  private relatedTierCourses(
    groupKeys: readonly string[],
    freeOnly: boolean,
    take: number,
  ) {
    const categories = groupKeys.filter((key) => VALID_CATEGORIES.has(key));
    if (categories.length === 0) return Promise.resolve([]);
    return this.prisma.$queryRaw<TCourseCandidateRow[]>`
      SELECT
        c."id", c."title", c."level", c."rating", c."isFree", c."category",
        c."description", c."ratingCount", c."isFeatured", c."professionals",
        c."durationMinutes", 0.4::float AS "matchScore"
      FROM "Course" c
      WHERE c."deletedAt" IS NULL
        AND c."status" = ${CourseStatus.PUBLISHED}::"CourseStatus"
        AND (${freeOnly} = false OR c."isFree" = true)
        AND c."category" = ANY(${categories}::"CourseCategory"[])
      ORDER BY c."isFeatured" DESC, c."rating" DESC, c."professionals" DESC, c."id" ASC
      LIMIT ${take};
    `;
  }

  private broadTierCourses(freeOnly: boolean, take: number) {
    return this.prisma.$queryRaw<TCourseCandidateRow[]>`
      SELECT
        c."id", c."title", c."level", c."rating", c."isFree", c."category",
        c."description", c."ratingCount", c."isFeatured", c."professionals",
        c."durationMinutes", 0.2::float AS "matchScore"
      FROM "Course" c
      WHERE c."deletedAt" IS NULL
        AND c."status" = ${CourseStatus.PUBLISHED}::"CourseStatus"
        AND (${freeOnly} = false OR c."isFree" = true)
      ORDER BY c."isFeatured" DESC, c."rating" DESC, c."professionals" DESC, c."id" ASC
      LIMIT ${take};
    `;
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
        matchTier: input.matchTier,
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
                credits: step.credits,
                isCloseMatch: step.isCloseMatch,
              })),
            },
          })),
        },
      },
      select: { id: true },
    });
  }
}
