import { CourseCategory, CourseLevel } from "@prisma/client";
import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import { CourseGqlObjectNames } from "@course/enums/gql-names.enum";

@ObjectType(CourseGqlObjectNames.COURSE_CATEGORY_FACET)
export class CourseCategoryFacetEntity {
  @Field(() => CourseCategory) value: CourseCategory;
  @Field(() => Int) count: number;
}

@ObjectType(CourseGqlObjectNames.COURSE_LEVEL_FACET)
export class CourseLevelFacetEntity {
  @Field(() => CourseLevel) value: CourseLevel;
  @Field(() => Int) count: number;
}

@ObjectType(CourseGqlObjectNames.COURSE_RATING_FACET)
export class CourseRatingFacetEntity {
  @Field(() => Float) minimum: number;
  @Field(() => Int) count: number;
}

@ObjectType(CourseGqlObjectNames.COURSE_FILTER_FACETS)
export class CourseFilterFacetsEntity {
  @Field(() => [CourseCategoryFacetEntity])
  categories: CourseCategoryFacetEntity[];

  @Field(() => [CourseLevelFacetEntity])
  levels: CourseLevelFacetEntity[];

  @Field(() => [CourseRatingFacetEntity])
  ratings: CourseRatingFacetEntity[];
}
