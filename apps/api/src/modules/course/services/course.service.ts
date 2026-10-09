import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { CourseSortField, SortDirection } from "@course/enums/sort.enum";
import { CourseStatus, Prisma, Role } from "@prisma/client";
import { CoursePaginationInput } from "@course/dtos/course-pagination.input";
import { measureCatalogFacets } from "@utils/catalog-facet.util";
import { toCourseRatingFacets } from "@course/utils/course-rating-facets.util";
import { ForbiddenException } from "@nestjs/common";
import { CourseRatingWriter } from "@course/public/course-engagement-api";
import { CreateCourseInput } from "@course/dtos/create-course.input";
import { UpdateCourseInput } from "@course/dtos/update-course.input";
import { CourseFilterInput } from "@course/dtos/course-filter.input";
import { CourseMessageCode } from "@course/enums/message-code.enum";
import { TCourseRequester } from "@course/types/course-service.type";
import { CourseSortInput } from "@course/dtos/course-sort.input";
import { PrismaService } from "@prisma/prisma.service";
import { toEnumFacets } from "@utils/catalog-facet.util";
import { slugify } from "@utils/slug.util";
import {
  CATALOG_SEARCH_CANDIDATE_CAP,
  CATALOG_SEARCH_ORDER,
  catalogSearchWindow,
  catalogSortOrder,
  clampSearchCount,
  readCatalogPage,
  readPrismaWindowAfter,
  readSearchWindowAfter,
  withoutSearchColumns,
} from "@utils/catalog-pagination.util";

const COURSE_SEARCH_ORDER = Prisma.sql`"searchRank" DESC, "createdAt" DESC, "id" DESC`;

