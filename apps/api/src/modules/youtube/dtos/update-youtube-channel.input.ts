import { Field, ID, InputType, PartialType } from "@nestjs/graphql";
import { CreateYouTubeChannelInput } from "@youtube/dtos/create-youtube-channel.input";
import { YouTubeGqlInputNames } from "@youtube/enums/gql-names.enum";
import { IsString } from "class-validator";

@InputType(YouTubeGqlInputNames.UPDATE_YOUTUBE_CHANNEL)
export class UpdateYouTubeChannelInput extends PartialType(
  CreateYouTubeChannelInput,
) {
  @Field(() => ID) @IsString() channelId: string;
}
