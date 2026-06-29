import { IsEmail, IsString, Length, MaxLength } from "class-validator";
import { AuthGqlInputNames } from "@auth/enums/gql-names.enum";
import { Field, InputType } from "@nestjs/graphql";
import { MinLength } from "class-validator";

@InputType(AuthGqlInputNames.RESET_PASSWORD)
export class ResetPasswordInput {
  @Field(() => String) @IsString() @Length(6, 6) code!: string;
  @Field(() => String) @IsEmail() @MaxLength(255) email!: string;
  @Field(() => String) @IsString() @MinLength(8) newPassword!: string;
  @Field(() => String) @IsString() @MinLength(8) confirmPassword!: string;
}
