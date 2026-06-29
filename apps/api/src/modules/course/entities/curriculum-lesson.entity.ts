import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { CurriculumLessonType } from "@prisma/client";
import { CourseGqlObjectNames } from "@course/enums/gql-names.enum";

@ObjectType(CourseGqlObjectNames.CURRICULUM_LESSON)
export class CurriculumLessonEntity {
  @Field() title: string;
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
  @Field() sectionId: string;
  @Field() isPreview: boolean;
  @Field(() => ID) id: string;
  @Field(() => Int) order: number;
  @Field(() => CurriculumLessonType) type: CurriculumLessonType;
  @Field(() => String, { nullable: true }) description?: string | null;
  @Field(() => Int, { nullable: true }) durationMinutes?: number | null;
}
