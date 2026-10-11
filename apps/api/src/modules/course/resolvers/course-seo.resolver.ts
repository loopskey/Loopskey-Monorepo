import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { SetContentIndexExclusionInput } from "@common/types/content-seo.types";
import { ContentSeoSettingsEntity } from "@common/types/content-seo.types";
import { CourseGqlMutationNames } from "@course/enums/gql-names.enum";
import { SaveContentSeoInput } from "@common/types/content-seo.types";
import { CourseGqlQueryNames } from "@course/enums/gql-names.enum";
import { TCurrentUserPayload } from "@course/types/course-service.type";
import { CourseSeoService } from "@course/services/course-seo.service";
import { CurrentUser } from "@common/decorators/current-user.decorator";
import { Roles } from "@common/decorators/roles.decorator";
import { Role } from "@prisma/client";

const actorOf = (user: TCurrentUserPayload) => ({
  id: user.id ?? user.sub!,
  role: user.role,
});

@Resolver()
export class CourseSeoResolver {
  constructor(private readonly seo: CourseSeoService) {}

  @Roles(Role.PROVIDER, Role.ADMIN)
  @Query(() => ContentSeoSettingsEntity, {
    name: CourseGqlQueryNames.COURSE_SEO,
  })
  courseSeo(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("courseId") courseId: string,
  ) {
    return this.seo.get(courseId, actorOf(user));
  }

  @Roles(Role.PROVIDER, Role.ADMIN)
  @Mutation(() => ContentSeoSettingsEntity, {
    name: CourseGqlMutationNames.SAVE_COURSE_SEO,
  })
  saveCourseSeo(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("input") input: SaveContentSeoInput,
  ) {
    return this.seo.save(input, actorOf(user));
  }

  @Roles(Role.ADMIN)
  @Mutation(() => ContentSeoSettingsEntity, {
    name: CourseGqlMutationNames.SET_COURSE_INDEX_EXCLUSION,
  })
  setCourseIndexExclusion(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("input") input: SetContentIndexExclusionInput,
  ) {
    return this.seo.setIndexExclusion(input, actorOf(user));
  }
}
