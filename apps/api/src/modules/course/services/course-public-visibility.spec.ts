import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { CourseStatus, Role } from "@prisma/client";

import { CourseMessageCode } from "@course/enums/message-code.enum";
import { PrismaService } from "@prisma/prisma.service";
import { CourseService } from "./course.service";

const NON_PUBLIC_STATUSES = [CourseStatus.DRAFT, CourseStatus.ARCHIVED];
const PUBLIC_VISIBILITY = {
  status: CourseStatus.PUBLISHED,
  deletedAt: null,
};

const setup = () => {
  const prisma = {
    course: {
      findFirst: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    },
    $queryRaw: jest.fn().mockResolvedValue([]),
    $transaction: jest.fn((operations: Promise<unknown>[]) =>
      Promise.all(operations),
    ),
  };
  return {
    prisma,
    service: new CourseService(prisma as unknown as PrismaService),
  };
};

describe("CourseService public visibility", () => {
  describe.each([
    ["findCourseById", "courseId"],
    ["findCourseBySlug", "slug"],
  ] as const)("%s", (method, field) => {
    it("filters on published, non-deleted courses", async () => {
      const { service, prisma } = setup();

      await expect(service[method]("course-1")).rejects.toBeInstanceOf(
        NotFoundException,
      );

      const lookup = field === "slug" ? "slug" : "id";
      expect(prisma.course.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { [lookup]: "course-1", ...PUBLIC_VISIBILITY },
        }),
      );
    });

    it("answers a hidden course exactly like an unknown one", async () => {
      const { service } = setup();

      const failure = await service[method]("missing").catch(
        (error: unknown) => error,
      );

      expect(failure).toBeInstanceOf(NotFoundException);
      expect((failure as NotFoundException).message).toBe(
        CourseMessageCode.COURSE_NOT_FOUND,
      );
    });
  });

  describe("findCourses", () => {
    it.each(NON_PUBLIC_STATUSES)(
      "rejects an explicit %s status",
      async (status) => {
        const { service, prisma } = setup();

        await expect(service.findCourses({ status })).rejects.toBeInstanceOf(
          ForbiddenException,
        );
        await expect(
          service.findCourses({ status, search: "design" }),
        ).rejects.toBeInstanceOf(ForbiddenException);

        expect(prisma.course.findMany).not.toHaveBeenCalled();
        expect(prisma.$queryRaw).not.toHaveBeenCalled();
      },
    );

    it.each([undefined, CourseStatus.PUBLISHED])(
      "lists published courses when the status is %s",
      async (status) => {
        const { service, prisma } = setup();

        await service.findCourses({ status });

        expect(prisma.course.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining(PUBLIC_VISIBILITY),
          }),
        );
      },
    );

    it("searches only published courses", async () => {
      const { service, prisma } = setup();

      await service.findCourses({ search: "design" });

      const [, ...values] = prisma.$queryRaw.mock.calls[0] as unknown[];
      expect(values).toContain(CourseStatus.PUBLISHED);
      for (const status of NON_PUBLIC_STATUSES)
        expect(values).not.toContain(status);
    });

    it("keeps a requested provider inside the published set", async () => {
      const { service, prisma } = setup();

      await service.findCourses({ providerId: "provider-2" });

      expect(prisma.course.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            ...PUBLIC_VISIBILITY,
            providerId: "provider-2",
          }),
        }),
      );
    });
  });

  describe("findFeaturedCourses", () => {
    it("returns only published, non-deleted courses", async () => {
      const { service, prisma } = setup();

      await service.findFeaturedCourses();

      expect(prisma.course.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { ...PUBLIC_VISIBILITY, isFeatured: true },
        }),
      );
    });
  });

  describe("findMyProviderCourses", () => {
    it.each(NON_PUBLIC_STATUSES)(
      "lets the owning provider list their %s courses",
      async (status) => {
        const { service, prisma } = setup();

        await service.findMyProviderCourses(
          { id: "provider-1", role: Role.PROVIDER },
          { status, providerId: "provider-2" },
        );

        expect(prisma.course.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              status,
              providerId: "provider-1",
              deletedAt: null,
            }),
          }),
        );
      },
    );

    it("lets an admin list any provider's drafts", async () => {
      const { service, prisma } = setup();

      await service.findMyProviderCourses(
        { id: "admin-1", role: Role.ADMIN },
        { status: CourseStatus.DRAFT, providerId: "provider-2" },
      );

      expect(prisma.course.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: CourseStatus.DRAFT,
            providerId: "provider-2",
          }),
        }),
      );
    });

    it.each([Role.PROFESSIONAL, Role.ORGANIZATION])(
      "refuses the %s role",
      async (role) => {
        const { service, prisma } = setup();

        await expect(
          service.findMyProviderCourses(
            { id: "user-1", role },
            { status: CourseStatus.DRAFT },
          ),
        ).rejects.toBeInstanceOf(ForbiddenException);

        expect(prisma.course.findMany).not.toHaveBeenCalled();
      },
    );
  });
});
