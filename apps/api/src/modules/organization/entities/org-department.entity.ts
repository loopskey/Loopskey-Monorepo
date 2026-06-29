import { OrganizationDashboardGqlObjectNames } from "@org/enums/org-dashboard-gql-names.enum";
import { Field, ID, ObjectType } from "@nestjs/graphql";

@ObjectType(OrganizationDashboardGqlObjectNames.ORGANIZATION_DEPARTMENT)
export class OrganizationDepartmentEntity {
  @Field() title: string;
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
  @Field() isActive: boolean;
  @Field(() => ID) id: string;
  @Field(() => ID) organizationId: string;
  @Field(() => String, { nullable: true }) description?: string | null;
}
