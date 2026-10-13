import { SetContentTranslationPublicationInputBase } from "@common/types/content-translation.types";
import { Field, ID, InputType } from "@nestjs/graphql";
import { PodcastGqlInputNames } from "@podcast/enums/gql-names.enum";

import * as V from "class-validator";

@InputType(PodcastGqlInputNames.SET_PODCAST_TRANSLATION_PUBLICATION)
export class SetPodcastTranslationPublicationInput extends SetContentTranslationPublicationInputBase {
  @Field(() => ID)
  @V.IsString()
  @V.IsNotEmpty()
  podcastId: string;
}
