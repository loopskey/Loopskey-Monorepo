import { SaveContentTranslationInputBase } from "@common/types/content-translation.types";
import { YouTubeGqlInputNames } from "@youtube/enums/gql-names.enum";
import { Field, ID, InputType } from "@nestjs/graphql";

import * as V from "class-validator";

@InputType(YouTubeGqlInputNames.SAVE_YOUTUBE_CHANNEL_TRANSLATION)
export class SaveYouTubeChannelTranslationInput extends SaveContentTranslationInputBase {
  @Field(() => ID)
  @V.IsString()
  @V.IsNotEmpty()
  channelId: string;
}
