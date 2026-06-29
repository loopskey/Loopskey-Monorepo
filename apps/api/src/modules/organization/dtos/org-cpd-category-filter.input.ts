import { OrganizationDashboardGqlInputNames } from "@org/enums/org-dashboard-gql-names.enum";
import { IsBoolean, IsOptional, IsString } from "class-validator";
import { Field, InputType } from "@nestjs/graphql";

@InputType(
  OrganizationDashboardGqlInputNames.ORGANIZATION_CPD_CATEGORY_FILTER_INPUT,
)
export class OrganizationCpdCategoryFilterInput {
  @Field({ nullable: true }) @IsOptional() @IsString() year?: string;
  @Field({ nullable: true }) @IsOptional() @IsString() search?: string;
  @Field({ nullable: true }) @IsOptional() @IsBoolean() isActive?: boolean;
}
