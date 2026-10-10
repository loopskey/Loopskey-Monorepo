import { IsEnum, IsInt, IsOptional, IsString, Matches } from "class-validator";
import { Field, InputType, Int } from "@nestjs/graphql";
import { DiscoveryGqlInputNames } from "@discovery/enums/gql-names";
import { PUBLIC_URL_MAX_CURSOR_LENGTH } from "@utils/public-url-enumeration.util";
import { PUBLIC_URL_MAX_TAKE } from "@utils/public-url-enumeration.util";
import { ContentType } from "@prisma/client";
import { MaxLength } from "class-validator";
import { Max, Min } from "class-validator";

const CURSOR_PATTERN = /^[A-Za-z0-9_-]+$/;

@InputType(DiscoveryGqlInputNames.PUBLIC_URL_PAGE)
export class PublicUrlPageInput {
  @Field(() => ContentType)
  @IsEnum(ContentType)
  kind!: ContentType;

  @Field(() => String)
  @IsString()
  @MaxLength(PUBLIC_URL_MAX_CURSOR_LENGTH)
  @Matches(CURSOR_PATTERN)
  startCursor!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(PUBLIC_URL_MAX_CURSOR_LENGTH)
  @Matches(CURSOR_PATTERN)
  endCursor?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(PUBLIC_URL_MAX_CURSOR_LENGTH)
  @Matches(CURSOR_PATTERN)
  after?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(PUBLIC_URL_MAX_TAKE)
  take?: number;
}
