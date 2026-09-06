import { ArrayMaxSize, IsArray, IsEnum } from "class-validator";
import { AssociationAttributionState } from "@prisma/client";
import { AssociationGqlInputNames } from "@association/enums/association-gql-names.enum";
import { Field, ID, InputType } from "@nestjs/graphql";
import { IsOptional, IsString } from "class-validator";

const REQUIREMENTS_PER_MEMBER_MAX = 200;

@InputType(AssociationGqlInputNames.ASSOCIATION_MEMBER_ACTIVITY_FILTER)
export class AssociationMemberActivityFilterInput {
  @Field(() => AssociationAttributionState, { nullable: true })
  @IsOptional()
  @IsEnum(AssociationAttributionState)
  state?: AssociationAttributionState;
}

@InputType(AssociationGqlInputNames.SET_ASSOCIATION_MEMBER_REQUIREMENTS)
export class SetAssociationMemberRequirementsInput {
  @Field(() => ID) @IsString() memberId!: string;

  @Field(() => [ID])
  @IsArray()
  @ArrayMaxSize(REQUIREMENTS_PER_MEMBER_MAX)
  @IsString({ each: true })
  requirementIds!: string[];
}
