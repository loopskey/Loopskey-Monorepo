import { CourseCategory, CourseLevel, CourseStatus } from "@prisma/client";
import { Field, Float, InputType, Int } from "@nestjs/graphql";
import { CourseGqlInputNames } from "@course/enums/gql-names.enum";

import * as V from "class-validator";

@InputType(CourseGqlInputNames.CREATE_COURSE)
export class CreateCourseInput {
  @Field()
  @V.IsString()
  @V.IsNotEmpty()
  @V.MaxLength(180)
  title: string;

  @Field()
  @V.IsString()
  @V.IsNotEmpty()
  @V.MaxLength(120)
  instructor: string;

  @Field(() => String, { nullable: true })
  @V.IsOptional()
  @V.IsUrl()
  imageUrl?: string;

  @Field()
  @V.IsString()
  @V.IsNotEmpty()
  @V.MaxLength(5000)
  description: string;

  @Field(() => CourseCategory)
  @V.IsEnum(CourseCategory)
  category: CourseCategory;

  @Field(() => CourseLevel, {
    nullable: true,
    defaultValue: CourseLevel.ALL_LEVELS,
  })
  @V.IsOptional()
  @V.IsEnum(CourseLevel)
  level?: CourseLevel = CourseLevel.ALL_LEVELS;

  @Field(() => CourseStatus, {
    nullable: true,
    defaultValue: CourseStatus.DRAFT,
  })
  @V.IsOptional()
  @V.IsEnum(CourseStatus)
  status?: CourseStatus = CourseStatus.DRAFT;

  @Field(() => Float, { nullable: true })
  @V.IsOptional()
  @V.IsNumber()
  @V.Min(0)
  price?: number;

  @Field(() => String, { nullable: true, defaultValue: "USD" })
  @V.IsOptional()
  @V.IsString()
  @V.MaxLength(3)
  currency?: string = "USD";

  @Field(() => Boolean, { nullable: true })
  @V.IsOptional()
  @V.IsBoolean()
  isFree?: boolean;

  @Field(() => Int, { nullable: true })
  @V.IsOptional()
  @V.IsInt()
  @V.Min(1)
  @V.Max(100000)
  durationMinutes?: number;

  @Field(() => [String], { nullable: true })
  @V.IsOptional()
  @V.IsArray()
  @V.ArrayMaxSize(30)
  @V.IsString({ each: true })
  requirements?: string[];

  @Field(() => [String], { nullable: true })
  @V.IsOptional()
  @V.IsArray()
  @V.ArrayMaxSize(50)
  @V.IsString({ each: true })
  learnings?: string[];

  @Field(() => Boolean, { nullable: true })
  @V.IsOptional()
  @V.IsBoolean()
  isFeatured?: boolean;
}
