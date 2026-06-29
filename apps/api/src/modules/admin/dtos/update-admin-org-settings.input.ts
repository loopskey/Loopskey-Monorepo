import { AdminDashboardGqlInputNames } from "@admin/enums/gql-names.enum";
import { IsBoolean, IsEnum, IsNumber } from "class-validator";
import { Field, Float, InputType } from "@nestjs/graphql";
import { IsOptional, IsString } from "class-validator";
import { ComplianceCycle } from "@prisma/client";

@InputType(AdminDashboardGqlInputNames.UPDATE_ADMIN_ORG_SETTINGS)
export class UpdateAdminOrganizationSettingsInput {
  @Field()
  @IsString()
  organizationId: string;

  @Field(() => ComplianceCycle, { nullable: true })
  @IsOptional()
  @IsEnum(ComplianceCycle)
  complianceCycle?: ComplianceCycle;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  minimumPdu?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  strictCompliance?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  weeklySummaryReport?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  complianceAlerts?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  assignmentNotifications?: boolean;
}
