import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { AssociationGqlInputNames } from "@association/enums/association-gql-names.enum";
import { Field, InputType } from "@nestjs/graphql";
import { UserStatus } from "@prisma/client";

const SEARCH_TERM_MAX = 120;

@InputType(AssociationGqlInputNames.ASSOCIATION_ACCOUNT_FILTER)
export class AssociationAccountFilterInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(SEARCH_TERM_MAX)
  search?: string;

  @Field(() => UserStatus, { nullable: true })
  @IsOptional()
  @IsEnum(UserStatus)
  ownerStatus?: UserStatus;
}