@Injectable()
export class CourseService {
  private readonly logger = new Logger(CourseService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async findCourseFilterFacets() {
    return measureCatalogFacets(
      this.logger,
      "course",
      async () => {
        const where = this.publicCourseWhere();
        const [categories, levels, ratingBuckets] = await Promise.all([
          this.prismaService.course.groupBy({
            by: ["category"],
            where,
            _count: { _all: true },
          }),
          this.prismaService.course.groupBy({
            by: ["level"],
            where,
            _count: { _all: true },
          }),
          this.prismaService.$queryRaw<{ bucket: number; count: bigint }[]>`
            SELECT floor("rating" * 2) / 2 AS bucket, count(*) AS count
            FROM "Course"
            WHERE "deletedAt" IS NULL
              AND "status" = ${CourseStatus.PUBLISHED}::"CourseStatus"
              AND "ratingCount" > 0
              AND "rating" >= 1
              AND "rating" <= 5
            GROUP BY bucket`,
        ]);

        return {
          categories: toEnumFacets(
            categories.map((row) => ({
              value: row.category,
              count: row._count._all,
            })),
          ),
          levels: toEnumFacets(
            levels.map((row) => ({
              value: row.level,
              count: row._count._all,
            })),
          ),
          ratings: toCourseRatingFacets(
            ratingBuckets.map((row) => ({
              bucket: Number(row.bucket),
              count: Number(row.count),
            })),
          ),
        };
      },
      (facets) =>
        facets.categories.length + facets.levels.length + facets.ratings.length,
    );
  }

  private publicCourseWhere(): Prisma.CourseWhereInput {
    return this.buildCourseWhere();
  }

  async createCourse(input: CreateCourseInput, requester: TCourseRequester) {
    this.ensureProviderOrAdmin(requester);
    const slug = await this.generateUniqueSlug(input.title);
    const isFree = input.isFree ?? (!input.price || input.price <= 0);
    return this.prismaService.course.create({
      data: {
        slug,
        isFree,
        level: input.level,
        imageUrl: input.imageUrl,
        category: input.category,
        title: input.title.trim(),
        lastUpdatedAt: new Date(),
        learnings: input.learnings ?? [],
        currency: input.currency ?? "USD",
        instructor: input.instructor.trim(),
        description: input.description.trim(),
        durationMinutes: input.durationMinutes,
        requirements: input.requirements ?? [],
        status: input.status ?? CourseStatus.DRAFT,
        price: isFree ? null : new Prisma.Decimal(input.price ?? 0),
        isFeatured:
          requester.role === Role.ADMIN ? (input.isFeatured ?? false) : false,
        providerId: requester.role === Role.PROVIDER ? requester.id : null,
      },
    });
  }

  async updateCourse(input: UpdateCourseInput, requester: TCourseRequester) {
    const course = await this.findExistingCourse(input.courseId);
    this.ensureCourseOwnerOrAdmin(course.providerId, requester);
    const isFree =
      typeof input.isFree === "boolean"
        ? input.isFree
        : input.price !== undefined
          ? input.price <= 0
          : undefined;
    return this.prismaService.course.update({
      where: { id: input.courseId },
      data: {
        title: input.title?.trim(),
        instructor: input.instructor?.trim(),
        imageUrl: input.imageUrl,
        description: input.description?.trim(),
        category: input.category,
        level: input.level,
        status: input.status,
        price:
          isFree === true
            ? null
            : input.price !== undefined
              ? new Prisma.Decimal(input.price)
              : undefined,
        currency: input.currency,
        isFree,
        durationMinutes: input.durationMinutes,
        requirements: input.requirements,
        learnings: input.learnings,
        isFeatured:
          requester.role === Role.ADMIN ? input.isFeatured : undefined,
        lastUpdatedAt: new Date(),
      },
    });
  }

  async publishCourse(courseId: string, requester: TCourseRequester) {
    const course = await this.findExistingCourse(courseId);
    this.ensureCourseOwnerOrAdmin(course.providerId, requester);
    return this.prismaService.course.update({
      where: { id: courseId },
      data: {
        status: CourseStatus.PUBLISHED,
        lastUpdatedAt: new Date(),
      },
    });
  }

  async archiveCourse(courseId: string, requester: TCourseRequester) {
    const course = await this.findExistingCourse(courseId);
    this.ensureCourseOwnerOrAdmin(course.providerId, requester);
    return this.prismaService.course.update({
      where: { id: courseId },
      data: {
        status: CourseStatus.ARCHIVED,
        lastUpdatedAt: new Date(),
      },
    });
  }

  async softDeleteCourse(courseId: string, requester: TCourseRequester) {
    const course = await this.findExistingCourse(courseId);
    this.ensureCourseOwnerOrAdmin(course.providerId, requester);
    return this.prismaService.course.update({
      where: { id: courseId },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async restoreCourse(courseId: string, requester: TCourseRequester) {
    const course = await this.prismaService.course.findUnique({
      where: { id: courseId },
    });
    if (!course)
      throw new NotFoundException(CourseMessageCode.COURSE_NOT_FOUND);
    this.ensureCourseOwnerOrAdmin(course.providerId, requester);
    return this.prismaService.course.update({
      where: { id: courseId },
      data: {
        deletedAt: null,
      },
    });
  }

  async findCourseById(courseId: string) {
    const course = await this.prismaService.course.findFirst({
      where: {
        id: courseId,
        status: CourseStatus.PUBLISHED,
        deletedAt: null,
      },
      include: {
        curriculumSections: {
          orderBy: {
            order: "asc",
          },
          include: {
            lessons: {
              orderBy: {
                order: "asc",
              },
            },
          },
        },
      },
    });
    if (!course)
      throw new NotFoundException(CourseMessageCode.COURSE_NOT_FOUND);
    return course;
  }

  async findCourseBySlug(slug: string) {
    const course = await this.prismaService.course.findFirst({
      where: {
        slug,
        status: CourseStatus.PUBLISHED,
        deletedAt: null,
      },
      include: {
        curriculumSections: {
          orderBy: {
            order: "asc",
          },
          include: {
            lessons: {
              orderBy: {
                order: "asc",
              },
            },
          },
        },
      },
    });
    if (!course)
      throw new NotFoundException(CourseMessageCode.COURSE_NOT_FOUND);
    return course;
  }

  async resolveForEngagement(courseId: string) {
    const course = await this.prismaService.course.findFirst({
      where: { id: courseId, deletedAt: null },
      select: {
        id: true,
        title: true,
        price: true,
        currency: true,
        isFree: true,
      },
    });
    if (!course)
      throw new NotFoundException(CourseMessageCode.COURSE_NOT_FOUND);
    return {
      ...course,
      price: Number(course.price ?? 0),
      currency: course.currency ?? "USD",
    };
  }

  async updateEngagementRating(
    courseId: string,
    average: number,
    count: number,
    writer: CourseRatingWriter = this.prismaService,
  ) {
    await writer.course.update({
      where: { id: courseId },
      data: { rating: average, ratingCount: count },
    });
  }

  async findCourses(
    filter?: CourseFilterInput,
    pagination?: CoursePaginationInput,
    sort?: CourseSortInput,
  ) {
    this.assertPublicStatus(filter?.status);
    return this.queryCourses(filter, pagination, sort);
  }

  private assertPublicStatus(status?: CourseStatus) {
    if (status && status !== CourseStatus.PUBLISHED)
      throw new ForbiddenException(CourseMessageCode.COURSE_ACCESS_DENIED);
  }

  private async queryCourses(
    filter?: CourseFilterInput,
    pagination?: CoursePaginationInput,
    sort?: CourseSortInput,
  ) {
    const search = filter?.search?.trim();
    if (search && search.length >= 2)
      return this.findCoursesWithTrgmSearch(filter, pagination);
    const where = this.buildCourseWhere(filter, false);
    const orderBy = this.buildOrderBy(sort);
    return readCatalogPage({
      kind: "course",
      order: catalogSortOrder(
        sort?.field ?? CourseSortField.CREATED_AT,
        sort?.direction ?? SortDirection.DESC,
      ),
      take: pagination?.take,
      cursor: pagination?.cursor,
      count: () => this.prismaService.course.count({ where }),
      readAfter: (anchorId, limit) =>
        readPrismaWindowAfter(
          anchorId,
          async (id) =>
            (await this.prismaService.course.findFirst({
              where: { AND: [where, { id }] },
              select: { id: true },
            })) !== null,
          (position) =>
            this.prismaService.course.findMany({
              where,
              orderBy,
              take: limit,
              ...position,
            }),
        ),
      readThrough: (anchorId, limit) =>
        this.prismaService.course.findMany({
          where,
          orderBy,
          cursor: { id: anchorId },
          take: -limit,
        }),
    });
  }

  async findFeaturedCourses(take = 12) {
    return this.prismaService.course.findMany({
      where: {
        status: CourseStatus.PUBLISHED,
        isFeatured: true,
        deletedAt: null,
      },
      take: Math.min(take, 50),
      orderBy: [
        { rating: "desc" },
        { professionals: "desc" },
        { createdAt: "desc" },
      ],
    });
  }

  async findMyProviderCourses(
    requester: TCourseRequester,
    filter?: CourseFilterInput,
    pagination?: CoursePaginationInput,
    sort?: CourseSortInput,
  ) {
    if (requester.role !== Role.PROVIDER && requester.role !== Role.ADMIN)
      throw new ForbiddenException(CourseMessageCode.COURSE_ACCESS_DENIED);
    return this.queryCourses(
      {
        ...filter,
        providerId:
          requester.role === Role.PROVIDER ? requester.id : filter?.providerId,
      },
      pagination,
      sort,
    );
  }

  private async findCoursesWithTrgmSearch(
    filter?: CourseFilterInput,
    pagination?: CoursePaginationInput,
  ) {
    const search = filter?.search?.trim() ?? "";
    const status = filter?.status ?? CourseStatus.PUBLISHED;
    const category = filter?.category ?? null;
    const level = filter?.level ?? null;
    const isFree = filter?.isFree ?? null;
    const isFeatured = filter?.isFeatured ?? null;
    const providerId = filter?.providerId ?? null;
    const minRating = filter?.minRating ?? null;

    type CourseSearchRow = {
      id: string;
      slug: string;
      title: string;
      instructor: string;
      imageUrl: string | null;
      description: string;
      category: string;
      level: string;
      status: string;
      price: Prisma.Decimal | null;
      currency: string;
      isFree: boolean;
      durationMinutes: number | null;
      lastUpdatedAt: Date;
      requirements: string[];
      learnings: string[];
      rating: number;
      ratingCount: number;
      professionals: number;
      isFeatured: boolean;
      providerId: string | null;
      createdAt: Date;
      updatedAt: Date;
      deletedAt: Date | null;
      searchRank: number;
      rowPosition: bigint;
    };

    const readWindow = async (
      anchorId: string | null,
      limit: number,
      direction: "after" | "through",
    ) => {
      const rows = await this.prismaService.$queryRaw<CourseSearchRow[]>`
        WITH exact_matches AS (
          SELECT
            c."id", c."slug", c."title", c."instructor", c."imageUrl",
            c."description", c."category", c."level", c."status", c."price",
            c."currency", c."isFree", c."durationMinutes", c."lastUpdatedAt",
            c."requirements", c."learnings", c."rating", c."ratingCount",
            c."professionals", c."isFeatured", c."providerId", c."createdAt",
            c."updatedAt", c."deletedAt",
            (CASE
              WHEN c."title" ILIKE '%' || ${search} || '%' THEN 3
              WHEN c."instructor" ILIKE '%' || ${search} || '%' THEN 2
              ELSE 1
            END)::float AS "searchRank"
          FROM "Course" c
          WHERE c."deletedAt" IS NULL
            AND c."status" = ${status}::"CourseStatus"
            AND (${category}::"CourseCategory" IS NULL OR c."category" = ${category}::"CourseCategory")
            AND (${level}::"CourseLevel" IS NULL OR c."level" = ${level}::"CourseLevel")
            AND (${isFree}::boolean IS NULL OR c."isFree" = ${isFree}::boolean)
            AND (${isFeatured}::boolean IS NULL OR c."isFeatured" = ${isFeatured}::boolean)
            AND (${providerId}::text IS NULL OR c."providerId" = ${providerId}::text)
            AND (${minRating}::float IS NULL OR c."rating" >= ${minRating}::float)
            AND (
              c."title" ILIKE '%' || ${search} || '%'
              OR c."instructor" ILIKE '%' || ${search} || '%'
              OR c."description" ILIKE '%' || ${search} || '%'
            )
          ORDER BY "searchRank" DESC, c."createdAt" DESC, c."id" DESC
          LIMIT ${CATALOG_SEARCH_CANDIDATE_CAP}
        ),
        fuzzy_matches AS (
          SELECT
            c."id", c."slug", c."title", c."instructor", c."imageUrl",
            c."description", c."category", c."level", c."status", c."price",
            c."currency", c."isFree", c."durationMinutes", c."lastUpdatedAt",
            c."requirements", c."learnings", c."rating", c."ratingCount",
            c."professionals", c."isFeatured", c."providerId", c."createdAt",
            c."updatedAt", c."deletedAt",
            LEAST(
              GREATEST(
                similarity(c."title", ${search}),
                similarity(c."instructor", ${search})
              ),
              0.99
            ) AS "searchRank"
          FROM "Course" c
          WHERE c."deletedAt" IS NULL
            AND c."status" = ${status}::"CourseStatus"
            AND (${category}::"CourseCategory" IS NULL OR c."category" = ${category}::"CourseCategory")
            AND (${level}::"CourseLevel" IS NULL OR c."level" = ${level}::"CourseLevel")
            AND (${isFree}::boolean IS NULL OR c."isFree" = ${isFree}::boolean)
            AND (${isFeatured}::boolean IS NULL OR c."isFeatured" = ${isFeatured}::boolean)
            AND (${providerId}::text IS NULL OR c."providerId" = ${providerId}::text)
            AND (${minRating}::float IS NULL OR c."rating" >= ${minRating}::float)
            AND c."id" NOT IN (SELECT "id" FROM exact_matches)
            AND (c."title" % ${search} OR c."instructor" % ${search})
          ORDER BY "searchRank" DESC, c."createdAt" DESC, c."id" DESC
          LIMIT GREATEST(${CATALOG_SEARCH_CANDIDATE_CAP} - (SELECT COUNT(*)::int FROM exact_matches), 0)
        ),
        ${catalogSearchWindow(COURSE_SEARCH_ORDER, anchorId, limit, direction)}
      `;
      return rows.map((row) => {
        const course = withoutSearchColumns(row);
        return { ...course, price: course.price ? Number(course.price) : null };
      });
    };

    return readCatalogPage({
      kind: "course",
      order: CATALOG_SEARCH_ORDER,
      take: pagination?.take,
      cursor: pagination?.cursor,
      count: async () => {
        const countRows = await this.prismaService.$queryRaw<
          Array<{ count: bigint }>
        >`
          SELECT COUNT(*)::bigint AS count
          FROM "Course" c
          WHERE c."deletedAt" IS NULL
            AND c."status" = ${status}::"CourseStatus"
            AND (${category}::"CourseCategory" IS NULL OR c."category" = ${category}::"CourseCategory")
            AND (${level}::"CourseLevel" IS NULL OR c."level" = ${level}::"CourseLevel")
            AND (${isFree}::boolean IS NULL OR c."isFree" = ${isFree}::boolean)
            AND (${isFeatured}::boolean IS NULL OR c."isFeatured" = ${isFeatured}::boolean)
            AND (${providerId}::text IS NULL OR c."providerId" = ${providerId}::text)
            AND (${minRating}::float IS NULL OR c."rating" >= ${minRating}::float)
            AND (
              c."title" ILIKE '%' || ${search} || '%'
              OR c."instructor" ILIKE '%' || ${search} || '%'
              OR c."description" ILIKE '%' || ${search} || '%'
              OR c."title" % ${search}
              OR c."instructor" % ${search}
            )
        `;
        return clampSearchCount(countRows[0]?.count);
      },
      readAfter: async (anchorId, limit) =>
        readSearchWindowAfter(
          await readWindow(anchorId, limit, "after"),
          anchorId,
        ),
      readThrough: (anchorId, limit) => readWindow(anchorId, limit, "through"),
    });
  }

  private buildCourseWhere(
    filter?: CourseFilterInput,
    includeDeleted = false,
  ): Prisma.CourseWhereInput {
    const search = filter?.search?.trim();
    return {
      deletedAt: includeDeleted ? undefined : null,
      category: filter?.category,
      level: filter?.level,
      status: filter?.status ?? CourseStatus.PUBLISHED,
      isFree: filter?.isFree,
      isFeatured: filter?.isFeatured,
      providerId: filter?.providerId,
      rating: filter?.minRating ? { gte: filter.minRating } : undefined,
      OR: search
        ? [
            {
              title: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              instructor: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: search,
                mode: "insensitive",
              },
            },
          ]
        : undefined,
    };
  }

  private buildOrderBy(
    sort?: CourseSortInput,
  ): Prisma.CourseOrderByWithRelationInput[] {
    const field = sort?.field ?? CourseSortField.CREATED_AT;
    const direction = sort?.direction ?? SortDirection.DESC;
    if (field === CourseSortField.PRICE)
      return [{ price: direction }, { id: "desc" }];
    return [
      { [field]: direction },
      { id: "desc" },
    ] as Prisma.CourseOrderByWithRelationInput[];
  }

  private async findExistingCourse(courseId: string) {
    const course = await this.prismaService.course.findFirst({
      where: {
        id: courseId,
        deletedAt: null,
      },
    });
    if (!course)
      throw new NotFoundException(CourseMessageCode.COURSE_NOT_FOUND);
    return course;
  }

  private ensureProviderOrAdmin(requester: TCourseRequester) {
    if (requester.role !== Role.PROVIDER && requester.role !== Role.ADMIN)
      throw new ForbiddenException(CourseMessageCode.COURSE_ACCESS_DENIED);
  }

  private ensureCourseOwnerOrAdmin(
    providerId: string | null,
    requester: TCourseRequester,
  ) {
    if (requester.role === Role.ADMIN) return;
    if (requester.role !== Role.PROVIDER || providerId !== requester.id)
      throw new ForbiddenException(CourseMessageCode.COURSE_ACCESS_DENIED);
  }

  private async generateUniqueSlug(title: string) {
    const baseSlug = slugify(title);
    let slug = baseSlug;
    let counter = 1;
    while (await this.prismaService.course.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    return slug;
  }
}
