import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import { LandingGqlObjectNames } from "@landing/enums/gql-names";

@ObjectType(LandingGqlObjectNames.POPULAR_CATEGORY)
export class PopularCategoryEntity {
  @Field() category: string;
  @Field(() => Int) eventCount: number;
  @Field(() => Int) totalItems: number;
  @Field(() => Int) courseCount: number;
  @Field(() => Int) podcastCount: number;
  @Field(() => Int) youtubeCount: number;
  @Field(() => Float) averageRating: number;
  @Field(() => Float) popularityScore: number;
}
