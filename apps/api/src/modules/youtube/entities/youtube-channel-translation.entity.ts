import { ContentTranslationEntityBase } from "@common/types/content-translation.types";
import { YouTubeGqlObjectNames } from "@youtube/enums/gql-names.enum";
import { ObjectType } from "@nestjs/graphql";

@ObjectType(YouTubeGqlObjectNames.YOUTUBE_CHANNEL_TRANSLATION)
export class YouTubeChannelTranslationEntity extends ContentTranslationEntityBase {}
