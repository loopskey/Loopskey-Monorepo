import { Field, Int, ObjectType } from "@nestjs/graphql";
import { YouTubeGqlObjectNames } from "@youtube/enums/gql-names.enum";
import { YouTubeChannelEntity } from "@modules/youtube/entities/youtube-channel.entity";

@ObjectType(YouTubeGqlObjectNames.YOUTUBE_CHANNEL_PAGE_INFO)
export class YouTubeChannelPageInfoEntity {
  @Field() hasNextPage: boolean;
  @Field(() => String, { nullable: true }) nextCursor?: string | null;
}

@ObjectType(YouTubeGqlObjectNames.PAGINATED_YOUTUBE_CHANNELS)
export class PaginatedYouTubeChannelsEntity {
  @Field(() => Int) totalCount: number;
  @Field(() => [YouTubeChannelEntity]) items: YouTubeChannelEntity[];
  @Field(() => YouTubeChannelPageInfoEntity)
  pageInfo: YouTubeChannelPageInfoEntity;
}
