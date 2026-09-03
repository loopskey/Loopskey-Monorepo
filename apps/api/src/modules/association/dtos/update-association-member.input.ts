import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { ASSOCIATION_MEMBER_LIMITS } from "@loopskey/api-contracts/validation";
import { AssociationGqlInputNames } from "@association/enums/association-gql-names.enum";
import { Field, ID, InputType } from "@nestjs/graphql";

@InputType(AssociationGqlInputNames.UPDATE_ASSOCIATION_MEMBER)
export class UpdateAssociationMemberInput {
  @Field(() => ID) @IsString() memberId!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(ASSOCIATION_MEMBER_LIMITS.fullNameMin)
  @MaxLength(ASSOCIATION_MEMBER_LIMITS.fullNameMax)
  fullName?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  groupId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(ASSOCIATION_MEMBER_LIMITS.memberNumberMax)
  memberNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(ASSOCIATION_MEMBER_LIMITS.notesMax)
  notes?: string;
}
