import { IsEmail, MaxLength } from "class-validator";
import { AuthGqlInputNames } from "@auth/enums/gql-names.enum";
import { Field, InputType } from "@nestjs/graphql";

@InputType(AuthGqlInputNames.RESEND_EMAIL_OTP)
export class ResendEmailOtpInput {
  @Field(() => String) @IsEmail() @MaxLength(255) email!: string;
}
