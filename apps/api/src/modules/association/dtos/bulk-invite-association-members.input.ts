import { IsString, MaxLength, ValidateNested } from "class-validator";
import { ArrayMaxSize, ArrayMinSize } from "class-validator";
import { ASSOCIATION_MEMBER_LIMITS } from "@loopskey/api-contracts/validation";
import { AssociationGqlInputNames } from "@association/enums/association-gql-names.enum";
import { Field, ID, InputType } from "@nestjs/graphql";
import { IsArray, IsOptional } from "class-validator";
import { Type } from "class-transformer";

@InputType(AssociationGqlInputNames.BULK_INVITE_ASSOCIATION_MEMBER_ROW)
export class BulkInviteAssociationMemberRowInput {
  @Field()
  @IsString()
  @MaxLength(ASSOCIATION_MEMBER_LIMITS.emailMax)
  email!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(ASSOCIATION_MEMBER_LIMITS.fullNameMax)
  firstName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(ASSOCIATION_MEMBER_LIMITS.fullNameMax)
  lastName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(ASSOCIATION_MEMBER_LIMITS.memberNumberMax)
  memberNumber?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  groupId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(ASSOCIATION_MEMBER_LIMITS.groupTitleMax)
  groupTitle?: string;
}

@InputType(AssociationGqlInputNames.BULK_INVITE_ASSOCIATION_MEMBERS)
export class BulkInviteAssociationMembersInput {
  @Field(() => [BulkInviteAssociationMemberRowInput])
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(ASSOCIATION_MEMBER_LIMITS.bulkRowsMax)
  @ValidateNested({ each: true })
  @Type(() => BulkInviteAssociationMemberRowInput)
  rows!: BulkInviteAssociationMemberRowInput[];
}
