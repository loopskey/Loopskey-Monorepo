import { Field, ID, InputType, PartialType } from "@nestjs/graphql";
import { PodcastGqlInputNames } from "@podcast/enums/gql-names.enum";
import { CreatePodcastInput } from "@podcast/dtos/create-podcast.input";
import { IsString } from "class-validator";

@InputType(PodcastGqlInputNames.UPDATE_PODCAST)
export class UpdatePodcastInput extends PartialType(CreatePodcastInput) {
  @Field(() => ID) @IsString() podcastId: string;
}
