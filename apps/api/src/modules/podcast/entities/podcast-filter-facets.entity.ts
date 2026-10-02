import { Field, Int, ObjectType } from "@nestjs/graphql";
import { PodcastGqlObjectNames } from "@podcast/enums/gql-names.enum";
import { PodcastCategory } from "@prisma/client";

@ObjectType(PodcastGqlObjectNames.PODCAST_CATEGORY_FACET)
export class PodcastCategoryFacetEntity {
  @Field(() => PodcastCategory) value: PodcastCategory;
  @Field(() => Int) count: number;
}

@ObjectType(PodcastGqlObjectNames.PODCAST_FILTER_FACETS)
export class PodcastFilterFacetsEntity {
  @Field(() => [PodcastCategoryFacetEntity])
  categories: PodcastCategoryFacetEntity[];
}
