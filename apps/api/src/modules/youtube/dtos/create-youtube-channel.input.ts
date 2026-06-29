import { IsBoolean, IsString, IsUrl, MaxLength, Min } from "class-validator";
import { IsEnum, IsInt, IsNotEmpty, IsOptional } from "class-validator";
import { YouTubeCategory, YouTubeChannelStatus } from "@prisma/client";
import { Field, InputType, Int } from "@nestjs/graphql";
import { YouTubeGqlInputNames } from "@youtube/enums/gql-names.enum";

@InputType(YouTubeGqlInputNames.CREATE_YOUTUBE_CHANNEL)
export class CreateYouTubeChannelInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  title: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  provider?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUrl()
  channelUrl?: string;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  subscribers?: number;

  @Field(() => YouTubeCategory)
  @IsEnum(YouTubeCategory)
  category: YouTubeCategory;

  @Field(() => YouTubeChannelStatus, {
    nullable: true,
    defaultValue: YouTubeChannelStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(YouTubeChannelStatus)
  status?: YouTubeChannelStatus = YouTubeChannelStatus.DRAFT;

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean = false;
}
