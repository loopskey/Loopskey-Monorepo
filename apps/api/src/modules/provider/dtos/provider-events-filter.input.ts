import { IsEnum, IsOptional, IsString } from "class-validator";
import { ProviderGqlInputNames } from "@provider/enums/gql-names.enum";
import { Field, InputType } from "@nestjs/graphql";
import { EventStatus } from "@prisma/client";

@InputType(ProviderGqlInputNames.PROVIDER_EVENTS_FILTER_INPUT)
export class ProviderEventsFilterInput {
  @Field({ nullable: true }) @IsOptional() @IsString() search?: string;
  @Field(() => EventStatus, { nullable: true })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;
}
