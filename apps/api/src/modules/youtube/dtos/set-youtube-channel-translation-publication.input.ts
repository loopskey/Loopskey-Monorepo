import { Field, ID, InputType } from "@nestjs/graphql";
import { SetContentTranslationPublicationInputBase } from "@common/types/content-translation.types";
import { YouTubeGqlInputNames } from "@youtube/enums/gql-names.enum";

import * as V from "class-validator";

@InputType(YouTubeGqlInputNames.SET_YOUTUBE_CHANNEL_TRANSLATION_PUBLICATION)
export class SetYouTubeChannelTranslationPublicationInput extends SetContentTranslationPublicationInputBase {
  @Field(() => ID)
  @V.IsString()
  @V.IsNotEmpty()
  channelId: string;
}
