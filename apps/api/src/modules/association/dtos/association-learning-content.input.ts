import { ASSOCIATION_REQUIREMENT_LIMITS as LIMITS } from "@loopskey/api-contracts/validation";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { AssociationLearningContentStatus } from "@prisma/client";
import { Field, Float, ID, InputType, Int } from "@nestjs/graphql";
import { IsUrl, Max, MaxLength, Min } from "class-validator";
import { AssociationGqlInputNames } from "@association/enums/association-gql-names.enum";
import { ContentType, PDUCategory } from "@prisma/client";
import { AssociationAudienceKind } from "@prisma/client";

const TITLE_MAX = 200;
const PROVIDER_MAX = 200;
const URL_MAX = 2000;
const SEARCH_TAKE_DEFAULT = 20;
const SEARCH_TAKE_MAX = 50;

@InputType(AssociationGqlInputNames.ASSOCIATION_LEARNING_CONTENT_FILTER)
export class AssociationLearningContentFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(TITLE_MAX)
  search?: string;

  @Field(() => PDUCategory, { nullable: true })
  @IsOptional()
  @IsEnum(PDUCategory)
  category?: PDUCategory;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  requirementId?: string;

  @Field(() => AssociationLearningContentStatus, { nullable: true })
  @IsOptional()
  @IsEnum(AssociationLearningContentStatus)
  status?: AssociationLearningContentStatus;

  @Field(() => ContentType, { nullable: true })
  @IsOptional()
  @IsEnum(ContentType)
  contentType?: ContentType;

  @Field({ nullable: true })
  @IsOptional()
  isExternal?: boolean;
}

@InputType(AssociationGqlInputNames.ASSOCIATION_CATALOG_SEARCH)
export class AssociationCatalogSearchInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(TITLE_MAX)
  search?: string;

  @Field(() => ContentType, { nullable: true })
  @IsOptional()
  @IsEnum(ContentType)
  contentType?: ContentType;

  @Field(() => Int, { nullable: true, defaultValue: SEARCH_TAKE_DEFAULT })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(SEARCH_TAKE_MAX)
  take?: number;
}

@InputType(AssociationGqlInputNames.CREATE_ASSOCIATION_LEARNING_CONTENT)
export class CreateAssociationLearningContentInput {
  @Field(() => PDUCategory)
  @IsEnum(PDUCategory)
  category!: PDUCategory;

  @Field(() => ContentType, { nullable: true })
  @IsOptional()
  @IsEnum(ContentType)
  contentType?: ContentType;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  contentId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(TITLE_MAX)
  externalTitle?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(PROVIDER_MAX)
  externalProvider?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(URL_MAX)
  externalUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(LIMITS.descriptionMax)
  description?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(LIMITS.creditsMax)
  indicativeCredits?: number;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  requirementId?: string;
}

@InputType(AssociationGqlInputNames.UPDATE_ASSOCIATION_LEARNING_CONTENT)
export class UpdateAssociationLearningContentInput extends CreateAssociationLearningContentInput {
  @Field(() => ID) @IsString() learningContentId!: string;
}

@InputType(AssociationGqlInputNames.ASSOCIATION_LEARNING_CONTENT_ID)
export class AssociationLearningContentIdInput {
  @Field(() => ID) @IsString() learningContentId!: string;
}

@InputType(AssociationGqlInputNames.PUBLISH_ASSOCIATION_LEARNING_CONTENT)
export class PublishAssociationLearningContentInput extends AssociationLearningContentIdInput {
  @Field(() => AssociationAudienceKind)
  @IsEnum(AssociationAudienceKind)
  audienceKind!: AssociationAudienceKind;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  groupId?: string;
}
