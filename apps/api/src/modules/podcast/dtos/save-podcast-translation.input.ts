import { SaveContentTranslationInputBase } from "@common/types/content-translation.types";
import { PodcastGqlInputNames } from "@podcast/enums/gql-names.enum";
import { Field, ID, InputType } from "@nestjs/graphql";

import * as V from "class-validator";

@InputType(PodcastGqlInputNames.SAVE_PODCAST_TRANSLATION)
export class SavePodcastTranslationInput extends SaveContentTranslationInputBase {
  @Field(() => ID)
  @V.IsString()
  @V.IsNotEmpty()
  podcastId: string;
}
