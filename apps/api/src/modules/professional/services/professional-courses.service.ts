import { ForbiddenException, Inject, Injectable } from "@nestjs/common";
import { type ProfessionalEngagementApi } from "@contentAction/public/professional-engagement-api";
import { PROFESSIONAL_ENGAGEMENT_API } from "@contentAction/public/professional-engagement-api";
import { ProfessionalPaginationInput } from "@professional/dtos/professional-pagination.input";
import { type ProfessionalCatalogApi } from "@course/public/professional-catalog-api";
import { type ProviderProjectionApi } from "@provider/public/provider-projection-api";
import { PROFESSIONAL_CATALOG_API } from "@course/public/professional-catalog-api";
import { ProfessionalSearchInput } from "@professional/dtos/professional-search.input";
import { PROVIDER_PROJECTION_API } from "@provider/public/provider-projection-api";
import { TUser } from "@common/types/user.types";
import { Role } from "@prisma/client";

@Injectable()
export class ProfessionalCoursesService {
  constructor(
    @Inject(PROFESSIONAL_ENGAGEMENT_API)
    private readonly engagement: ProfessionalEngagementApi,
    @Inject(PROFESSIONAL_CATALOG_API)
    private readonly catalog: ProfessionalCatalogApi,
    @Inject(PROVIDER_PROJECTION_API)
    private readonly providers: ProviderProjectionApi,
  ) {}

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
    const courseIds = search
      ? await this.catalog.searchCourseIds(search)
      : undefined;
    const { rows, totalCount } = await this.engagement.courseEnrollments({
      userId: user.id,
      courseIds,
      cursor: pagination?.cursor,
      take,
    });
    const items = rows.slice(0, take);
    const enrolledCourseIds = items.map((item) => item.contentId as string);
    const courses = await this.catalog.courses(enrolledCourseIds);
    const courseMap = new Map(courses.map((course) => [course.id, course]));
    const providerNames = await this.providers.names(
      courses.map((course) => course.providerId as string),
    );
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
        providerName: providerNames[course?.providerId as string] ?? null,
      };
    });
    return {
      items: enrichedItems,
      totalCount,
      pageInfo: {
        hasNextPage: rows.length > take,
        nextCursor: rows.length > take ? items.at(-1)?.id : null,
      },
    };
  }
}
