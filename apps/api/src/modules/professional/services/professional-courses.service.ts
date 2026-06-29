import { ProfessionalPaginationInput } from "@professional/dtos/professional-pagination.input";
import { ProfessionalSearchInput } from "@professional/dtos/professional-search.input";
import { ForbiddenException } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { Prisma, Role } from "@prisma/client";
import { ContentType } from "@prisma/client";
import { Injectable } from "@nestjs/common";
import { TUser } from "@common/types/user.types";

@Injectable()
export class ProfessionalCoursesService {
  constructor(private readonly prismaService: PrismaService) {}

  private assertProfessional(user: TUser) {
    if (user.role !== Role.PROFESSIONAL && user.role !== Role.ADMIN)
      throw new ForbiddenException("Professional access required.");
  }

  async myCourses(
    user: TUser,
    filter?: ProfessionalSearchInput,
    pagination?: ProfessionalPaginationInput,
  ) {
    this.assertProfessional(user);
    const take = pagination?.take ?? 12;
    const search = filter?.search?.trim();
    const baseWhere: Prisma.ContentEnrollmentWhereInput = {
      userId: user.id,
      contentType: ContentType.COURSE,
    };
    if (search) {
      const matchedCourses = await this.prismaService.course.findMany({
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
      baseWhere.contentId = {
        in: matchedCourses.map((course) => course.id),
      };
    }
    const rows = await this.prismaService.contentEnrollment.findMany({
      where: baseWhere,
      take: take + 1,
      ...(pagination?.cursor
        ? { cursor: { id: pagination.cursor }, skip: 1 }
        : {}),
      orderBy: { createdAt: "desc" },
    });
    const items = rows.slice(0, take);
    const courseIds = items.map((item) => item.contentId);
    const courses = await this.prismaService.course.findMany({
      where: {
        id: { in: courseIds },
        deletedAt: null,
      },
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
        provider: {
          select: {
            fullName: true,
            email: true,
            providerProfile: {
              select: {
                organizationName: true,
              },
            },
          },
        },
      },
    });
    const courseMap = new Map(courses.map((course) => [course.id, course]));
    const enrichedItems = items.map((item) => {
      const course = courseMap.get(item.contentId);
      return {
        ...item,
        courseSlug: course?.slug ?? null,
        courseTitle: course?.title ?? null,
        courseLevel: course?.level ?? null,
        courseRating: course?.rating ?? null,
        courseIsFree: course?.isFree ?? null,
        courseCurrency: course?.currency ?? null,
        courseImageUrl: course?.imageUrl ?? null,
        courseCategory: course?.category ?? null,
        courseRatingCount: course?.ratingCount ?? null,
        courseDescription: course?.description ?? null,
        courseDurationMinutes: course?.durationMinutes ?? null,
        coursePrice: course?.price ? Number(course.price) : null,
        providerName:
          course?.provider?.providerProfile?.organizationName ??
          course?.provider?.fullName ??
          course?.provider?.email ??
          null,
      };
    });
    return {
      items: enrichedItems,
      totalCount: await this.prismaService.contentEnrollment.count({
        where: baseWhere,
      }),
      pageInfo: {
        hasNextPage: rows.length > take,
        nextCursor: rows.length > take ? items.at(-1)?.id : null,
      },
    };
  }
}
