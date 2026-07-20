import { IsBoolean, IsOptional, IsString } from "class-validator";
import { OrganizationDashboardGqlInputNames } from "@org/enums/org-dashboard-gql-names.enum";
import { Field, InputType } from "@nestjs/graphql";

@InputType(
  OrganizationDashboardGqlInputNames.UPDATE_ORGANIZATION_DEPARTMENT_INPUT,
)
export class UpdateOrganizationDepartmentInput {
  @Field() @IsString() departmentId: string;
  @Field({ nullable: true }) @IsOptional() @IsString() title?: string;
  @Field({ nullable: true }) @IsOptional() @IsBoolean() isActive?: boolean;
  @Field({ nullable: true }) @IsOptional() @IsString() description?: string;
}
