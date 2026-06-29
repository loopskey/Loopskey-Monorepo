import { CourseCategory, CourseLevel, CourseStatus } from "@prisma/client";
import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql";
import { CourseGqlObjectNames } from "@course/enums/gql-names.enum";
import { CurriculumSectionEntity } from "./curriculum-section.entity";

@ObjectType(CourseGqlObjectNames.COURSE)
export class CourseEntity {
  @Field() slug: string;
  @Field() title: string;
  @Field() isFree: boolean;
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
  @Field() currency: string;
  @Field() instructor: string;
  @Field(() => ID) id: string;
  @Field() description: string;
  @Field() lastUpdatedAt: Date;
  @Field() isFeatured: boolean;
  @Field(() => Float) rating: number;
  @Field(() => Int) ratingCount: number;
  @Field(() => Int) professionals: number;
  @Field(() => [String]) learnings: string[];
  @Field(() => CourseLevel) level: CourseLevel;
  @Field(() => [String]) requirements: string[];
  @Field(() => CourseStatus) status: CourseStatus;
  @Field(() => CourseCategory) category: CourseCategory;
  @Field(() => Float, { nullable: true }) price?: number | null;
  @Field(() => Date, { nullable: true }) deletedAt?: Date | null;
  @Field(() => String, { nullable: true }) imageUrl?: string | null;
  @Field(() => String, { nullable: true }) providerId?: string | null;
  @Field(() => Int, { nullable: true }) durationMinutes?: number | null;
  @Field(() => [CurriculumSectionEntity], { nullable: true })
  curriculumSections?: CurriculumSectionEntity[];
}
