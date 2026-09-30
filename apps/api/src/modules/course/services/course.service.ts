import { CourseSortField, SortDirection } from "@course/enums/sort.enum";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { CourseStatus, Prisma, Role } from "@prisma/client";
import { CoursePaginationInput } from "@course/dtos/course-pagination.input";
import { ForbiddenException } from "@nestjs/common";
import { CourseRatingWriter } from "@course/public/course-engagement-api";
import { CreateCourseInput } from "@course/dtos/create-course.input";
import { UpdateCourseInput } from "@course/dtos/update-course.input";
import { CourseFilterInput } from "@course/dtos/course-filter.input";
import { CourseMessageCode } from "@course/enums/message-code.enum";
import { TCourseRequester } from "@course/types/course-service.type";
import { CourseSortInput } from "@course/dtos/course-sort.input";
import { measureCatalogFacets } from "@utils/catalog-facet.util";
import { toCourseRatingFacets } from "@course/utils/course-rating-facets.util";
import { toEnumFacets } from "@utils/catalog-facet.util";
import { PrismaService } from "@prisma/prisma.service";
import { slugify } from "@utils/slug.util";

const CANDIDATE_CAP = 500;

@Injectable()
export class CourseService {
  private readonly logger = new Logger(CourseService.name);

  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Options for the public catalogue filters.
   *
   * The same visibility predicate as the public list (`buildCourseWhere` with
   * no filter), so a value can never be offered for content a visitor cannot
   * open. Star thresholds come from reviewed courses only: `ratingCount > 0`
   * and a stored rating inside the 1-5 range the review aggregate writes.
   */
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
    const search = filter?.search?.trim();
    if (search && search.length >= 2)
      return this.findCoursesWithTrgmSearch(filter, pagination, sort);
    const take = Math.min(pagination?.take ?? 20, 100);
    const where = this.buildCourseWhere(filter, false);
    const orderBy = this.buildOrderBy(sort);
    const [items, totalCount] = await this.prismaService.$transaction([
      this.prismaService.course.findMany({
        where,
        take: take + 1,
        cursor: pagination?.cursor ? { id: pagination.cursor } : undefined,
        skip: pagination?.cursor ? 1 : 0,
        orderBy,
      }),
      this.prismaService.course.count({ where }),
    ]);
    const hasNextPage = items.length > take;
    const slicedItems = hasNextPage ? items.slice(0, take) : items;
    const nextCursor = hasNextPage
      ? slicedItems[slicedItems.length - 1]?.id
      : null;
    return {
      items: slicedItems,
      totalCount,
      pageInfo: {
        hasNextPage,
        nextCursor,
      },
    };
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
    return this.findCourses(
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
    _sort?: CourseSortInput,
  ) {
    const take = Math.min(pagination?.take ?? 20, 100);
    const search = filter?.search?.trim() ?? "";
    const cursor = pagination?.cursor ?? null;
    const status = filter?.status ?? CourseStatus.PUBLISHED;
    const category = filter?.category ?? null;
    const level = filter?.level ?? null;
    const isFree = filter?.isFree ?? null;
    const isFeatured = filter?.isFeatured ?? null;
    const providerId = filter?.providerId ?? null;

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
    };

    const rowsPromise = this.prismaService.$queryRaw<CourseSearchRow[]>`
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
          AND (${cursor}::text IS NULL OR c."id" > ${cursor}::text)
          AND (
            c."title" ILIKE '%' || ${search} || '%'
            OR c."instructor" ILIKE '%' || ${search} || '%'
            OR c."description" ILIKE '%' || ${search} || '%'
          )
        ORDER BY "searchRank" DESC, c."createdAt" DESC, c."id" DESC
        LIMIT ${CANDIDATE_CAP}
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
          AND (${cursor}::text IS NULL OR c."id" > ${cursor}::text)
          AND c."id" NOT IN (SELECT "id" FROM exact_matches)
          AND (c."title" % ${search} OR c."instructor" % ${search})
        ORDER BY "searchRank" DESC, c."createdAt" DESC, c."id" DESC
        LIMIT GREATEST(${CANDIDATE_CAP} - (SELECT COUNT(*)::int FROM exact_matches), 0)
      )
      SELECT * FROM exact_matches
      UNION ALL
      SELECT * FROM fuzzy_matches
      ORDER BY "searchRank" DESC, "createdAt" DESC, "id" DESC
      LIMIT ${take + 1};
    `;

    const countPromise = this.prismaService.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::bigint AS count
      FROM "Course" c
      WHERE c."deletedAt" IS NULL
        AND c."status" = ${status}::"CourseStatus"
        AND (${category}::"CourseCategory" IS NULL OR c."category" = ${category}::"CourseCategory")
        AND (${level}::"CourseLevel" IS NULL OR c."level" = ${level}::"CourseLevel")
        AND (${isFree}::boolean IS NULL OR c."isFree" = ${isFree}::boolean)
        AND (${isFeatured}::boolean IS NULL OR c."isFeatured" = ${isFeatured}::boolean)
        AND (${providerId}::text IS NULL OR c."providerId" = ${providerId}::text)
        AND (${cursor}::text IS NULL OR c."id" > ${cursor}::text)
        AND (
          c."title" ILIKE '%' || ${search} || '%'
          OR c."instructor" ILIKE '%' || ${search} || '%'
          OR c."description" ILIKE '%' || ${search} || '%'
          OR c."title" % ${search}
          OR c."instructor" % ${search}
        )
    `;

    const [rows, countRows] = await this.prismaService.$transaction([
      rowsPromise,
      countPromise,
    ]);
    const hasNextPage = rows.length > take;
    const slicedRows = hasNextPage ? rows.slice(0, take) : rows;
    return {
      items: slicedRows.map(({ searchRank: _searchRank, ...course }) => ({
        ...course,
        price: course.price ? Number(course.price) : null,
      })),
      totalCount: Number(countRows[0]?.count ?? 0n),
      pageInfo: {
        hasNextPage,
        nextCursor: hasNextPage ? slicedRows[slicedRows.length - 1]?.id : null,
      },
    };
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
