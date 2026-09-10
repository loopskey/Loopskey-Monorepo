import { IsNumber, IsOptional, IsString, IsUrl } from "class-validator";
import { IsEnum, IsISO8601, IsNotEmpty } from "class-validator";
import { IsBoolean, Max, MaxLength, Min } from "class-validator";
import { EventCategory, EventDeliveryMode, EventType } from "@prisma/client";

/**
 * The scalar half of a canonical crawled event. `scheduleItems` is carried
 * alongside this object rather than on it, because it is a structured child
 * set with its own replace-or-leave semantics.
 */
export class CanonicalEventInput {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  externalId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2048)
  @IsUrl({ require_protocol: true })
  canonicalUrl!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  sourcePlatform?: string | null;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  title!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50_000)
  description!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  speaker?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  organizer?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  @IsUrl({ require_protocol: true })
  imageCandidateUrl?: string | null;

  @IsEnum(EventType)
  type!: EventType;

  @IsEnum(EventDeliveryMode)
  deliveryMode!: EventDeliveryMode;

  @IsEnum(EventCategory)
  category!: EventCategory;

  @IsISO8601()
  startDate!: string;

  @IsOptional()
  @IsISO8601()
  endDate?: string | null;

  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  timezone!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  location?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  @IsUrl({ require_protocol: true })
  onlineUrl?: string | null;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price?: number | null;

  @IsString()
  @MaxLength(3)
  currency!: string;

  @IsBoolean()
  isFree!: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  pdu?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  language?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  topic?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  rawType?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  rawDeliveryMode?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  rawCategory?: string | null;

  @IsOptional()
  @IsISO8601()
  lastUpdatedAt?: string | null;

  @IsOptional()
  @IsISO8601()
  crawledAt?: string | null;

  @IsOptional()
  @IsISO8601()
  updatedAt?: string | null;
}
