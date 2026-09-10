import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
} from "class-validator";
import {
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";
import { IngestionGqlInputNames } from "@ingestion/enums/ingestion-gql-names.enum";
import { IngestionContentKind } from "@prisma/client";
import { Field, InputType, Int } from "@nestjs/graphql";
import { GraphQLJSONObject } from "graphql-type-json";

const SLUG_PATTERN = /^[a-z][a-z0-9-]*$/;

@InputType(IngestionGqlInputNames.CREATE_INGESTION_SOURCE)
export class CreateIngestionSourceInput {
  @Field()
  @IsString()
  @MinLength(2)
  @MaxLength(64)
  @Matches(SLUG_PATTERN, {
    message: "slug must be lowercase letters, digits and hyphens only.",
  })
  slug!: string;

  @Field()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name!: string;

  @Field(() => IngestionContentKind)
  @IsEnum(IngestionContentKind)
  kind!: IngestionContentKind;

  @Field({ defaultValue: false })
  @IsOptional()
  @IsBoolean()
  autoPublish?: boolean;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3650)
  stalenessWindowDays?: number;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  @IsObject()
  fieldMap?: Record<string, unknown>;
}
