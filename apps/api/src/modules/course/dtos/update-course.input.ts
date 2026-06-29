import { Field, Float, ID, InputType, Int, PartialType } from "@nestjs/graphql";
import { IsBoolean, IsInt, IsUrl, Max, Min } from "class-validator";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { CourseGqlInputNames } from "@course/enums/gql-names.enum";
import { CreateCourseInput } from "@course/dtos/create-course.input";

@InputType(CourseGqlInputNames.UPDATE_COURSE)
export class UpdateCourseInput extends PartialType(CreateCourseInput) {
  @Field(() => ID)
  @IsString()
  courseId: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100000)
  durationMinutes?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}
