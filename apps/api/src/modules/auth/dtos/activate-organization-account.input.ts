import { Matches, MinLength, IsString } from "class-validator";
import { AuthGqlInputNames } from "@auth/enums/gql-names.enum";
import { AuthMessageCode } from "@auth/enums/message-code.enum";
import { Field, InputType } from "@nestjs/graphql";

@InputType(AuthGqlInputNames.ACTIVATE_ORGANIZATION_ACCOUNT)
export class ActivateOrganizationAccountInput {
  @Field()
  @IsString()
  @MinLength(20)
  token!: string;

  @Field()
  @IsString()
  @MinLength(8, { message: AuthMessageCode.PASSWORD_STRENGTH_MESSAGE })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: AuthMessageCode.PASSWORD_STRENGTH_MESSAGE,
  })
  password!: string;

  @Field()
  @IsString()
  confirmPassword!: string;
}
