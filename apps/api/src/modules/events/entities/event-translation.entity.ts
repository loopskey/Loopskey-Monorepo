import { ContentTranslationEntityBase } from "@common/types/content-translation.types";
import { EventGqlObjectNames } from "@events/enums/gql-names.enum";
import { ObjectType } from "@nestjs/graphql";

@ObjectType(EventGqlObjectNames.EVENT_TRANSLATION)
export class EventTranslationEntity extends ContentTranslationEntityBase {}
