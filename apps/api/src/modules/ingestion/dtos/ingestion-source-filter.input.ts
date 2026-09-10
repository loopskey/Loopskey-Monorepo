import { IsBoolean, IsEnum, IsOptional } from "class-validator";
import { IsString, MaxLength } from "class-validator";
import { IngestionGqlInputNames } from "@ingestion/enums/ingestion-gql-names.enum";
import { IngestionContentKind } from "@prisma/client";
import { Field, InputType } from "@nestjs/graphql";

@InputType(IngestionGqlInputNames.INGESTION_SOURCE_FILTER)
export class IngestionSourceFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;

  @Field(() => IngestionContentKind, { nullable: true })
  @IsOptional()
  @IsEnum(IngestionContentKind)
  kind?: IngestionContentKind;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
