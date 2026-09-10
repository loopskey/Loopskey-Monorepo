import { IsInt, IsOptional, IsString, IsUrl } from "class-validator";
import { IsEnum, IsISO8601, IsNotEmpty } from "class-validator";
import { MaxLength, Min } from "class-validator";
import { YouTubeCategory } from "@prisma/client";

export class CanonicalYouTubeInput {
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

  @IsOptional()
  @IsString()
  @MaxLength(50_000)
  description?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  @IsUrl({ require_protocol: true })
  imageCandidateUrl?: string | null;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2048)
  @IsUrl({ require_protocol: true })
  channelUrl!: string;

  @IsEnum(YouTubeCategory)
  category!: YouTubeCategory;

  @IsOptional()
  @IsInt()
  @Min(0)
  subscribers?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  views?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  videoCount?: number | null;

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
