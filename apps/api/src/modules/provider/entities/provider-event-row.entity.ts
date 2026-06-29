import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql";
import { ProviderGqlObjectNames } from "@provider/enums/gql-names.enum";
import { EventStatus } from "@prisma/client";

@ObjectType(ProviderGqlObjectNames.PROVIDER_EVENT_TABLE_ROW)
export class ProviderEventRowEntity {
  @Field() title: string;
  @Field() startDate: Date;
  @Field(() => ID) id: string;
  @Field(() => Int) views: number;
  @Field(() => Float) pdu: number;
  @Field(() => Int) registrants: number;
  @Field(() => EventStatus) status: EventStatus;
}
