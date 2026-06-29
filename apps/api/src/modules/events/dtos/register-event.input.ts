import { Field, ID, InputType } from "@nestjs/graphql";
import { EventGqlInputNames } from "@events/enums/gql-names.enum";
import { IsString } from "class-validator";

@InputType(EventGqlInputNames.REGISTER_EVENT)
export class RegisterEventInput {
  @Field(() => ID) @IsString() eventId: string;
}
