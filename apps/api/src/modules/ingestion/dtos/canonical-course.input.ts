import { IsNumber, IsOptional, IsString, IsUrl } from "class-validator";
import { IsEnum, IsISO8601, IsInt, IsNotEmpty } from "class-validator";
import { ArrayMaxSize, IsArray, IsBoolean } from "class-validator";
import { CourseCategory, CourseLevel } from "@prisma/client";
import { Max, MaxLength, Min } from "class-validator";
import { IsIn } from "class-validator";

export class CanonicalCourseInput {
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

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  instructor!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  @IsUrl({ require_protocol: true })
  imageCandidateUrl?: string | null;

  @IsEnum(CourseCategory)
  category!: CourseCategory;

  @IsEnum(CourseLevel)
  level!: CourseLevel;

  @IsArray()
  @ArrayMaxSize(100)
  @IsString({ each: true })
  @MaxLength(2_000, { each: true })
  requirements!: string[];

  @IsArray()
  @ArrayMaxSize(100)
  @IsString({ each: true })
  @MaxLength(2_000, { each: true })
  learnings!: string[];

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
  @IsInt()
  @Min(0)
  durationMinutes?: number | null;

  @IsOptional()
  @IsISO8601()
  lastUpdatedAt?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  rawCategory?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  rawLevel?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  rawDuration?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  language?: string | null;

  @IsOptional()
  @IsString()
  @IsIn(["COURSE"])
  @MaxLength(20)
  contentType?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  internalCategory?: string | null;

  @IsOptional()
  @IsBoolean()
  offersCertificate?: boolean | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  creditValue?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  creditSource?: string | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  creditConfidence?: number | null;

  @IsOptional()
  @IsISO8601()
  crawledAt?: string | null;

  @IsOptional()
  @IsISO8601()
  updatedAt?: string | null;
}
