import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import { ProviderGqlObjectNames } from "@provider/enums/gql-names.enum";

@ObjectType(ProviderGqlObjectNames.PROVIDER_TIME_SERIES_POINT)
export class ProviderTimeSeriesPointEntity {
  @Field() date: string;
  @Field(() => Float) revenue: number;
  @Field(() => Int) registrations: number;
}

@ObjectType(ProviderGqlObjectNames.PROVIDER_BREAKDOWN_POINT)
export class ProviderBreakdownPointEntity {
  @Field() label: string;
  @Field(() => Int) count: number;
  @Field(() => Float, { nullable: true }) value?: number | null;
}

@ObjectType(ProviderGqlObjectNames.PROVIDER_TOP_EVENT)
export class ProviderTopEventEntity {
  @Field() title: string;
  @Field() eventId: string;
  @Field(() => Int) views: number;
  @Field(() => Float) revenue: number;
  @Field(() => Int) registrations: number;
  @Field(() => Float) conversionRate: number;
}

@ObjectType(ProviderGqlObjectNames.PROVIDER_ANALYTICS)
export class ProviderAnalyticsEntity {
  @Field(() => Float) avgRating: number;
  @Field(() => Float) totalRevenue: number;
  @Field(() => Float) conversionRate: number;
  @Field(() => Float) avgFeePerAttendee: number;
  @Field(() => [ProviderTimeSeriesPointEntity])
  registrationsOverTime: ProviderTimeSeriesPointEntity[];
  @Field(() => [ProviderBreakdownPointEntity])
  pdusByCategory: ProviderBreakdownPointEntity[];
  @Field(() => [ProviderBreakdownPointEntity])
  eventTypeBreakdown: ProviderBreakdownPointEntity[];
  @Field(() => [ProviderTopEventEntity])
  topPerformingEvents: ProviderTopEventEntity[];
}
