import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { PUBLIC_URL_MAX_CURSOR_LENGTH } from "@utils/public-url-enumeration.util";
import { PUBLIC_URL_MAX_TAKE } from "@utils/public-url-enumeration.util";
import { AppLanguage } from "@prisma/client";

import type { PublicUrlShardSet } from "@utils/public-url-enumeration.util";

import * as V from "class-validator";

const CURSOR_PATTERN = /^[A-Za-z0-9_-]+$/;

export enum EditorialUrlGqlNames {
  ITEM = "EditorialUrl",
  PAGE = "EditorialUrlPage",
  SHARD = "EditorialUrlShard",
  SHARD_SET = "EditorialUrlShardSet",
  PAGE_INPUT = "EditorialUrlPageInput",
}

@ObjectType(EditorialUrlGqlNames.SHARD)
export class EditorialUrlShardEntity {
  @Field() startCursor: string;
  @Field(() => Int) index: number;
  @Field() lastPublicChangeAt: Date;
  @Field(() => Int) urlCount: number;
  @Field(() => String, { nullable: true }) endCursor: string | null;
}

@ObjectType(EditorialUrlGqlNames.SHARD_SET)
export class EditorialUrlShardSetEntity {
  @Field(() => Int) shardSize: number;
  @Field() isComplete: boolean;
  @Field(() => [EditorialUrlShardEntity]) shards: EditorialUrlShardEntity[];
}

@ObjectType(EditorialUrlGqlNames.ITEM)
export class EditorialUrlEntity {
  @Field() slug: string;
  @Field() publicChangeAt: Date;
  @Field(() => [AppLanguage]) availableLocales: AppLanguage[];
}

@ObjectType(EditorialUrlGqlNames.PAGE)
export class EditorialUrlPageEntity {
  @Field() hasNextPage: boolean;
  @Field(() => [EditorialUrlEntity]) items: EditorialUrlEntity[];
  @Field(() => String, { nullable: true }) nextCursor: string | null;
}

@InputType(EditorialUrlGqlNames.PAGE_INPUT)
export class EditorialUrlPageInput {
  @Field(() => String)
  @V.IsString()
  @V.MaxLength(PUBLIC_URL_MAX_CURSOR_LENGTH)
  @V.Matches(CURSOR_PATTERN)
  startCursor!: string;

  @Field(() => String, { nullable: true })
  @V.IsOptional()
  @V.IsString()
  @V.MaxLength(PUBLIC_URL_MAX_CURSOR_LENGTH)
  @V.Matches(CURSOR_PATTERN)
  endCursor?: string;

  @Field(() => String, { nullable: true })
  @V.IsOptional()
  @V.IsString()
  @V.MaxLength(PUBLIC_URL_MAX_CURSOR_LENGTH)
  @V.Matches(CURSOR_PATTERN)
  after?: string;

  @Field(() => Int, { nullable: true })
  @V.IsOptional()
  @V.IsInt()
  @V.Min(1)
  @V.Max(PUBLIC_URL_MAX_TAKE)
  take?: number;
}

export const toEditorialShardSet = (
  set: PublicUrlShardSet,
): EditorialUrlShardSetEntity => ({
  shardSize: set.shardSize,
  isComplete: !set.truncated,
  shards: set.shards,
});
