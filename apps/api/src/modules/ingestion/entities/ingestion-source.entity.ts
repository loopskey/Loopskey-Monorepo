import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { IngestionPageInfoEntity } from "@ingestion/entities/ingestion-page-info.entity";
import { IngestionGqlObjectNames } from "@ingestion/enums/ingestion-gql-names.enum";
import { IngestionContentKind } from "@prisma/client";
import { GraphQLJSONObject } from "graphql-type-json";

@ObjectType(IngestionGqlObjectNames.INGESTION_SOURCE)
export class IngestionSourceEntity {
  @Field() slug: string;
  @Field() name: string;
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
  @Field() isActive: boolean;
  @Field(() => ID) id: string;
  @Field() autoPublish: boolean;
  @Field(() => IngestionContentKind) kind: IngestionContentKind;
  @Field(() => GraphQLJSONObject) fieldMap: Record<string, unknown>;
  @Field(() => Int, { nullable: true }) stalenessWindowDays?: number | null;
}

@ObjectType(IngestionGqlObjectNames.PAGINATED_INGESTION_SOURCES)
export class PaginatedIngestionSourcesEntity {
  @Field(() => Int) totalCount: number;
  @Field(() => [IngestionSourceEntity]) items: IngestionSourceEntity[];
  @Field(() => IngestionPageInfoEntity) pageInfo: IngestionPageInfoEntity;
}
