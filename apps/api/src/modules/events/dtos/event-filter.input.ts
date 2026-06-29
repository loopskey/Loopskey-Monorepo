import { EventCategory, EventStatus, EventType } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { IsBoolean, IsDateString } from "class-validator";
import { EventGqlInputNames } from "@events/enums/gql-names.enum";
import { EventDeliveryMode } from "@prisma/client";
import { Field, InputType } from "@nestjs/graphql";

@InputType(EventGqlInputNames.EVENT_FILTER)
export class EventFilterInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => EventType, { nullable: true })
  @IsOptional()
  @IsEnum(EventType)
  type?: EventType;

  @Field(() => EventDeliveryMode, { nullable: true })
  @IsOptional()
  @IsEnum(EventDeliveryMode)
  deliveryMode?: EventDeliveryMode;

  @Field(() => EventCategory, { nullable: true })
  @IsOptional()
  @IsEnum(EventCategory)
  category?: EventCategory;

  @Field(() => EventStatus, { nullable: true })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isFree?: boolean;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  providerId?: string;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDateString()
  fromDate?: Date;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDateString()
  toDate?: Date;
}
