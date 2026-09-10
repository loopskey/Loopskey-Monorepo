import { IsBoolean, IsInt, IsObject, IsOptional } from "class-validator";
import { IsString, Max, MaxLength, Min, MinLength } from "class-validator";
import { IngestionGqlInputNames } from "@ingestion/enums/ingestion-gql-names.enum";
import { Field, InputType, Int } from "@nestjs/graphql";
import { GraphQLJSONObject } from "graphql-type-json";

@InputType(IngestionGqlInputNames.UPDATE_INGESTION_SOURCE)
export class UpdateIngestionSourceInput {
  @Field()
  @IsString()
  sourceId!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name?: string;

  @Field({ nullable: true })
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
