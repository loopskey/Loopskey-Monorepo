import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { CurriculumLessonEntity } from "@course/entities/curriculum-lesson.entity";

@ObjectType("CurriculumSection")
export class CurriculumSectionEntity {
  @Field() title: string;
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
  @Field() courseId: string;
  @Field(() => ID) id: string;
  @Field(() => Int) order: number;
  @Field(() => String, { nullable: true }) description?: string | null;
  @Field(() => [CurriculumLessonEntity]) lessons: CurriculumLessonEntity[];
}
