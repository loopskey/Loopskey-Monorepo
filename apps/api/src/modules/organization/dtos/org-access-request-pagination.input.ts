import { OrganizationAccessRequestGqlInputNames } from "@org/enums/org-access-request-gql-names.enum";
import { Field, InputType, Int } from "@nestjs/graphql";
import { IsInt, IsOptional } from "class-validator";

@InputType(
  OrganizationAccessRequestGqlInputNames.ORGANIZATION_ACCESS_REQUEST_PAGINATION,
)
export class OrganizationAccessRequestPaginationInput {
  @Field(() => Int, { nullable: true, defaultValue: 1 })
  @IsOptional()
  @IsInt()
  page?: number;

  @Field(() => Int, { nullable: true, defaultValue: 10 })
  @IsOptional()
  @IsInt()
  limit?: number;
}
