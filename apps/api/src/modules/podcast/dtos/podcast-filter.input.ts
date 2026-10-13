import { IsBoolean, IsEnum, IsOptional, IsString } from "class-validator";
import { PodcastCategory, PodcastStatus } from "@prisma/client";
import { MAX_CATALOG_SEARCH_LENGTH } from "@utils/catalog-pagination.util";
import { PodcastGqlInputNames } from "@podcast/enums/gql-names.enum";
import { Field, InputType } from "@nestjs/graphql";
import { MaxLength } from "class-validator";

@InputType(PodcastGqlInputNames.PODCAST_FILTER)
export class PodcastFilterInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(MAX_CATALOG_SEARCH_LENGTH)
  search?: string;

  @Field(() => PodcastCategory, { nullable: true })
  @IsOptional()
  @IsEnum(PodcastCategory)
  category?: PodcastCategory;

  @Field(() => PodcastStatus, { nullable: true })
  @IsOptional()
  @IsEnum(PodcastStatus)
  status?: PodcastStatus;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  providerId?: string;
}
