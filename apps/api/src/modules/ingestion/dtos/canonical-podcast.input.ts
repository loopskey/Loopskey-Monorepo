import { IsInt, IsOptional, IsString, IsUrl } from "class-validator";
import { IsEnum, IsISO8601, IsNotEmpty } from "class-validator";
import { MaxLength, Min } from "class-validator";
import { PodcastCategory } from "@prisma/client";

export class CanonicalPodcastInput {
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
  host!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  @IsUrl({ require_protocol: true })
  imageCandidateUrl?: string | null;

  @IsEnum(PodcastCategory)
  category!: PodcastCategory;

  @IsOptional()
  @IsInt()
  @Min(0)
  durationMinutes?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  language?: string | null;

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
