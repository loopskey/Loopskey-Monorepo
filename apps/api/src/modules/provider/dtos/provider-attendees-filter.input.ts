import { IsEnum, IsOptional, IsString } from "class-validator";
import { EventRegistrationStatus } from "@prisma/client";
import { ProviderGqlInputNames } from "@provider/enums/gql-names.enum";
import { Field, InputType } from "@nestjs/graphql";

@InputType(ProviderGqlInputNames.PROVIDER_ATTENDEES_FILTER_INPUT)
export class ProviderAttendeesFilterInput {
  @Field({ nullable: true }) @IsOptional() @IsString() search?: string;
  @Field({ nullable: true }) @IsOptional() @IsString() eventId?: string;
  @Field(() => EventRegistrationStatus, { nullable: true })
  @IsOptional()
  @IsEnum(EventRegistrationStatus)
  status?: EventRegistrationStatus;
}
