import { IngestionGqlObjectNames } from "@ingestion/enums/ingestion-gql-names.enum";
import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType(IngestionGqlObjectNames.INGESTION_PAGE_INFO)
export class IngestionPageInfoEntity {
  @Field() hasNextPage: boolean;
  @Field(() => String, { nullable: true }) nextCursor?: string | null;
}
