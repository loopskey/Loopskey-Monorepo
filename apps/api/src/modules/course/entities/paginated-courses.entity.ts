import { Field, Int, ObjectType } from "@nestjs/graphql";
import { CourseGqlObjectNames } from "@course/enums/gql-names.enum";
import { CourseEntity } from "@course/entities/course.entity";

@ObjectType(CourseGqlObjectNames.COURSE_PAGE_INFO)
export class CoursePageInfoEntity {
  @Field() hasNextPage: boolean;
  @Field() hasPreviousPage: boolean;
  @Field(() => String, { nullable: true }) nextCursor?: string | null;
  @Field(() => String, { nullable: true }) previousCursor?: string | null;
}

@ObjectType(CourseGqlObjectNames.PAGINATED_COURSES)
export class PaginatedCoursesEntity {
  @Field(() => Int) totalCount: number;
  @Field(() => [CourseEntity]) items: CourseEntity[];
  @Field(() => CoursePageInfoEntity) pageInfo: CoursePageInfoEntity;
}
