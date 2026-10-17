import { IsBoolean, IsEnum, IsOptional, IsString } from "class-validator";
import { IngestionGqlInputNames } from "@ingestion/enums/ingestion-gql-names.enum";
import { IngestionItemState } from "@prisma/client";
import { Field, InputType } from "@nestjs/graphql";
import { MaxLength } from "class-validator";

@InputType(IngestionGqlInputNames.INGESTION_ITEM_FILTER)
export class IngestionItemFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sourceId?: string;

  @Field(() => IngestionItemState, { nullable: true })
  @IsOptional()
  @IsEnum(IngestionItemState)
  state?: IngestionItemState;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  heldForReview?: boolean;
}
