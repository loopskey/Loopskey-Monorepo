import { IsBoolean, IsEnum, IsOptional, IsString } from "class-validator";
import { YouTubeCategory, YouTubeChannelStatus } from "@prisma/client";
import { YouTubeGqlInputNames } from "@youtube/enums/gql-names.enum";
import { Field, InputType } from "@nestjs/graphql";

@InputType(YouTubeGqlInputNames.YOUTUBE_CHANNEL_FILTER)
export class YouTubeChannelFilterInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
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
