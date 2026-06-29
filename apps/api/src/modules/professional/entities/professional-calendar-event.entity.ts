import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql";
import { EventDeliveryMode, EventType } from "@prisma/client";
import { ProfessionalGqlObjectNames } from "@professional/enums/gql-names.enum";
import { EventRegistrationStatus } from "@prisma/client";
import { PageInfoEntity } from "@professional/entities/page-info.entity";

@ObjectType(ProfessionalGqlObjectNames.PROFESSIONAL_CALENDAR_Event_INFO)
export class ProfessionalCalendarEventInfoEntity {
  @Field() slug: string;
  @Field() title: string;
  @Field() startDate: Date;
  @Field() timezone: string;
  @Field(() => ID) id: string;
  @Field(() => Float) pdu: number;
  @Field(() => EventType) type: EventType;
  @Field(() => Date, { nullable: true }) endDate?: Date | null;
  @Field(() => EventDeliveryMode) deliveryMode: EventDeliveryMode;
  @Field(() => String, { nullable: true }) location?: string | null;
  @Field(() => String, { nullable: true }) onlineUrl?: string | null;
}

@ObjectType(ProfessionalGqlObjectNames.PROFESSIONAL_CALENDAR_EVENT)
export class ProfessionalCalendarEventEntity {
  @Field() userId: string;
  @Field() eventId: string;
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
  @Field(() => ID) id: string;
  @Field(() => Boolean) isPast: boolean;
  @Field(() => Boolean) isLive: boolean;
  @Field(() => Int) durationMinutes: number;
  @Field(() => Boolean) isUpcoming: boolean;
  @Field(() => Date, { nullable: true }) attendedAt?: Date | null;
  @Field(() => Date, { nullable: true }) completedAt?: Date | null;
  @Field(() => Int, { nullable: true }) startsInMinutes?: number | null;
  @Field(() => EventRegistrationStatus) status: EventRegistrationStatus;
  @Field(() => ProfessionalCalendarEventInfoEntity, { nullable: true })
  event?: ProfessionalCalendarEventInfoEntity | null;
}

@ObjectType(ProfessionalGqlObjectNames.PAGINATED_PROFESSIONAL_CALENDAR_EVENTS)
export class PaginatedProfessionalCalendarEventsEntity {
  @Field(() => Int) totalCount: number;
  @Field(() => PageInfoEntity) pageInfo: PageInfoEntity;
  @Field(() => [ProfessionalCalendarEventEntity])
  items: ProfessionalCalendarEventEntity[];
}
