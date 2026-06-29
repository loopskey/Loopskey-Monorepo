import { CourseCategory, CourseLevel, CourseStatus } from "@prisma/client";
import { IsBoolean, IsEnum, IsNumber, Max, Min } from "class-validator";
import { Field, Float, InputType } from "@nestjs/graphql";
import { IsOptional, IsString } from "class-validator";
import { CourseGqlInputNames } from "@course/enums/gql-names.enum";

@InputType(CourseGqlInputNames.COURSE_FILTER)
export class CourseFilterInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => CourseCategory, { nullable: true })
  @IsOptional()
  @IsEnum(CourseCategory)
  category?: CourseCategory;

  @Field(() => CourseLevel, { nullable: true })
  @IsOptional()
  @IsEnum(CourseLevel)
  level?: CourseLevel;

  @Field(() => CourseStatus, { nullable: true })
  @IsOptional()
  @IsEnum(CourseStatus)
  status?: CourseStatus;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isFree?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  providerId?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  minRating?: number;
}
