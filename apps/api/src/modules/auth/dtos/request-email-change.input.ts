import { AuthGqlInputNames } from "@auth/enums/gql-names.enum";
import { Field, InputType } from "@nestjs/graphql";
import { IsEmail } from "class-validator";

@InputType(AuthGqlInputNames.REQUEST_EMAIL_CHANGE_INPUT)
export class RequestEmailChangeInput {
  @Field() @IsEmail() newEmail: string;
}
