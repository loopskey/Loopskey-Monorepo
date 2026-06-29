import { OrganizationDashboardGqlObjectNames } from "@org/enums/org-dashboard-gql-names.enum";
import { Field, Float, ID, ObjectType } from "@nestjs/graphql";
import { ComplianceCycle } from "@prisma/client";

@ObjectType(OrganizationDashboardGqlObjectNames.ORGANIZATION_SETTINGS)
export class OrganizationSettingsEntity {
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
  @Field(() => ID) id: string;
  @Field() strictCompliance: boolean;
  @Field() complianceAlerts: boolean;
  @Field() weeklySummaryReport: boolean;
  @Field(() => Float) minimumPdu: number;
  @Field(() => ID) organizationId: string;
  @Field() assignmentNotifications: boolean;
  @Field(() => ComplianceCycle) complianceCycle: ComplianceCycle;
}
