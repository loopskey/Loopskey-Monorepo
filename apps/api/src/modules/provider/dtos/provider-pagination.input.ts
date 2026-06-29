import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { Field, InputType, Int } from "@nestjs/graphql";
import { ProviderGqlInputNames } from "@provider/enums/gql-names.enum";

@InputType(ProviderGqlInputNames.PROVIDER_DASHBOARD_PAGINATION_INPUT)
export class ProviderDashboardPaginationInput {
  @Field(() => Int, { nullable: true, defaultValue: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  take?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  cursor?: string;
}
