import { CourseStatus, IngestionItemState } from "@prisma/client";
import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { IngestionPageInfoEntity } from "@ingestion/entities/ingestion-page-info.entity";
import { IngestionGqlObjectNames } from "@ingestion/enums/ingestion-gql-names.enum";

@ObjectType(IngestionGqlObjectNames.INGESTION_ITEM_CATALOG)
export class IngestionItemCatalogEntity {
  @Field() title: string;
  @Field(() => ID) id: string;
  @Field(() => CourseStatus) status: CourseStatus;
  @Field(() => String, { nullable: true }) slug: string | null;
  @Field(() => String, { nullable: true }) imageUrl: string | null;
}

@ObjectType(IngestionGqlObjectNames.INGESTION_ITEM)
export class IngestionItemEntity {
  @Field() sourceId: string;
  @Field() lastSeenAt: Date;
  @Field() firstSeenAt: Date;
  @Field(() => ID) id: string;
  @Field() externalId: string;
  @Field(() => [String]) unmappedFields: string[];
  @Field(() => IngestionItemState) state: IngestionItemState;
  @Field(() => Date, { nullable: true }) reviewedAt: Date | null;
  @Field(() => String, { nullable: true }) batchId: string | null;
  @Field(() => String, { nullable: true }) catalogId: string | null;
  @Field(() => String, { nullable: true }) sourceSlug?: string | null;
  @Field(() => String, { nullable: true }) canonicalUrl: string | null;
  @Field(() => String, { nullable: true }) reviewedById: string | null;
  @Field(() => String, { nullable: true }) reviewedByName: string | null;
  @Field(() => String, { nullable: true }) rejectionReason: string | null;
  @Field(() => String, { nullable: true }) imageCandidateUrl: string | null;
  @Field(() => IngestionItemCatalogEntity, { nullable: true })
  catalog: IngestionItemCatalogEntity | null;
}

@ObjectType(IngestionGqlObjectNames.PAGINATED_INGESTION_ITEMS)
export class PaginatedIngestionItemsEntity {
  @Field(() => Int) totalCount: number;
  @Field(() => [IngestionItemEntity]) items: IngestionItemEntity[];
  @Field(() => IngestionPageInfoEntity) pageInfo: IngestionPageInfoEntity;
}
