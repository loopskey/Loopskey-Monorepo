import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { YouTubeGqlObjectNames } from "@youtube/enums/gql-names.enum";
import { YouTubeVideoStatus } from "@prisma/client";

@ObjectType(YouTubeGqlObjectNames.YOUTUBE_VIDEO)
export class YouTubeVideoEntity {
  @Field() title: string;
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
  @Field() channelId: string;
  @Field(() => ID) id: string;
  @Field(() => Int) likes: number;
  @Field(() => Int) views: number;
  @Field(() => YouTubeVideoStatus) status: YouTubeVideoStatus;
  @Field(() => Date, { nullable: true }) publishedAt?: Date | null;
  @Field(() => String, { nullable: true }) videoUrl?: string | null;
  @Field(() => String, { nullable: true }) description?: string | null;
  @Field(() => String, { nullable: true }) thumbnailUrl?: string | null;
  @Field(() => Int, { nullable: true }) durationMinutes?: number | null;
}
