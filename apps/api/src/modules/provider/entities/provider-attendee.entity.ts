import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql";
import { ProviderDashboardPageInfoEntity } from "@provider/entities/paginated-provider-attendees.entity";
import { EventRegistrationStatus } from "@prisma/client";
import { ProviderGqlObjectNames } from "@provider/enums/gql-names.enum";

@ObjectType(ProviderGqlObjectNames.PROVIDER_ATTENDEE)
export class ProviderAttendeeEntity {
  @Field() eventTitle: string;
  @Field() registrationDate: Date;
  @Field(() => ID) userId: string;
  @Field(() => ID) eventId: string;
  @Field(() => ID) registrationId: string;
  @Field(() => String, { nullable: true }) name?: string | null;
  @Field(() => String, { nullable: true }) email?: string | null;
  @Field(() => Date, { nullable: true }) attendedAt?: Date | null;
  @Field(() => Date, { nullable: true }) completedAt?: Date | null;
  @Field(() => EventRegistrationStatus)
  status: EventRegistrationStatus;
}

@ObjectType(ProviderGqlObjectNames.PROVIDER_ATTENDEE_STATS)
export class ProviderAttendeeStatsEntity {
  @Field(() => Int) attended: number;
  @Field(() => Int) confirmed: number;
  @Field(() => Int) totalRegistered: number;
  @Field(() => Float) attendanceRate: number;
}

@ObjectType(ProviderGqlObjectNames.PAGINATED_PROVIDER_ATTENDEES)
export class PaginatedProviderAttendeesEntity {
  @Field(() => Int) totalCount: number;
  @Field(() => [ProviderAttendeeEntity]) items: ProviderAttendeeEntity[];
  @Field(() => ProviderAttendeeStatsEntity) stats: ProviderAttendeeStatsEntity;
  @Field(() => ProviderDashboardPageInfoEntity)
  pageInfo: ProviderDashboardPageInfoEntity;
}
