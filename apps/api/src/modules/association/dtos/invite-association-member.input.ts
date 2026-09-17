import { IsEmail, MaxLength, MinLength } from "class-validator";
import { ASSOCIATION_MEMBER_LIMITS } from "@loopskey/api-contracts/validation";
import { AssociationGqlInputNames } from "@association/enums/association-gql-names.enum";
import { ArrayMaxSize, IsArray } from "class-validator";
import { Field, ID, InputType } from "@nestjs/graphql";
import { IsOptional, IsString } from "class-validator";

@InputType(AssociationGqlInputNames.INVITE_ASSOCIATION_MEMBER)
export class InviteAssociationMemberInput {
  @Field()
  @IsEmail()
  @MaxLength(ASSOCIATION_MEMBER_LIMITS.emailMax)
  email!: string;

  @Field()
  @IsString()
  @MinLength(ASSOCIATION_MEMBER_LIMITS.fullNameMin)
  @MaxLength(ASSOCIATION_MEMBER_LIMITS.fullNameMax)
  fullName!: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  groupId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(ASSOCIATION_MEMBER_LIMITS.memberNumberMax)
  memberNumber?: string;

  @Field(() => [ID], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(ASSOCIATION_MEMBER_LIMITS.requirementsPerMemberMax)
  @IsString({ each: true })
  requirementIds?: string[];
}
