import { IsDateString, IsEnum, IsUrl, MaxLength, Min } from "class-validator";
import { IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Field, ID, InputType, Int } from "@nestjs/graphql";
import { YouTubeGqlInputNames } from "@youtube/enums/gql-names.enum";
import { YouTubeVideoStatus } from "@prisma/client";

@InputType(YouTubeGqlInputNames.CREATE_YOUTUBE_VIDEO)
export class CreateYouTubeVideoInput {
  @Field(() => ID)
  @IsString()
  channelId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  title: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(3000)
  description?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUrl()
  thumbnailUrl?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUrl()
  videoUrl?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  durationMinutes?: number;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  views?: number;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  likes?: number;

  @Field(() => YouTubeVideoStatus, {
    nullable: true,
    defaultValue: YouTubeVideoStatus.PUBLISHED,
  })
  @IsOptional()
  @IsEnum(YouTubeVideoStatus)
  status?: YouTubeVideoStatus = YouTubeVideoStatus.PUBLISHED;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDateString()
  publishedAt?: Date;
}
