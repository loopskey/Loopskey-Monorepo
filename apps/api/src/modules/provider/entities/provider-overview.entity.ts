import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import { ProviderGqlObjectNames } from "@provider/enums/gql-names.enum";

@ObjectType(ProviderGqlObjectNames.PROVIDER_STATUS_BREAKDOWN)
export class ProviderStatusBreakdownEntity {
  @Field(() => Int) draft: number;
  @Field(() => Int) archived: number;
  @Field(() => Int) published: number;
  @Field(() => Int) cancelled: number;
}

@ObjectType(ProviderGqlObjectNames.PROVIDER_OVERVIEW)
export class ProviderOverviewEntity {
  @Field(() => Int) totalViews: number;
  @Field(() => Int) totalEvents: number;
  @Field(() => Float) conversionRate: number;
  @Field(() => Int) upcomingSessions: number;
  @Field(() => Int) totalRegistrations: number;
  @Field(() => String, { nullable: true }) providerName?: string | null;
  @Field(() => ProviderStatusBreakdownEntity)
  statusBreakdown: ProviderStatusBreakdownEntity;
}
