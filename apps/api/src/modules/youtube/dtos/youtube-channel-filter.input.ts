import { IsBoolean, IsEnum, IsOptional, IsString } from "class-validator";
import { YouTubeCategory, YouTubeChannelStatus } from "@prisma/client";
import { MAX_CATALOG_SEARCH_LENGTH } from "@utils/catalog-pagination.util";
import { YouTubeGqlInputNames } from "@youtube/enums/gql-names.enum";
import { Field, InputType } from "@nestjs/graphql";
import { MaxLength } from "class-validator";

@InputType(YouTubeGqlInputNames.YOUTUBE_CHANNEL_FILTER)
export class YouTubeChannelFilterInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(MAX_CATALOG_SEARCH_LENGTH)
  search?: string;

  @Field(() => YouTubeCategory, { nullable: true })
  @IsOptional()
  @IsEnum(YouTubeCategory)
  category?: YouTubeCategory;

  @Field(() => YouTubeChannelStatus, { nullable: true })
  @IsOptional()
  @IsEnum(YouTubeChannelStatus)
  status?: YouTubeChannelStatus;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  providerId?: string;
}
