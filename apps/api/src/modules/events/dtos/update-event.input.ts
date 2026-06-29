import { Field, ID, InputType, PartialType } from "@nestjs/graphql";
import { EventGqlInputNames } from "@events/enums/gql-names.enum";
import { CreateEventInput } from "@events/dtos/create-event.input";
import { IsString } from "class-validator";

@InputType(EventGqlInputNames.UPDATE_EVENT)
export class UpdateEventInput extends PartialType(CreateEventInput) {
  @Field(() => ID) @IsString() eventId: string;
}
