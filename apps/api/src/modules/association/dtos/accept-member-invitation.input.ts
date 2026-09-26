import { IsOptional, Matches, IsString } from "class-validator";
import { AssociationGqlInputNames } from "@association/enums/association-gql-names.enum";
import { MaxLength, MinLength } from "class-validator";
import { Field, InputType } from "@nestjs/graphql";
import { AuthMessageCode } from "@loopskey/api-contracts/error-codes";

const MAX_TOKEN_LENGTH = 128;
const MAX_PASSWORD_LENGTH = 128;

@InputType(AssociationGqlInputNames.ACCEPT_MEMBER_INVITATION)
export class AcceptMemberInvitationInput {
  @Field()
  @IsString()
  @MinLength(20)
  @MaxLength(MAX_TOKEN_LENGTH)
  token!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(8, { message: AuthMessageCode.PASSWORD_STRENGTH_MESSAGE })
  @MaxLength(MAX_PASSWORD_LENGTH, {
    message: AuthMessageCode.PASSWORD_STRENGTH_MESSAGE,
  })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: AuthMessageCode.PASSWORD_STRENGTH_MESSAGE,
  })
  password?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(MAX_PASSWORD_LENGTH)
  confirmPassword?: string;
}
