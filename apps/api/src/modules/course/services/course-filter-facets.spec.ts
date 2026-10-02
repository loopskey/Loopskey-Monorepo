import { CourseCategory, CourseLevel, CourseStatus } from "@prisma/client";
import { Logger } from "@nestjs/common";

import { PrismaService } from "@prisma/prisma.service";
import { CourseService } from "./course.service";

const groupRow = <TField extends string, TValue>(
  field: TField,
  value: TValue,
  count: number,
) => ({ [field]: value, _count: { _all: count } }) as Record<string, unknown>;

const setup = () => {
  const prisma = {
    course: { groupBy: jest.fn().mockResolvedValue([]) },
    $queryRaw: jest.fn().mockResolvedValue([]),
  };
  jest.spyOn(Logger.prototype, "log").mockImplementation();
  jest.spyOn(Logger.prototype, "warn").mockImplementation();
  return {
    prisma,
    service: new CourseService(prisma as unknown as PrismaService),
  };
};

describe("CourseService filter facets", () => {
  afterEach(() => jest.restoreAllMocks());

  it("counts only published, non-deleted courses, the same rows the public list serves", async () => {
    const { service, prisma } = setup();

    await service.findCourseFilterFacets();

    for (const call of prisma.course.groupBy.mock.calls)
      expect(call[0].where).toMatchObject({
        status: CourseStatus.PUBLISHED,
        deletedAt: null,
      });
  });

  it("returns a category and level option for every value that has a public course", async () => {
    const { service, prisma } = setup();
    prisma.course.groupBy
      .mockResolvedValueOnce([
        groupRow("category", CourseCategory.TECHNOLOGY, 7),
        groupRow("category", CourseCategory.BUSINESS, 2),
      ])
      .mockResolvedValueOnce([
        groupRow("level", CourseLevel.BEGINNER, 5),
        groupRow("level", CourseLevel.INTERMEDIATE, 4),
      ]);

    const facets = await service.findCourseFilterFacets();

    expect(facets.categories).toEqual([
      { value: CourseCategory.BUSINESS, count: 2 },
      { value: CourseCategory.TECHNOLOGY, count: 7 },
    ]);
    expect(facets.levels.map((level) => level.value)).toEqual([
      CourseLevel.BEGINNER,
      CourseLevel.INTERMEDIATE,
    ]);
  });

  it("offers no option at all for an empty catalogue", async () => {
    const { service } = setup();

    await expect(service.findCourseFilterFacets()).resolves.toEqual({
      categories: [],
      levels: [],
      ratings: [],
    });
  });

  it("builds star thresholds from reviewed courses inside the review range only", async () => {
    const { service, prisma } = setup();

    await service.findCourseFilterFacets();

    const [query] = prisma.$queryRaw.mock.calls[0] as [TemplateStringsArray];
    const sql = query.join("?");
    expect(sql).toContain('"ratingCount" > 0');
    expect(sql).toContain('"rating" >= 1');
    expect(sql).toContain('"rating" <= 5');
    expect(sql).toContain('"deletedAt" IS NULL');
    expect(sql).toContain('floor("rating" * 2) / 2');
  });

  it("turns half-star buckets into cumulative, descending thresholds", async () => {
    const { service, prisma } = setup();
    prisma.$queryRaw.mockResolvedValue([
      { bucket: 4, count: BigInt(3) },
      { bucket: 4.5, count: BigInt(2) },
    ]);

    const facets = await service.findCourseFilterFacets();

    expect(facets.ratings).toEqual([
      { minimum: 4.5, count: 2 },
      { minimum: 4, count: 5 },
    ]);
  });
});
