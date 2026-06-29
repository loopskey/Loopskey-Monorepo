import { IsEmail, IsString, Length } from "class-validator";
import { AuthGqlInputNames } from "@auth/enums/gql-names.enum";
import { Field, InputType } from "@nestjs/graphql";

@InputType(AuthGqlInputNames.VERIFY_EMAIL_CHANGE_INPUT)
export class VerifyEmailChangeInput {
  @Field() @IsEmail() newEmail: string;
  @Field() @IsString() @Length(4, 12) code: string;
}
