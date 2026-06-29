import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { Field, InputType, Int } from "@nestjs/graphql";
import { PodcastGqlInputNames } from "@podcast/enums/gql-names.enum";

@InputType(PodcastGqlInputNames.PODCAST_PAGINATION)
export class PodcastPaginationInput {
  @Field(() => Int, { nullable: true, defaultValue: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  take?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  cursor?: string;
}
