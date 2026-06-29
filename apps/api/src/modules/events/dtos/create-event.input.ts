import { IsBoolean, IsDate, IsUrl, Max, MaxLength, Min } from "class-validator";
import { IsEnum, IsInt, IsNumber, IsOptional, IsString } from "class-validator";
import { AppLanguage, EventCategory, EventDeliveryMode } from "@prisma/client";
import { EventStatus, EventType, PDUCategory } from "@prisma/client";
import { Field, Float, InputType, Int } from "@nestjs/graphql";
import { EventGqlInputNames } from "@events/enums/gql-names.enum";
import { Type } from "class-transformer";

@InputType(EventGqlInputNames.CREATE_EVENT)
export class CreateEventInput {
  @Field()
  @IsString()
  @MaxLength(180)
  title: string;

  @Field()
  @IsString()
  @MaxLength(5000)
  description: string;

  @Field(() => EventType)
  @IsEnum(EventType)
  type: EventType;

  @Field(() => EventDeliveryMode)
  @IsEnum(EventDeliveryMode)
  deliveryMode: EventDeliveryMode;

  @Field(() => EventCategory)
  @IsEnum(EventCategory)
  category: EventCategory;

  @Field(() => EventStatus, { nullable: true, defaultValue: EventStatus.DRAFT })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus = EventStatus.DRAFT;

  @Field(() => AppLanguage, { nullable: true })
  @IsOptional()
  @IsEnum(AppLanguage)
  language?: AppLanguage;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  specificTopic?: string;

  @Field(() => PDUCategory, { nullable: true })
  @IsOptional()
  @IsEnum(PDUCategory)
  pduCategory?: PDUCategory;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  earlyBirdDiscount?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUrl()
  promotionVideoUrl?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  speaker?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  organizer?: string;

  @Field(() => Date)
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @Field(() => String, { nullable: true, defaultValue: "UTC" })
  @IsOptional()
  @IsString()
  timezone?: string = "UTC";

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(250)
  location?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUrl()
  onlineUrl?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @Field(() => String, { nullable: true, defaultValue: "USD" })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string = "USD";

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isFree?: boolean;

  @Field(() => Float, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  pdu?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @Field(() => Boolean, { nullable: true, defaultValue: true })
  @IsOptional()
  @IsBoolean()
  registrationEnabled?: boolean = true;
}
