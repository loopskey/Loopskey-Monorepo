import { EventDeliveryMode, EventRegistrationStatus } from "@prisma/client";
import { IsDateString, IsEnum, IsOptional, IsString } from "class-validator";
import { ProfessionalGqlInputNames } from "@professional/enums/gql-names.enum";
import { Field, InputType } from "@nestjs/graphql";

@InputType(ProfessionalGqlInputNames.PROFESSIONAL_CALENDAR_EVENTS_FILTER_INPUT)
export class ProfessionalCalendarEventsFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDateString()
  from?: Date;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDateString()
  to?: Date;

  @Field(() => EventRegistrationStatus, { nullable: true })
  @IsOptional()
  @IsEnum(EventRegistrationStatus)
  status?: EventRegistrationStatus;

  @Field(() => EventDeliveryMode, { nullable: true })
  @IsOptional()
  @IsEnum(EventDeliveryMode)
  deliveryMode?: EventDeliveryMode;
}
