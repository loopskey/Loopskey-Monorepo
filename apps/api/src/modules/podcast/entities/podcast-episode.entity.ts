import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { PodcastGqlObjectNames } from "@podcast/enums/gql-names.enum";

@ObjectType(PodcastGqlObjectNames.PODCAST_EPISODE)
export class PodcastEpisodeEntity {
  @Field() title: string;
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
  @Field() podcastId: string;
  @Field(() => ID) id: string;
  @Field(() => Int) episodeNumber: number;
  @Field(() => Date, { nullable: true }) publishedAt?: Date | null;
  @Field(() => String, { nullable: true }) audioUrl?: string | null;
  @Field(() => String, { nullable: true }) description?: string | null;
  @Field(() => Int, { nullable: true }) durationMinutes?: number | null;
}
