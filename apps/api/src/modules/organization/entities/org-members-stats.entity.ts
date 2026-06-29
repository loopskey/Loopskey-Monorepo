import { OrganizationDashboardGqlObjectNames } from "@org/enums/org-dashboard-gql-names.enum";
import { Field, Float, Int, ObjectType } from "@nestjs/graphql";

@ObjectType(OrganizationDashboardGqlObjectNames.ORGANIZATION_MEMBERS_STATS)
export class OrganizationMembersStatsEntity {
  @Field(() => Float) totalPdus: number;
  @Field(() => Int) totalMembers: number;
  @Field(() => Int) activeMembers: number;
  @Field(() => Int) inactiveMembers: number;
  @Field(() => Float) averageCompliance: number;
}
