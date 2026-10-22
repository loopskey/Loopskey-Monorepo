import { Field, ID, InputType } from "@nestjs/graphql";
import { CourseGqlInputNames } from "@course/enums/gql-names.enum";
import { AppLanguage } from "@prisma/client";

import * as V from "class-validator";

@InputType(CourseGqlInputNames.SET_COURSE_SOURCE_LANGUAGE)
export class SetCourseSourceLanguageInput {
  @Field(() => ID)
  @V.IsString()
  @V.IsNotEmpty()
  courseId: string;

  @Field(() => AppLanguage)
  @V.IsEnum(AppLanguage)
  sourceLanguage: AppLanguage;
}
