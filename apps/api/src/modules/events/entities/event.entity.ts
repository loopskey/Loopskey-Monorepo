import { AppLanguage, EventCategory, EventDeliveryMode } from "@prisma/client";
import { EventStatus, EventType, PDUCategory } from "@prisma/client";
import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql";
import { EventScheduleItemEntity } from "@events/entities/event-schedule-item.entity";
import { EventGqlObjectNames } from "@events/enums/gql-names.enum";

@ObjectType(EventGqlObjectNames.EVENT)
export class EventEntity {
  @Field() slug: string;
  @Field() title: string;
  @Field() isFree: boolean;
  @Field() startDate: Date;
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
  @Field() currency: string;
  @Field() timezone: string;
  @Field(() => ID) id: string;
  @Field() description: string;
  @Field(() => Int) views: number;
  @Field(() => Float) pdu: number;
  @Field(() => Float) rating: number;
  @Field(() => Int) attendees: number;
  @Field() registrationEnabled: boolean;
  @Field(() => Int) ratingCount: number;
  @Field(() => EventType) type: EventType;
  @Field(() => Float) averageRating: number;
  @Field(() => EventStatus) status: EventStatus;
  @Field(() => EventCategory) category: EventCategory;
  @Field(() => Date, { nullable: true }) endDate?: Date | null;
  @Field(() => Float, { nullable: true }) price?: number | null;
  @Field(() => Int, { nullable: true }) capacity?: number | null;
  @Field(() => Date, { nullable: true }) deletedAt?: Date | null;
  @Field(() => EventDeliveryMode) deliveryMode: EventDeliveryMode;
  @Field(() => String, { nullable: true }) speaker?: string | null;
  @Field(() => String, { nullable: true }) imageUrl?: string | null;
  @Field(() => String, { nullable: true }) location?: string | null;
  @Field(() => String, { nullable: true }) organizer?: string | null;
  @Field(() => String, { nullable: true }) onlineUrl?: string | null;
  @Field(() => String, { nullable: true }) providerId?: string | null;
  @Field(() => String, { nullable: true }) specificTopic?: string | null;
  @Field(() => Float, { nullable: true }) earlyBirdDiscount?: number | null;
  @Field(() => String, { nullable: true }) promotionVideoUrl?: string | null;
  @Field(() => AppLanguage, { nullable: true }) language?: AppLanguage | null;
  @Field(() => PDUCategory, { nullable: true })
  pduCategory?: PDUCategory | null;
  @Field(() => [EventScheduleItemEntity], { nullable: true })
  scheduleItems?: EventScheduleItemEntity[];
}
