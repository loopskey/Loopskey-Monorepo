import { CourseGqlObjectNames } from "@course/enums/gql-names.enum";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { AppLanguage } from "@prisma/client";

@ObjectType(CourseGqlObjectNames.COURSE_LANGUAGE)
export class CourseLanguageEntity {
  @Field(() => ID) courseId: string;
  @Field(() => [AppLanguage]) publishedLocales: AppLanguage[];
  @Field(() => [AppLanguage]) availableLocales: AppLanguage[];
  @Field(() => AppLanguage, { nullable: true })
  sourceLanguage: AppLanguage | null;
}
