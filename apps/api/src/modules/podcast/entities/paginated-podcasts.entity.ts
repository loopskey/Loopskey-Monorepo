import { Field, Int, ObjectType } from "@nestjs/graphql";
import { PodcastGqlObjectNames } from "@podcast/enums/gql-names.enum";
import { PodcastEntity } from "@podcast/entities/podcast.entity";

@ObjectType(PodcastGqlObjectNames.PODCAST_PAGE_INFO)
export class PodcastPageInfoEntity {
  @Field() hasNextPage: boolean;
  @Field(() => String, { nullable: true }) nextCursor?: string | null;
}

@ObjectType(PodcastGqlObjectNames.PAGINATED_PODCASTS)
export class PaginatedPodcastsEntity {
  @Field(() => Int) totalCount: number;
  @Field(() => [PodcastEntity]) items: PodcastEntity[];
  @Field(() => PodcastPageInfoEntity) pageInfo: PodcastPageInfoEntity;
}
