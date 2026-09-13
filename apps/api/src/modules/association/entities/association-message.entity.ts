import { AppLanguage, AssociationMessageDeliveryState } from "@prisma/client";
import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql";
import { AssociationMessageSkipReason } from "@association/enums/association-attention.enum";
import { AssociationGqlObjectNames } from "@association/enums/association-gql-names.enum";
import { AssociationComplianceBand } from "@prisma/client";
import { AssociationPageInfoEntity } from "@association/entities/association-page-info.entity";
import { AssociationMessageType } from "@prisma/client";

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_ATTENTION_COUNTS)
export class AssociationAttentionCountsEntity {
  @Field(() => Int) newJoiners: number;
  @Field(() => Int) readyReports: number;
  @Field(() => Int) belowThreshold: number;
  @Field(() => Int) categoryBehind: number;
  @Field(() => Int) expiringCertificates: number;
}

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_ATTENTION_LISTS)
export class AssociationAttentionListsEntity {
  @Field(() => AssociationAttentionCountsEntity)
  counts: AssociationAttentionCountsEntity;
}

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_ATTENTION_ROW)
export class AssociationAttentionRowEntity {
  @Field(() => ID) memberId: string;
  @Field(() => ID, { nullable: true }) groupId: string | null;
  @Field(() => Date, { nullable: true }) deadline: Date | null;
  @Field(() => String, { nullable: true }) email: string | null;
  @Field(() => Float, { nullable: true }) percent: number | null;
  @Field(() => String, { nullable: true }) detail: string | null;
  @Field(() => Date, { nullable: true }) detailDate: Date | null;
  @Field(() => String, { nullable: true }) fullName: string | null;
  @Field(() => String, { nullable: true }) groupTitle: string | null;
  @Field(() => String, { nullable: true }) memberNumber: string | null;
  @Field(() => Float, { nullable: true }) requiredCredits: number | null;
  @Field(() => Float, { nullable: true }) completedCredits: number | null;
  @Field(() => AssociationComplianceBand, { nullable: true })
  band: AssociationComplianceBand | null;
}

@ObjectType(AssociationGqlObjectNames.PAGINATED_ASSOCIATION_ATTENTION_ROWS)
export class PaginatedAssociationAttentionRowsEntity {
  @Field(() => Int) totalCount: number;
  @Field(() => AssociationPageInfoEntity) pageInfo: AssociationPageInfoEntity;
  @Field(() => [AssociationAttentionRowEntity])
  items: AssociationAttentionRowEntity[];
}

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_CATEGORY_ATTENTION_GROUP)
export class AssociationCategoryAttentionGroupEntity {
  @Field() categoryName: string;
  @Field() requirementName: string;
  @Field(() => ID) categoryId: string;
  @Field(() => ID) requirementId: string;
  @Field(() => Int) affectedCount: number;
  @Field(() => Date, { nullable: true }) deadline: Date | null;
  @Field(() => [AssociationAttentionRowEntity])
  members: AssociationAttentionRowEntity[];
}

@ObjectType(
  AssociationGqlObjectNames.PAGINATED_ASSOCIATION_CATEGORY_ATTENTION_GROUPS,
)
export class PaginatedAssociationCategoryAttentionGroupsEntity {
  @Field(() => Int) totalCount: number;
  @Field(() => AssociationPageInfoEntity) pageInfo: AssociationPageInfoEntity;
  @Field(() => [AssociationCategoryAttentionGroupEntity])
  items: AssociationCategoryAttentionGroupEntity[];
}

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_MESSAGE_SKIP)
export class AssociationMessageSkipEntity {
  @Field(() => ID) memberId: string;
  @Field(() => String, { nullable: true }) fullName: string | null;
  @Field(() => AssociationMessageSkipReason)
  reason: AssociationMessageSkipReason;
}

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_MESSAGE_PREVIEW)
export class AssociationMessagePreviewEntity {
  @Field(() => Int) skippedCount: number;
  @Field(() => Int) recipientCount: number;
  @Field(() => String, { nullable: true }) body: string | null;
  @Field(() => String, { nullable: true }) subject: string | null;
  @Field(() => String, { nullable: true }) recipientName: string | null;
  @Field(() => AssociationMessageType) messageType: AssociationMessageType;
  @Field(() => AppLanguage, { nullable: true }) language: AppLanguage | null;
  @Field(() => [AssociationMessageSkipEntity])
  skipped: AssociationMessageSkipEntity[];
}

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_MESSAGE_BATCH)
export class AssociationMessageBatchEntity {
  @Field(() => Int) skippedCount: number;
  @Field(() => Int) acceptedCount: number;
  @Field(() => AssociationMessageType) messageType: AssociationMessageType;
  @Field(() => [AssociationMessageSkipEntity])
  skipped: AssociationMessageSkipEntity[];
}

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_MESSAGE_HISTORY_ROW)
export class AssociationMessageHistoryRowEntity {
  @Field() createdAt: Date;
  @Field(() => ID) id: string;
  @Field(() => ID) memberId: string;
  @Field(() => Int) templateVersion: number;
  @Field(() => AppLanguage) language: AppLanguage;
  @Field(() => Date, { nullable: true }) sentAt: Date | null;
  @Field(() => String, { nullable: true }) email: string | null;
  @Field(() => String, { nullable: true }) fullName: string | null;
  @Field(() => String, { nullable: true }) skipReason: string | null;
  @Field(() => String, { nullable: true }) memberNumber: string | null;
  @Field(() => String, { nullable: true }) failureReason: string | null;
  @Field(() => AssociationMessageType) messageType: AssociationMessageType;
  @Field(() => AssociationMessageDeliveryState)
  state: AssociationMessageDeliveryState;
}

@ObjectType(AssociationGqlObjectNames.PAGINATED_ASSOCIATION_MESSAGE_HISTORY)
export class PaginatedAssociationMessageHistoryEntity {
  @Field(() => Int) totalCount: number;
  @Field(() => AssociationPageInfoEntity) pageInfo: AssociationPageInfoEntity;
  @Field(() => [AssociationMessageHistoryRowEntity])
  items: AssociationMessageHistoryRowEntity[];
}
