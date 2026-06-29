import { CourseSortField, SortDirection } from "@course/enums/sort.enum";
import { CourseGqlInputNames } from "@course/enums/gql-names.enum";
import { IsEnum, IsOptional } from "class-validator";
import { Field, InputType } from "@nestjs/graphql";

@InputType(CourseGqlInputNames.COURSE_SORT)
export class CourseSortInput {
  @Field(() => CourseSortField, {
    nullable: true,
    defaultValue: CourseSortField.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(CourseSortField)
  field?: CourseSortField = CourseSortField.CREATED_AT;

  @Field(() => SortDirection, {
    nullable: true,
    defaultValue: SortDirection.DESC,
  })
  @IsOptional()
  @IsEnum(SortDirection)
  direction?: SortDirection = SortDirection.DESC;
}
