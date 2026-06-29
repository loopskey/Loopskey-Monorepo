import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { EventGqlObjectNames } from "@events/enums/gql-names.enum";

@ObjectType(EventGqlObjectNames.EVENT_SCHEDULE_ITEM)
export class EventScheduleItemEntity {
  @Field() endTime: Date;
  @Field() title: string;
  @Field() eventId: string;
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
  @Field() startTime: Date;
  @Field(() => ID) id: string;
  @Field(() => Int) dayNumber: number;
  @Field(() => String, { nullable: true }) speaker?: string | null;
  @Field(() => String, { nullable: true }) description?: string | null;
}
