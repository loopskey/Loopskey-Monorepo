import { IsBoolean, IsEnum, IsOptional, IsString } from "class-validator";
import { PodcastCategory, PodcastStatus } from "@prisma/client";
import { PodcastGqlInputNames } from "@podcast/enums/gql-names.enum";
import { Field, InputType } from "@nestjs/graphql";

@InputType(PodcastGqlInputNames.PODCAST_FILTER)
export class PodcastFilterInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
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
