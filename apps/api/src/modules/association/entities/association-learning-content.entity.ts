import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql";
import { AssociationLearningContentStatus } from "@prisma/client";
import { AssociationGqlObjectNames } from "@association/enums/association-gql-names.enum";
import { AssociationPageInfoEntity } from "@association/entities/association-page-info.entity";
import { ContentType, PDUCategory } from "@prisma/client";
import { AssociationAudienceKind } from "@prisma/client";

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_CATALOG_ITEM)
export class AssociationCatalogItemEntity {
  @Field() title: string;
  @Field() isAvailable: boolean;
  @Field(() => ID) contentId: string;
  @Field(() => ContentType) contentType: ContentType;
  @Field(() => String, { nullable: true }) provider: string | null;
  @Field(() => String, { nullable: true }) imageUrl: string | null;
}

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_LEARNING_ENGAGEMENT)
export class AssociationLearningEngagementEntity {
  @Field(() => Float) credits: number;
  @Field(() => Int) memberCount: number;
}

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_LEARNING_CONTENT)
export class AssociationLearningContentEntity {
  @Field() title: string;
  @Field() updatedAt: Date;
  @Field() createdAt: Date;
  @Field(() => ID) id: string;
  @Field() isAvailable: boolean;
  @Field() isExternal: boolean;
  @Field(() => PDUCategory) category: PDUCategory;
  @Field(() => AssociationAudienceKind) audienceKind: AssociationAudienceKind;
  @Field(() => AssociationLearningContentStatus)
  status: AssociationLearningContentStatus;
  @Field(() => ContentType, { nullable: true }) contentType: ContentType | null;
  @Field(() => ID, { nullable: true }) contentId: string | null;
  @Field(() => String, { nullable: true }) provider: string | null;
  @Field(() => String, { nullable: true }) imageUrl: string | null;
  @Field(() => String, { nullable: true }) externalUrl: string | null;
  @Field(() => String, { nullable: true }) description: string | null;
  @Field(() => Float, { nullable: true }) indicativeCredits: number | null;
  @Field(() => ID, { nullable: true }) requirementId: string | null;
  @Field(() => String, { nullable: true }) requirementName: string | null;
  @Field(() => ID, { nullable: true }) groupId: string | null;
  @Field(() => String, { nullable: true }) groupTitle: string | null;
  @Field(() => Date, { nullable: true }) publishedAt: Date | null;
  @Field(() => Date, { nullable: true }) withdrawnAt: Date | null;
  @Field(() => AssociationLearningEngagementEntity, { nullable: true })
  engagement: AssociationLearningEngagementEntity | null;
}

@ObjectType(AssociationGqlObjectNames.PAGINATED_ASSOCIATION_LEARNING_CONTENTS)
export class PaginatedAssociationLearningContentsEntity {
  @Field(() => Int) totalCount: number;
  @Field(() => AssociationPageInfoEntity) pageInfo: AssociationPageInfoEntity;
  @Field(() => [AssociationLearningContentEntity])
  items: AssociationLearningContentEntity[];
}
