import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import { ProviderAttendeeEntity } from "@provider/entities/provider-attendee.entity";
import { ProviderGqlObjectNames } from "@provider/enums/gql-names.enum";

@ObjectType(ProviderGqlObjectNames.PROVIDER_PAGE_INFO)
export class ProviderDashboardPageInfoEntity {
  @Field() hasNextPage: boolean;
  @Field(() => String, { nullable: true }) nextCursor?: string | null;
}

@ObjectType("ProviderAttendeesStats")
export class ProviderAttendeesStatsEntity {
  @Field(() => Int) attended: number;
  @Field(() => Int) confirmed: number;
  @Field(() => Int) totalRegistered: number;
  @Field(() => Float) attendanceRate: number;
}

@ObjectType(ProviderGqlObjectNames.PAGINATED_PROVIDER_ATTENDEES)
export class PaginatedProviderAttendeesEntity {
  @Field(() => Int) totalCount: number;
  @Field(() => [ProviderAttendeeEntity]) items: ProviderAttendeeEntity[];
  @Field(() => ProviderAttendeesStatsEntity)
  stats: ProviderAttendeesStatsEntity;
  @Field(() => ProviderDashboardPageInfoEntity)
  pageInfo: ProviderDashboardPageInfoEntity;
}
