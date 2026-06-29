import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { Field, InputType, Int } from "@nestjs/graphql";
import { YouTubeGqlInputNames } from "@youtube/enums/gql-names.enum";

@InputType(YouTubeGqlInputNames.YOUTUBE_CHANNEL_PAGINATION)
export class YouTubeChannelPaginationInput {
  @Field(() => Int, { nullable: true, defaultValue: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  take?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  cursor?: string;
}
