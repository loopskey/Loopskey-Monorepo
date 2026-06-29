import { OrganizationDashboardGqlObjectNames } from "@org/enums/org-dashboard-gql-names.enum";
import { Field, Float, Int, ObjectType } from "@nestjs/graphql";

@ObjectType(OrganizationDashboardGqlObjectNames.ORGANIZATION_ASSIGNMENT_STATS)
export class OrganizationAssignmentStatsEntity {
  @Field(() => Int) totalAssignments: number;
  @Field(() => Int) activeAssignments: number;
  @Field(() => Int) totalParticipants: number;
  @Field(() => Float) averageCompletionRate: number;
}
