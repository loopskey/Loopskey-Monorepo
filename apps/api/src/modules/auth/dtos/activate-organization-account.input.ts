import { Matches, MaxLength, MinLength, IsString } from "class-validator";
import { AuthGqlInputNames } from "@auth/enums/gql-names.enum";
import { AuthMessageCode } from "@auth/enums/message-code.enum";
import { Field, InputType } from "@nestjs/graphql";

const MAX_TOKEN_LENGTH = 128;
const MAX_PASSWORD_LENGTH = 128;

@InputType(AuthGqlInputNames.ACTIVATE_ORGANIZATION_ACCOUNT)
export class ActivateOrganizationAccountInput {
  @Field()
  @IsString()
  @MinLength(20)
  @MaxLength(MAX_TOKEN_LENGTH)
  token!: string;

  @Field()
  @IsString()
  @MinLength(8, { message: AuthMessageCode.PASSWORD_STRENGTH_MESSAGE })
  @MaxLength(MAX_PASSWORD_LENGTH, {
    message: AuthMessageCode.PASSWORD_STRENGTH_MESSAGE,
  })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: AuthMessageCode.PASSWORD_STRENGTH_MESSAGE,
  })
  password!: string;

  @Field()
  @IsString()
  @MaxLength(MAX_PASSWORD_LENGTH)
  confirmPassword!: string;
}
