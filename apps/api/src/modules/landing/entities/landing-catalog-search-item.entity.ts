import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import { LandingGqlObjectNames } from "@landing/enums/gql-names";
import { ContentType } from "@prisma/client";

@ObjectType(LandingGqlObjectNames.LANDING_CATALOG_SEARCH_ITEM)
export class LandingCatalogSearchItemEntity {
  @Field() id: string;
  @Field() slug: string;
  @Field() title: string;
  @Field() category: string;
  @Field(() => Float) rating: number;
  @Field(() => ContentType) contentType: ContentType;
  @Field(() => Date, { nullable: true }) startDate?: Date | null;
  @Field(() => String, { nullable: true }) imageUrl: string | null;
  @Field(() => Int, { nullable: true }) videoCount?: number | null;
  @Field(() => Int, { nullable: true }) episodeCount?: number | null;
  @Field(() => Int, { nullable: true }) durationMinutes?: number | null;
}
