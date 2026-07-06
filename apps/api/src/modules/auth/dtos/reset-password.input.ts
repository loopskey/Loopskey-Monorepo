import { Matches, MaxLength, MinLength } from "class-validator";
import { IsEmail, IsString, Length } from "class-validator";
import { AuthGqlInputNames } from "@auth/enums/gql-names.enum";
import { AuthMessageCode } from "@auth/enums/message-code.enum";
import { Field, InputType } from "@nestjs/graphql";

@InputType(AuthGqlInputNames.RESET_PASSWORD)
export class ResetPasswordInput {
  @Field(() => String) @IsString() @Length(6, 6) code!: string;
  @Field(() => String) @IsEmail() @MaxLength(255) email!: string;

  @Field(() => String)
  @IsString()
  @MinLength(8, { message: AuthMessageCode.PASSWORD_STRENGTH_MESSAGE })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: AuthMessageCode.PASSWORD_STRENGTH_MESSAGE,
  })
  newPassword!: string;

  @Field(() => String)
  @IsString()
  @MinLength(8, { message: AuthMessageCode.PASSWORD_STRENGTH_MESSAGE })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: AuthMessageCode.PASSWORD_STRENGTH_MESSAGE,
  })
  confirmPassword!: string;
}
