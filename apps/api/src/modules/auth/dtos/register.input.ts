import { IsEmail, IsEnum, IsString, Length, Matches } from "class-validator";
import { AuthGqlInputNames } from "@auth/enums/gql-names.enum";
import { FULL_NAME_LIMITS } from "@loopskey/api-contracts/validation";
import { Field, InputType } from "@nestjs/graphql";
import { AuthRegisterRole } from "@auth/enums/register-role.enum";
import { AuthMessageCode } from "@auth/enums/message-code.enum";
import { MinLength } from "class-validator";
import { Transform } from "class-transformer";

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

  @Field(() => String)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim() : value,
  )
  @IsString()
  @Length(FULL_NAME_LIMITS.min, FULL_NAME_LIMITS.max)
  fullName!: string;

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
