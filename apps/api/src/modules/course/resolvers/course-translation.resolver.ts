import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CourseGqlMutationNames } from "@course/enums/gql-names.enum";
import { CourseGqlQueryNames } from "@course/enums/gql-names.enum";
import { CourseTranslationEntity } from "@course/entities/course-translation.entity";
import { CourseTranslationService } from "@course/services/course-translation.service";
import { SaveCourseTranslationInput } from "@course/dtos/save-course-translation.input";
import { SetCourseTranslationPublicationInput } from "@course/dtos/set-course-translation-publication.input";
import { TCurrentUserPayload } from "@course/types/course-service.type";
import { CurrentUser } from "@common/decorators/current-user.decorator";
import { Roles } from "@common/decorators/roles.decorator";
import { Role } from "@prisma/client";

const actorOf = (user: TCurrentUserPayload) => ({
  id: user.id ?? user.sub!,
  role: user.role,
});

@Resolver(() => CourseTranslationEntity)
export class CourseTranslationResolver {
  constructor(private readonly translations: CourseTranslationService) {}

  @Roles(Role.PROVIDER, Role.ADMIN)
  @Query(() => [CourseTranslationEntity], {
    name: CourseGqlQueryNames.COURSE_TRANSLATIONS,
  })
  courseTranslations(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("courseId") courseId: string,
  ) {
    return this.translations.list(courseId, actorOf(user));
  }

  @Roles(Role.PROVIDER, Role.ADMIN)
  @Mutation(() => CourseTranslationEntity, {
    name: CourseGqlMutationNames.SAVE_COURSE_TRANSLATION,
  })
  saveCourseTranslation(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("input") input: SaveCourseTranslationInput,
  ) {
    return this.translations.save(input, actorOf(user));
  }

  @Roles(Role.PROVIDER, Role.ADMIN)
  @Mutation(() => CourseTranslationEntity, {
    name: CourseGqlMutationNames.SET_COURSE_TRANSLATION_PUBLICATION,
  })
  setCourseTranslationPublication(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("input") input: SetCourseTranslationPublicationInput,
  ) {
    return this.translations.setPublication(input, actorOf(user));
  }
}
