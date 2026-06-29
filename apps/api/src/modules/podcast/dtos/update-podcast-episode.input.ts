import { Field, ID, InputType, PartialType } from "@nestjs/graphql";
import { CreatePodcastEpisodeInput } from "@podcast/dtos/create-podcast-episode.input";
import { PodcastGqlInputNames } from "@podcast/enums/gql-names.enum";
import { IsString } from "class-validator";

@InputType(PodcastGqlInputNames.UPDATE_PODCAST_EPISODE)
export class UpdatePodcastEpisodeInput extends PartialType(
  CreatePodcastEpisodeInput,
) {
  @Field(() => ID) @IsString() episodeId: string;
}
