import { ASSOCIATION_REQUIREMENT_LIMITS as LIMITS } from "@loopskey/api-contracts/validation";
import { ArrayMaxSize, IsArray, IsBoolean } from "class-validator";
import { AssociationGqlInputNames } from "@association/enums/association-gql-names.enum";
import { Field, ID, InputType } from "@nestjs/graphql";
import { IsOptional, IsString } from "class-validator";
import { MaxLength, MinLength } from "class-validator";

@InputType(AssociationGqlInputNames.ASSOCIATION_COMPLIANCE_FILTER)
export class AssociationComplianceFilterInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  groupId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  requirementId?: string;

  @Field(() => [ID], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(LIMITS.specificMembersMax)
  @IsString({ each: true })
  memberIds?: string[];
}

@InputType(AssociationGqlInputNames.REVIEW_ASSOCIATION_LEARNING_ACTIVITY)
export class ReviewAssociationLearningActivityInput {
  @Field(() => ID) @IsString() activityId!: string;

  @Field() @IsBoolean() approve!: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(LIMITS.descriptionMax)
  reason?: string;
}
