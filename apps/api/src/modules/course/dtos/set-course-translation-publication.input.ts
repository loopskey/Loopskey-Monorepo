import { SetContentTranslationPublicationInputBase } from "@common/types/content-translation.types";
import { Field, ID, InputType } from "@nestjs/graphql";
import { CourseGqlInputNames } from "@course/enums/gql-names.enum";

import * as V from "class-validator";

@InputType(CourseGqlInputNames.SET_COURSE_TRANSLATION_PUBLICATION)
export class SetCourseTranslationPublicationInput extends SetContentTranslationPublicationInputBase {
  @Field(() => ID)
  @V.IsString()
  @V.IsNotEmpty()
  courseId: string;
}
