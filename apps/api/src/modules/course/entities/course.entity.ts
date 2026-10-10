import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql";
import { AppLanguage, CourseCategory } from "@prisma/client";
import { CourseLevel, CourseStatus } from "@prisma/client";
import { CurriculumSectionEntity } from "./curriculum-section.entity";
import { CourseGqlObjectNames } from "@course/enums/gql-names.enum";

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
  @Field(() => String, { nullable: true }) sourceUrl?: string | null;
  @Field(() => String, { nullable: true }) providerId?: string | null;
  @Field(() => Int, { nullable: true }) durationMinutes?: number | null;
  @Field(() => [CurriculumSectionEntity], { nullable: true })
  curriculumSections?: CurriculumSectionEntity[];
  @Field(() => AppLanguage, { nullable: true })
  contentLanguage?: AppLanguage | null;
  @Field(() => [AppLanguage], { nullable: true })
  availableLocales?: AppLanguage[] | null;
}
