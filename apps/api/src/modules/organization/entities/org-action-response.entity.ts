import { OrganizationDashboardGqlObjectNames } from "@org/enums/org-dashboard-gql-names.enum";
import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType(OrganizationDashboardGqlObjectNames.ORGANIZATION_ACTION_RESPONSE)
export class OrganizationActionResponseEntity {
  @Field() code: string;
  @Field() message: string;
  @Field() success: boolean;
}
