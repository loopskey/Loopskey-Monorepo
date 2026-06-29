import { IsDateString, IsString, IsUrl, MaxLength, Min } from "class-validator";
import { IsInt, IsNotEmpty, IsOptional } from "class-validator";
import { Field, ID, InputType, Int } from "@nestjs/graphql";
import { PodcastGqlInputNames } from "@podcast/enums/gql-names.enum";

@InputType(PodcastGqlInputNames.CREATE_PODCAST_EPISODE)
export class CreatePodcastEpisodeInput {
  @Field(() => ID)
  @IsString()
  podcastId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  title: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(3000)
  description?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUrl()
  audioUrl?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  durationMinutes?: number;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  episodeNumber: number;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  publishedAt?: Date;
}
