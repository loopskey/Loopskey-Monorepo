import { IsBoolean, IsEnum, IsNumber, IsOptional, Min } from "class-validator";
import { OrganizationDashboardGqlInputNames } from "@org/enums/org-dashboard-gql-names.enum";
import { Field, Float, InputType } from "@nestjs/graphql";
import { ComplianceCycle } from "@prisma/client";

@InputType(
  OrganizationDashboardGqlInputNames.UPDATE_ORGANIZATION_SETTINGS_INPUT,
)
export class UpdateOrganizationSettingsInput {
  @Field(() => ComplianceCycle, { nullable: true })
  @IsOptional()
  @IsEnum(ComplianceCycle)
  complianceCycle?: ComplianceCycle;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumPdu?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  strictCompliance?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  complianceAlerts?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  assignmentNotifications?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  weeklySummaryReport?: boolean;
}
