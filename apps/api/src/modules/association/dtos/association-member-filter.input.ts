import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { AssociationGqlInputNames } from "@association/enums/association-gql-names.enum";
import { AssociationMemberStatus } from "@prisma/client";
import { Field, ID, InputType } from "@nestjs/graphql";

@InputType(AssociationGqlInputNames.ASSOCIATION_MEMBER_FILTER)
export class AssociationMemberFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  groupId?: string;

  @Field(() => AssociationMemberStatus, { nullable: true })
  @IsOptional()
  @IsEnum(AssociationMemberStatus)
  status?: AssociationMemberStatus;
}
