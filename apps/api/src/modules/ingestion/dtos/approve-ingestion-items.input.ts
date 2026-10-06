import { IsArray, IsOptional, IsString, MaxLength } from "class-validator";
import { ArrayMaxSize, ArrayMinSize, ArrayUnique } from "class-validator";
import { INGESTION_BULK_APPROVE_ID_LIMIT } from "@ingestion/enums/ingestion-review.constant";
import { IngestionGqlInputNames } from "@ingestion/enums/ingestion-gql-names.enum";
import { Field, InputType } from "@nestjs/graphql";

@InputType(IngestionGqlInputNames.APPROVE_INGESTION_ITEMS)
export class ApproveIngestionItemsInput {
  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(INGESTION_BULK_APPROVE_ID_LIMIT)
  @ArrayUnique()
  @IsString({ each: true })
  itemIds?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sourceId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;
}
