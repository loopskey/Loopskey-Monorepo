import { ProviderDashboardRange } from "@provider/enums/provider-register.enum";
import { ProviderGqlInputNames } from "@provider/enums/gql-names.enum";
import { IsEnum, IsOptional } from "class-validator";
import { Field, InputType } from "@nestjs/graphql";

@InputType(ProviderGqlInputNames.PROVIDER_DASHBOARD_RANGE_INPUT)
export class ProviderDashboardRangeInput {
  @Field(() => ProviderDashboardRange, {
    nullable: true,
    defaultValue: ProviderDashboardRange.LAST_30_DAYS,
  })
  @IsOptional()
  @IsEnum(ProviderDashboardRange)
  range?: ProviderDashboardRange = ProviderDashboardRange.LAST_30_DAYS;
}
