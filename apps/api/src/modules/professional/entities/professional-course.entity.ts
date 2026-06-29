import { ContentType, CourseCategory, CourseLevel } from "@prisma/client";
import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql";
import { ProfessionalGqlObjectNames } from "@professional/enums/gql-names.enum";
import { ContentEnrollmentStatus } from "@prisma/client";
import { PageInfoEntity } from "@professional/entities/page-info.entity";

@ObjectType(ProfessionalGqlObjectNames.PROFESSIONAL_COURSE)
export class ProfessionalCourseEntity {
  @Field() startedAt: Date;
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
  @Field() contentId: string;
  @Field(() => ID) id: string;
  @Field(() => ID) userId: string;
  @Field(() => Int) progress: number;
  @Field(() => ContentType) contentType: ContentType;
  @Field(() => Date, { nullable: true }) canceledAt?: Date | null;
  @Field(() => Date, { nullable: true }) completedAt?: Date | null;
  @Field(() => String, { nullable: true }) courseSlug?: string | null;
  @Field(() => Float, { nullable: true }) coursePrice?: number | null;
  @Field(() => Float, { nullable: true }) courseRating?: number | null;
  @Field(() => String, { nullable: true }) courseTitle?: string | null;
  @Field(() => ContentEnrollmentStatus) status: ContentEnrollmentStatus;
  @Field(() => String, { nullable: true }) providerName?: string | null;
  @Field(() => String, { nullable: true }) courseImageUrl?: string | null;
  @Field(() => String, { nullable: true }) courseCurrency?: string | null;
  @Field(() => Int, { nullable: true }) courseRatingCount?: number | null;
  @Field(() => Boolean, { nullable: true }) courseIsFree?: boolean | null;
  @Field(() => String, { nullable: true }) courseDescription?: string | null;
  @Field(() => Int, { nullable: true }) courseDurationMinutes?: number | null;
  @Field(() => CourseLevel, { nullable: true })
  courseLevel?: CourseLevel | null;
  @Field(() => CourseCategory, { nullable: true })
  courseCategory?: CourseCategory | null;
}

@ObjectType(ProfessionalGqlObjectNames.PAGINATED_PROFESSIONAL_COURSES)
export class PaginatedProfessionalCoursesEntity {
  @Field(() => Int) totalCount: number;
  @Field(() => PageInfoEntity) pageInfo: PageInfoEntity;
  @Field(() => [ProfessionalCourseEntity]) items: ProfessionalCourseEntity[];
}
