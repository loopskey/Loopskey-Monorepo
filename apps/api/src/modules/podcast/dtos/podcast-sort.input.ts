import { PodcastGqlInputNames } from "@podcast/enums/gql-names.enum";
import { PodcastSortDirection } from "@podcast/enums/gql-names.enum";
import { IsEnum, IsOptional } from "class-validator";
import { PodcastSortField } from "@podcast/enums/gql-names.enum";
import { Field, InputType } from "@nestjs/graphql";

@InputType(PodcastGqlInputNames.PODCAST_SORT)
export class PodcastSortInput {
  @Field(() => PodcastSortField, {
    nullable: true,
    defaultValue: PodcastSortField.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(PodcastSortField)
  field?: PodcastSortField = PodcastSortField.CREATED_AT;

  @Field(() => PodcastSortDirection, {
    nullable: true,
    defaultValue: PodcastSortDirection.DESC,
  })
  @IsOptional()
  @IsEnum(PodcastSortDirection)
  direction?: PodcastSortDirection = PodcastSortDirection.DESC;
}
