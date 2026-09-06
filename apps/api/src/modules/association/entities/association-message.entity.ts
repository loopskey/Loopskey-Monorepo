import { AppLanguage, AssociationMessageDeliveryState } from "@prisma/client";
import {
  AssociationComplianceBand,
  AssociationMessageType,
} from "@prisma/client";
import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql";
import { AssociationMemberDistributionEntity } from "@association/entities/association-report.entity";
import { AssociationMessageSkipReason } from "@association/enums/association-attention.enum";
import { AssociationGqlObjectNames } from "@association/enums/association-gql-names.enum";
import { AssociationPageInfoEntity } from "@association/entities/association-page-info.entity";

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_ATTENTION_COUNTS)
export class AssociationAttentionCountsEntity {
  @Field(() => Int) belowThreshold: number;
  @Field(() => Int) newJoiners: number;
  @Field(() => Int) categoryBehind: number;
  @Field(() => Int) expiringCertificates: number;
  @Field(() => Int) readyReports: number;
}

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_ATTENTION_LISTS)
export class AssociationAttentionListsEntity {
  @Field(() => AssociationAttentionCountsEntity)
  counts: AssociationAttentionCountsEntity;

  @Field(() => AssociationMemberDistributionEntity)
  distribution: AssociationMemberDistributionEntity;
}

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_ATTENTION_ROW)
export class AssociationAttentionRowEntity {
  @Field(() => ID) memberId: string;
  @Field(() => String, { nullable: true }) email: string | null;
  @Field(() => String, { nullable: true }) fullName: string | null;
  @Field(() => String, { nullable: true }) memberNumber: string | null;
  @Field(() => ID, { nullable: true }) groupId: string | null;
  @Field(() => String, { nullable: true }) groupTitle: string | null;
  @Field(() => Float, { nullable: true }) percent: number | null;
  @Field(() => Float, { nullable: true }) requiredCredits: number | null;
  @Field(() => Float, { nullable: true }) completedCredits: number | null;
  @Field(() => Date, { nullable: true }) deadline: Date | null;
  @Field(() => String, { nullable: true }) detail: string | null;
  @Field(() => Date, { nullable: true }) detailDate: Date | null;
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

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_MESSAGE_SKIP)
export class AssociationMessageSkipEntity {
  @Field(() => ID) memberId: string;
  @Field(() => String, { nullable: true }) fullName: string | null;
  @Field(() => AssociationMessageSkipReason)
  reason: AssociationMessageSkipReason;
}

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_MESSAGE_PREVIEW)
export class AssociationMessagePreviewEntity {
  @Field(() => AssociationMessageType) messageType: AssociationMessageType;
  @Field(() => String, { nullable: true }) subject: string | null;
  @Field(() => String, { nullable: true }) body: string | null;
  @Field(() => String, { nullable: true }) recipientName: string | null;
  @Field(() => AppLanguage, { nullable: true }) language: AppLanguage | null;
  @Field(() => Int) recipientCount: number;
  @Field(() => Int) skippedCount: number;
  @Field(() => [AssociationMessageSkipEntity])
  skipped: AssociationMessageSkipEntity[];
}

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_MESSAGE_BATCH)
export class AssociationMessageBatchEntity {
  @Field(() => AssociationMessageType) messageType: AssociationMessageType;
  @Field(() => Int) acceptedCount: number;
  @Field(() => Int) skippedCount: number;
  @Field(() => [AssociationMessageSkipEntity])
  skipped: AssociationMessageSkipEntity[];
}

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_MESSAGE_HISTORY_ROW)
export class AssociationMessageHistoryRowEntity {
  @Field(() => ID) id: string;
  @Field(() => ID) memberId: string;
  @Field() createdAt: Date;
  @Field(() => Int) templateVersion: number;
  @Field(() => AppLanguage) language: AppLanguage;
  @Field(() => AssociationMessageType) messageType: AssociationMessageType;
  @Field(() => AssociationMessageDeliveryState)
  state: AssociationMessageDeliveryState;
  @Field(() => Date, { nullable: true }) sentAt: Date | null;
  @Field(() => String, { nullable: true }) email: string | null;
  @Field(() => String, { nullable: true }) fullName: string | null;
  @Field(() => String, { nullable: true }) memberNumber: string | null;
  @Field(() => String, { nullable: true }) skipReason: string | null;
  @Field(() => String, { nullable: true }) failureReason: string | null;
}

@ObjectType(AssociationGqlObjectNames.PAGINATED_ASSOCIATION_MESSAGE_HISTORY)
export class PaginatedAssociationMessageHistoryEntity {
  @Field(() => Int) totalCount: number;
  @Field(() => AssociationPageInfoEntity) pageInfo: AssociationPageInfoEntity;
  @Field(() => [AssociationMessageHistoryRowEntity])
  items: AssociationMessageHistoryRowEntity[];
}
