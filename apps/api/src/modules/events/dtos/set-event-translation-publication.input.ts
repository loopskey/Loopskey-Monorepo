import { SetContentTranslationPublicationInputBase } from "@common/types/content-translation.types";
import { Field, ID, InputType } from "@nestjs/graphql";
import { EventGqlInputNames } from "@events/enums/gql-names.enum";

import * as V from "class-validator";

@InputType(EventGqlInputNames.SET_EVENT_TRANSLATION_PUBLICATION)
export class SetEventTranslationPublicationInput extends SetContentTranslationPublicationInputBase {
  @Field(() => ID)
  @V.IsString()
  @V.IsNotEmpty()
  eventId: string;
}
