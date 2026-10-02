import { Field, Int, ObjectType } from "@nestjs/graphql";
import { YouTubeGqlObjectNames } from "@youtube/enums/gql-names.enum";
import { YouTubeCategory } from "@prisma/client";

@ObjectType(YouTubeGqlObjectNames.YOUTUBE_CATEGORY_FACET)
export class YouTubeCategoryFacetEntity {
  @Field(() => YouTubeCategory) value: YouTubeCategory;
  @Field(() => Int) count: number;
}

@ObjectType(YouTubeGqlObjectNames.YOUTUBE_CHANNEL_FILTER_FACETS)
export class YouTubeChannelFilterFacetsEntity {
  @Field(() => [YouTubeCategoryFacetEntity])
  categories: YouTubeCategoryFacetEntity[];
}
