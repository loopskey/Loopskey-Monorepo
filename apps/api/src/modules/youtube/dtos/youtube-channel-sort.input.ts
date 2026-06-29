import { YouTubeChannelSortDirection } from "@youtube/enums/youtube.enum";
import { YouTubeChannelSortField } from "@youtube/enums/youtube.enum";
import { YouTubeGqlInputNames } from "@youtube/enums/gql-names.enum";
import { IsEnum, IsOptional } from "class-validator";
import { Field, InputType } from "@nestjs/graphql";

@InputType(YouTubeGqlInputNames.YOUTUBE_CHANNEL_SORT)
export class YouTubeChannelSortInput {
  @Field(() => YouTubeChannelSortField, {
    nullable: true,
    defaultValue: YouTubeChannelSortField.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(YouTubeChannelSortField)
  field?: YouTubeChannelSortField = YouTubeChannelSortField.CREATED_AT;

  @Field(() => YouTubeChannelSortDirection, {
    nullable: true,
    defaultValue: YouTubeChannelSortDirection.DESC,
  })
  @IsOptional()
  @IsEnum(YouTubeChannelSortDirection)
  direction?: YouTubeChannelSortDirection = YouTubeChannelSortDirection.DESC;
}
