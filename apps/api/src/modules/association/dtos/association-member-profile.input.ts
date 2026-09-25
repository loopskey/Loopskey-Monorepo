import { ArrayMaxSize, IsArray, IsEnum } from "class-validator";
import { AssociationAttributionState } from "@prisma/client";
import { ASSOCIATION_MEMBER_LIMITS } from "@loopskey/api-contracts/validation";
import { AssociationGqlInputNames } from "@association/enums/association-gql-names.enum";
import { Field, ID, InputType } from "@nestjs/graphql";
import { IsOptional, IsString } from "class-validator";

@InputType(AssociationGqlInputNames.ASSOCIATION_MEMBER_ACTIVITY_FILTER)
export class AssociationMemberActivityFilterInput {
  @Field(() => AssociationAttributionState, { nullable: true })
  @IsOptional()
  @IsEnum(AssociationAttributionState)
  state?: AssociationAttributionState;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  requirementId?: string;
}

@InputType(AssociationGqlInputNames.SET_ASSOCIATION_MEMBER_REQUIREMENTS)
export class SetAssociationMemberRequirementsInput {
  @Field(() => ID) @IsString() memberId!: string;

  @Field(() => [ID])
  @IsArray()
  @ArrayMaxSize(ASSOCIATION_MEMBER_LIMITS.requirementsPerMemberMax)
  @IsString({ each: true })
  requirementIds!: string[];
}
