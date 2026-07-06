import { IsString, Matches, MaxLength, MinLength } from "class-validator";
import { AuthGqlInputNames } from "@auth/enums/gql-names.enum";
import { Field, InputType } from "@nestjs/graphql";

const PASSWORD_STRENGTH_MESSAGE =
  "Password must be at least 8 characters and include both letters and numbers.";

@InputType(AuthGqlInputNames.CHANGE_PASSWORD)
export class ChangePasswordInput {
  @Field(() => String)
  @IsString()
  @MaxLength(100)
  currentPassword!: string;

  @Field(() => String)
  @IsString()
  @MinLength(8, { message: PASSWORD_STRENGTH_MESSAGE })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: PASSWORD_STRENGTH_MESSAGE,
  })
  @MaxLength(100)
  newPassword!: string;

  @Field(() => String)
  @IsString()
  @MinLength(8, { message: PASSWORD_STRENGTH_MESSAGE })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: PASSWORD_STRENGTH_MESSAGE,
  })
  @MaxLength(100)
  confirmPassword!: string;
}
