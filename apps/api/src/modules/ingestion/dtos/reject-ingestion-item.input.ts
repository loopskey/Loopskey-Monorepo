import { IsNotEmpty, IsString, MaxLength } from "class-validator";
import { IngestionGqlInputNames } from "@ingestion/enums/ingestion-gql-names.enum";
import { Field, InputType } from "@nestjs/graphql";

@InputType(IngestionGqlInputNames.REJECT_INGESTION_ITEM)
export class RejectIngestionItemInput {
  @Field()
  @IsString()
  itemId!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  reason!: string;
}
