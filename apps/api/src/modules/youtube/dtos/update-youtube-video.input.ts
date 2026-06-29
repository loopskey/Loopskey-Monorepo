import { Field, ID, InputType, PartialType } from "@nestjs/graphql";
import { CreateYouTubeVideoInput } from "@youtube/dtos/create-youtube-video.input";
import { YouTubeGqlInputNames } from "@youtube/enums/gql-names.enum";
import { IsString } from "class-validator";

@InputType(YouTubeGqlInputNames.UPDATE_YOUTUBE_VIDEO)
export class UpdateYouTubeVideoInput extends PartialType(
  CreateYouTubeVideoInput,
) {
  @Field(() => ID) @IsString() videoId: string;
}
