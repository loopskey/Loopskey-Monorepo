import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { IngestionGqlInputNames } from "@ingestion/enums/ingestion-gql-names.enum";
import { Field, InputType, Int } from "@nestjs/graphql";

@InputType(IngestionGqlInputNames.INGESTION_PAGINATION)
export class IngestionPaginationInput {
  @Field(() => Int, { nullable: true, defaultValue: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  take?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  cursor?: string;
}
