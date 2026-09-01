import { AssociationGqlInputNames } from "@association/enums/association-gql-names.enum";
import { AssociationMemberStatus } from "@prisma/client";
import { Field, ID, InputType } from "@nestjs/graphql";
import { IsEnum, IsString } from "class-validator";

@InputType(AssociationGqlInputNames.SET_ASSOCIATION_MEMBER_STATUS)
export class SetAssociationMemberStatusInput {
  @Field(() => ID) @IsString() memberId!: string;

  @Field(() => AssociationMemberStatus)
  @IsEnum(AssociationMemberStatus)
  status!: AssociationMemberStatus;
}
