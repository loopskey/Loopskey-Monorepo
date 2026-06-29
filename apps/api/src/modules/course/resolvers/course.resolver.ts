import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { PaginatedCoursesEntity } from "@course/entities/paginated-courses.entity";
import { CourseGqlMutationNames } from "@course/enums/gql-names.enum";
import { CoursePaginationInput } from "@course/dtos/course-pagination.input";
import { CourseGqlQueryNames } from "@course/enums/gql-names.enum";
import { TCurrentUserPayload } from "@course/types/course-service.type";
import { CreateCourseInput } from "@course/dtos/create-course.input";
import { UpdateCourseInput } from "@course/dtos/update-course.input";
import { CourseFilterInput } from "@course/dtos/course-filter.input";
import { CourseSortInput } from "@course/dtos/course-sort.input";
import { CourseService } from "@course/services/course.service";
import { CourseEntity } from "@course/entities/course.entity";
import { CurrentUser } from "@auth/decorators/current-user.decorator";
import { Public } from "@auth/decorators/public.decorator";
import { Roles } from "@auth/decorators/roles.decorator";
import { Role } from "@prisma/client";

@Resolver(() => CourseEntity)
export class CourseResolver {
  constructor(private readonly courseService: CourseService) {}

  @Public()
  @Query(() => PaginatedCoursesEntity, {
    name: CourseGqlQueryNames.COURSES,
  })
  courses(
    @Args("filter", { nullable: true }) filter?: CourseFilterInput,
    @Args("pagination", { nullable: true }) pagination?: CoursePaginationInput,
    @Args("sort", { nullable: true }) sort?: CourseSortInput,
  ) {
    return this.courseService.findCourses(filter, pagination, sort);
  }

  @Public()
  @Query(() => CourseEntity, {
    name: CourseGqlQueryNames.COURSE_BY_ID,
  })
  courseById(@Args("courseId") courseId: string) {
    return this.courseService.findCourseById(courseId);
  }

  @Public()
  @Query(() => CourseEntity, {
    name: CourseGqlQueryNames.COURSE_BY_SLUG,
  })
  courseBySlug(@Args("slug") slug: string) {
    return this.courseService.findCourseBySlug(slug);
  }

  @Public()
  @Query(() => [CourseEntity], {
    name: CourseGqlQueryNames.FEATURED_COURSES,
  })
  featuredCourses(
    @Args("take", { type: () => Int, nullable: true, defaultValue: 12 })
    take?: number,
  ) {
    return this.courseService.findFeaturedCourses(take);
  }

  @Roles(Role.PROVIDER, Role.ADMIN)
  @Query(() => PaginatedCoursesEntity, {
    name: CourseGqlQueryNames.MY_PROVIDER_COURSES,
  })
  myProviderCourses(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("filter", { nullable: true }) filter?: CourseFilterInput,
    @Args("pagination", { nullable: true }) pagination?: CoursePaginationInput,
    @Args("sort", { nullable: true }) sort?: CourseSortInput,
  ) {
    return this.courseService.findMyProviderCourses(
      {
        id: user.id ?? user.sub!,
        role: user.role,
      },
      filter,
      pagination,
      sort,
    );
  }

  @Roles(Role.PROVIDER, Role.ADMIN)
  @Mutation(() => CourseEntity, {
    name: CourseGqlMutationNames.CREATE_COURSE,
  })
  createCourse(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("input") input: CreateCourseInput,
  ) {
    return this.courseService.createCourse(input, {
      id: user.id ?? user.sub!,
      role: user.role,
    });
  }

  @Roles(Role.PROVIDER, Role.ADMIN)
  @Mutation(() => CourseEntity, {
    name: CourseGqlMutationNames.UPDATE_COURSE,
  })
  updateCourse(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("input") input: UpdateCourseInput,
  ) {
    return this.courseService.updateCourse(input, {
      id: user.id ?? user.sub!,
      role: user.role,
    });
  }

  @Roles(Role.PROVIDER, Role.ADMIN)
  @Mutation(() => CourseEntity, {
    name: CourseGqlMutationNames.PUBLISH_COURSE,
  })
  publishCourse(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("courseId") courseId: string,
  ) {
    return this.courseService.publishCourse(courseId, {
      id: user.id ?? user.sub!,
      role: user.role,
    });
  }

  @Roles(Role.PROVIDER, Role.ADMIN)
  @Mutation(() => CourseEntity, {
    name: CourseGqlMutationNames.ARCHIVE_COURSE,
  })
  archiveCourse(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("courseId") courseId: string,
  ) {
    return this.courseService.archiveCourse(courseId, {
      id: user.id ?? user.sub!,
      role: user.role,
    });
  }

  @Roles(Role.PROVIDER, Role.ADMIN)
  @Mutation(() => CourseEntity, {
    name: CourseGqlMutationNames.DELETE_COURSE,
  })
  deleteCourse(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("courseId") courseId: string,
  ) {
    return this.courseService.softDeleteCourse(courseId, {
      id: user.id ?? user.sub!,
      role: user.role,
    });
  }

  @Roles(Role.PROVIDER, Role.ADMIN)
  @Mutation(() => CourseEntity, {
    name: CourseGqlMutationNames.RESTORE_COURSE,
  })
  restoreCourse(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("courseId") courseId: string,
  ) {
    return this.courseService.restoreCourse(courseId, {
      id: user.id ?? user.sub!,
      role: user.role,
    });
  }
}
