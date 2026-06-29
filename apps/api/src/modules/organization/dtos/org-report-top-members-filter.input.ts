import { IsDateString, IsOptional, IsString } from "class-validator";
import { OrganizationDashboardGqlInputNames } from "@org/enums/org-dashboard-gql-names.enum";
import { Field, InputType } from "@nestjs/graphql";

@InputType(
  OrganizationDashboardGqlInputNames.ORGANIZATION_REPORT_TOP_MEMBERS_INPUT,
)
export class OrganizationReportTopMembersFilterInput {
  @Field({ nullable: true }) @IsOptional() @IsString() search?: string;
  @Field({ nullable: true }) @IsOptional() @IsDateString() endDate?: string;
  @Field({ nullable: true }) @IsOptional() @IsString() departmentId?: string;
  @Field({ nullable: true }) @IsOptional() @IsDateString() startDate?: string;
}
