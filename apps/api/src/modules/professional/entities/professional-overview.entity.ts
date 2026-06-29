import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import { ProfessionalGqlObjectNames } from "@professional/enums/gql-names.enum";

@ObjectType(ProfessionalGqlObjectNames.PROFESSIONAL_OVERVIEW)
export class ProfessionalOverviewEntity {
  @Field(() => Float) totalPdus: number;
  @Field(() => Int) activeCourses: number;
  @Field(() => Int) upcomingEvents: number;
  @Field(() => Int) completedCourses: number;
  @Field(() => Int) certificatesEarned: number;
  @Field(() => Float) yearlyPduGoalProgress: number;
  @Field(() => String, { nullable: true }) professionalName?: string | null;
}
