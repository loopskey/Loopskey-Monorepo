import { SaveContentTranslationInputBase } from "@common/types/content-translation.types";
import { Field, ID, InputType } from "@nestjs/graphql";
import { EventGqlInputNames } from "@events/enums/gql-names.enum";

import * as V from "class-validator";

@InputType(EventGqlInputNames.SAVE_EVENT_TRANSLATION)
export class SaveEventTranslationInput extends SaveContentTranslationInputBase {
  @Field(() => ID)
  @V.IsString()
  @V.IsNotEmpty()
  eventId: string;
}
