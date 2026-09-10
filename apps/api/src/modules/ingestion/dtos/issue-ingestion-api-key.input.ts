import { IsDateString, IsOptional, IsString } from "class-validator";
import { IngestionGqlInputNames } from "@ingestion/enums/ingestion-gql-names.enum";
import { MaxLength, MinLength } from "class-validator";
import { Field, InputType } from "@nestjs/graphql";

@InputType(IngestionGqlInputNames.ISSUE_INGESTION_API_KEY)
export class IssueIngestionApiKeyInput {
  @Field()
  @IsString()
  sourceId!: string;

  @Field()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
