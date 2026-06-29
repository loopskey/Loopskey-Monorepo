import { IsDateString, IsEnum, IsOptional, IsString } from "class-validator";
import { OrganizationDashboardGqlInputNames } from "@org/enums/org-dashboard-gql-names.enum";
import { Field, InputType } from "@nestjs/graphql";
import { OrgRangeEnum } from "@org/enums/org-dashboard-message-code.enum";

@InputType(OrganizationDashboardGqlInputNames.ORGANIZATION_REPORT_FILTER_INPUT)
export class OrganizationReportFilterInput {
  @Field({ nullable: true }) @IsOptional() @IsDateString() endDate?: string;
  @Field({ nullable: true }) @IsOptional() @IsString() departmentId?: string;
  @Field({ nullable: true }) @IsOptional() @IsDateString() startDate?: string;
  @Field(() => OrgRangeEnum, { nullable: true })
  @IsOptional()
  @IsEnum(OrgRangeEnum)
  range?: OrgRangeEnum;
}
