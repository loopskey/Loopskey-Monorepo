import { ContentTranslationEntityBase } from "@common/types/content-translation.types";
import { CourseGqlObjectNames } from "@course/enums/gql-names.enum";
import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType(CourseGqlObjectNames.COURSE_TRANSLATION)
export class CourseTranslationEntity extends ContentTranslationEntityBase {
  @Field(() => [String]) learnings: string[];
  @Field(() => [String]) requirements: string[];
}
