import { IsEmail, IsString, Length, MaxLength } from "class-validator";
import { AuthGqlInputNames } from "@auth/enums/gql-names.enum";
import { Field, InputType } from "@nestjs/graphql";

@InputType(AuthGqlInputNames.VERIFY_EMAIL_OTP)
export class VerifyEmailOtpInput {
  @Field(() => String) @IsString() @Length(6, 6) code!: string;
  @Field(() => String) @IsEmail() @MaxLength(255) email!: string;
}
