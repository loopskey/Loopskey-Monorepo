import { YouTubeCategory, YouTubeChannelStatus } from "@prisma/client";
import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql";
import { YouTubeGqlObjectNames } from "@youtube/enums/gql-names.enum";

@ObjectType(YouTubeGqlObjectNames.YOUTUBE_CHANNEL)
export class YouTubeChannelEntity {
  @Field() slug: string;
  @Field() title: string;
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
  @Field(() => ID) id: string;
  @Field() isFeatured: boolean;
  @Field(() => Int) views: number;
  @Field(() => Float) rating: number;
  @Field(() => Int) videoCount: number;
  @Field(() => Int) subscribers: number;
  @Field(() => Int) ratingCount: number;
  @Field(() => YouTubeCategory) category: YouTubeCategory;
  @Field(() => Date, { nullable: true }) deletedAt?: Date | null;
  @Field(() => YouTubeChannelStatus) status: YouTubeChannelStatus;
  @Field(() => String, { nullable: true }) provider?: string | null;
  @Field(() => String, { nullable: true }) imageUrl?: string | null;
  @Field(() => String, { nullable: true }) channelUrl?: string | null;
  @Field(() => String, { nullable: true }) providerId?: string | null;
  @Field(() => String, { nullable: true }) description?: string | null;
}
