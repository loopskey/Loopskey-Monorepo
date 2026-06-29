import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql";
import { PodcastCategory, PodcastStatus } from "@prisma/client";
import { PodcastGqlObjectNames } from "@podcast/enums/gql-names.enum";

@ObjectType(PodcastGqlObjectNames.PODCAST)
export class PodcastEntity {
  @Field() slug: string;
  @Field() host: string;
  @Field() title: string;
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
  @Field(() => ID) id: string;
  @Field() description: string;
  @Field() isFeatured: boolean;
  @Field(() => Float) rating: number;
  @Field(() => Int) listeners: number;
  @Field(() => Int) ratingCount: number;
  @Field(() => Int) episodeCount: number;
  @Field(() => PodcastStatus) status: PodcastStatus;
  @Field(() => PodcastCategory) category: PodcastCategory;
  @Field(() => Date, { nullable: true }) deletedAt?: Date | null;
  @Field(() => String, { nullable: true }) imageUrl?: string | null;
  @Field(() => String, { nullable: true }) providerId?: string | null;
  @Field(() => Int, { nullable: true }) durationMinutes?: number | null;
}
