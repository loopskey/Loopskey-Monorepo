import { IsEmail, MaxLength } from "class-validator";
import { AuthGqlInputNames } from "@auth/enums/gql-names.enum";
import { Field, InputType } from "@nestjs/graphql";

@InputType(AuthGqlInputNames.FORGOT_PASSWORD)
export class ForgotPasswordInput {
  @Field(() => String) @IsEmail() @MaxLength(255) email!: string;
}
