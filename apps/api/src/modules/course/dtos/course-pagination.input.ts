import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { Field, InputType, Int } from "@nestjs/graphql";
import { CourseGqlInputNames } from "@course/enums/gql-names.enum";

@InputType(CourseGqlInputNames.COURSE_PAGINATION)
export class CoursePaginationInput {
  @Field(() => Int, { nullable: true, defaultValue: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  take?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  cursor?: string;
}
