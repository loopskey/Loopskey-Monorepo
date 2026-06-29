import { EventRegistrationStatus } from "@prisma/client";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { EventGqlObjectNames } from "@events/enums/gql-names.enum";

@ObjectType(EventGqlObjectNames.EVENT_REGISTRATION)
export class EventRegistrationEntity {
  @Field() userId: string;
  @Field() eventId: string;
  @Field() updatedAt: Date;
  @Field() createdAt: Date;
  @Field(() => ID) id: string;
  @Field(() => Date, { nullable: true }) attendedAt?: Date | null;
  @Field(() => Date, { nullable: true }) completedAt?: Date | null;
  @Field(() => EventRegistrationStatus) status: EventRegistrationStatus;
}
