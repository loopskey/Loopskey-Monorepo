import { TRANSLATION_LIST_ITEM_MAX_LENGTH } from "@utils/content-translation.util";
import { SaveContentTranslationInputBase } from "@common/types/content-translation.types";
import { TRANSLATION_LIST_MAX_SIZE } from "@utils/content-translation.util";
import { Field, ID, InputType } from "@nestjs/graphql";
import { CourseGqlInputNames } from "@course/enums/gql-names.enum";

import * as V from "class-validator";

@InputType(CourseGqlInputNames.SAVE_COURSE_TRANSLATION)
export class SaveCourseTranslationInput extends SaveContentTranslationInputBase {
  @Field(() => ID)
  @V.IsString()
  @V.IsNotEmpty()
  courseId: string;

  @Field(() => [String], { nullable: true })
  @V.IsOptional()
  @V.IsArray()
  @V.ArrayMaxSize(TRANSLATION_LIST_MAX_SIZE)
  @V.IsString({ each: true })
  @V.MaxLength(TRANSLATION_LIST_ITEM_MAX_LENGTH, { each: true })
  learnings?: string[];

  @Field(() => [String], { nullable: true })
  @V.IsOptional()
  @V.IsArray()
  @V.ArrayMaxSize(TRANSLATION_LIST_MAX_SIZE)
  @V.IsString({ each: true })
  @V.MaxLength(TRANSLATION_LIST_ITEM_MAX_LENGTH, { each: true })
  requirements?: string[];
}
