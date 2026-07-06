import { IsEmail, IsEnum, IsString, Matches, MinLength } from "class-validator";
import { AuthGqlInputNames } from "@auth/enums/gql-names.enum";
import { Field, InputType } from "@nestjs/graphql";
import { AuthRegisterRole } from "@auth/enums/register-role.enum";
import { AuthMessageCode } from "@auth/enums/message-code.enum";

@InputType(AuthGqlInputNames.REGISTER)
export class RegisterInput {
  @Field(() => String) @IsEmail() email!: string;
  @Field(() => String)
  @IsString()
  @MinLength(8, { message: AuthMessageCode.PASSWORD_STRENGTH_MESSAGE })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: AuthMessageCode.PASSWORD_STRENGTH_MESSAGE,
  })
  password!: string;

  @Field(() => String) @IsString() fullName!: string;

  @Field(() => String)
  @IsString()
  @MinLength(8, { message: AuthMessageCode.PASSWORD_STRENGTH_MESSAGE })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: AuthMessageCode.PASSWORD_STRENGTH_MESSAGE,
  })
  confirmPassword!: string;

  @Field(() => AuthRegisterRole)
  @IsEnum(AuthRegisterRole)
  role!: AuthRegisterRole;
}
