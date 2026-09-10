import { IngestionBatchMode, IngestionBatchStatus } from "@prisma/client";
import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { IngestionPageInfoEntity } from "@ingestion/entities/ingestion-page-info.entity";
import { IngestionGqlObjectNames } from "@ingestion/enums/ingestion-gql-names.enum";

@ObjectType(IngestionGqlObjectNames.INGESTION_ITEM_REPORT)
export class IngestionItemReportEntity {
  @Field() state: string;
  @Field(() => [String]) unmappedFields: string[];
  @Field(() => ID, { nullable: true }) catalogId: string | null;
  @Field(() => String, { nullable: true }) reason: string | null;
  @Field(() => String, { nullable: true }) externalId: string | null;
}

@ObjectType(IngestionGqlObjectNames.INGESTION_BATCH)
export class IngestionBatchEntity {
  @Field() createdAt: Date;
  @Field() sourceId: string;
  @Field(() => ID) id: string;
  @Field() idempotencyKey: string;
  @Field(() => Int) createdCount: number;
  @Field(() => Int) updatedCount: number;
  @Field(() => Int) acceptedCount: number;
  @Field(() => Int) receivedCount: number;
  @Field(() => Int) rejectedCount: number;
  @Field(() => Int) unchangedCount: number;
  @Field(() => IngestionBatchMode) mode: IngestionBatchMode;
  @Field(() => IngestionBatchStatus) status: IngestionBatchStatus;
  @Field(() => String, { nullable: true }) correlationId: string | null;
}

@ObjectType(IngestionGqlObjectNames.PAGINATED_INGESTION_BATCHES)
export class PaginatedIngestionBatchesEntity {
  @Field(() => Int) totalCount: number;
  @Field(() => [IngestionBatchEntity]) items: IngestionBatchEntity[];
  @Field(() => IngestionPageInfoEntity) pageInfo: IngestionPageInfoEntity;
}

@ObjectType(IngestionGqlObjectNames.INGESTION_BATCH_DETAIL)
export class IngestionBatchDetailEntity extends IngestionBatchEntity {
  @Field(() => [IngestionItemReportEntity]) items: IngestionItemReportEntity[];
}
