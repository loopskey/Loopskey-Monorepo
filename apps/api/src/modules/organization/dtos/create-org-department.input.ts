import { OrganizationDashboardGqlInputNames } from "@org/enums/org-dashboard-gql-names.enum";
import { IsOptional, IsString, MinLength } from "class-validator";
import { Field, InputType } from "@nestjs/graphql";

@InputType(
  OrganizationDashboardGqlInputNames.CREATE_ORGANIZATION_DEPARTMENT_INPUT,
)
export class CreateOrganizationDepartmentInput {
  @Field() @IsString() @MinLength(2) title: string;
  @Field({ nullable: true }) @IsOptional() @IsString() description?: string;
}
