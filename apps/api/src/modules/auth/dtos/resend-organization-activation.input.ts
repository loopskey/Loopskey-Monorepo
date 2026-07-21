import { IsEmail, MaxLength } from "class-validator";
import { AuthGqlInputNames } from "@auth/enums/gql-names.enum";
import { Field, InputType } from "@nestjs/graphql";

@InputType(AuthGqlInputNames.RESEND_ORGANIZATION_ACTIVATION)
export class ResendOrganizationActivationInput {
  @Field(() => String) @IsEmail() @MaxLength(255) email!: string;
}
