import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { OrganizationDashboardGqlInputNames } from "@org/enums/org-dashboard-gql-names.enum";
import { Field, InputType, Int } from "@nestjs/graphql";

@InputType(OrganizationDashboardGqlInputNames.ORGANIZATION_PAGINATION_INPUT)
export class OrganizationPaginationInput {
  @Field(() => Int, { nullable: true, defaultValue: 12 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  take?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  cursor?: string;
}
