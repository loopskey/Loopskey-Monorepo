import { OrganizationDashboardGqlObjectNames } from "@org/enums/org-dashboard-gql-names.enum";
import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType(
  OrganizationDashboardGqlObjectNames.BULIK_ADD_ORGANIZATION_MEMBER_RESULT,
)
export class BulkAddOrganizationMembersResultEntity {
  @Field(() => Int) failed: number;
  @Field(() => Int) created: number;
  @Field(() => Int) updated: number;
  @Field(() => Int) totalRows: number;
  @Field(() => [String]) errors: string[];
}
