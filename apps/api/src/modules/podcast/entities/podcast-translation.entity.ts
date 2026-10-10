import { ContentTranslationEntityBase } from "@common/types/content-translation.types";
import { PodcastGqlObjectNames } from "@podcast/enums/gql-names.enum";
import { ObjectType } from "@nestjs/graphql";

@ObjectType(PodcastGqlObjectNames.PODCAST_TRANSLATION)
export class PodcastTranslationEntity extends ContentTranslationEntityBase {}
