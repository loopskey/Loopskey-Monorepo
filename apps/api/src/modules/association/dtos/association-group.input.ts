import { IsString, MaxLength, MinLength } from "class-validator";
import { ASSOCIATION_MEMBER_LIMITS } from "@loopskey/api-contracts/validation";
import { AssociationGqlInputNames } from "@association/enums/association-gql-names.enum";
import { IsBoolean, IsOptional } from "class-validator";
import { Field, ID, InputType } from "@nestjs/graphql";

@InputType(AssociationGqlInputNames.CREATE_ASSOCIATION_GROUP)
export class CreateAssociationGroupInput {
  @Field()
  @IsString()
  @MinLength(ASSOCIATION_MEMBER_LIMITS.groupTitleMin)
  @MaxLength(ASSOCIATION_MEMBER_LIMITS.groupTitleMax)
  title!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(ASSOCIATION_MEMBER_LIMITS.groupDescriptionMax)
  description?: string;
}

@InputType(AssociationGqlInputNames.UPDATE_ASSOCIATION_GROUP)
export class UpdateAssociationGroupInput {
  @Field(() => ID) @IsString() groupId!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(ASSOCIATION_MEMBER_LIMITS.groupTitleMin)
  @MaxLength(ASSOCIATION_MEMBER_LIMITS.groupTitleMax)
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(ASSOCIATION_MEMBER_LIMITS.groupDescriptionMax)
  description?: string;
}

@InputType(AssociationGqlInputNames.SET_ASSOCIATION_GROUP_ACTIVE)
export class SetAssociationGroupActiveInput {
  @Field() @IsBoolean() isActive!: boolean;
  @Field(() => ID) @IsString() groupId!: string;
}
