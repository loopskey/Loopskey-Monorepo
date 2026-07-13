import { CreateProfessionalCredentialInput } from "@professional/dtos/create-professional-credential.input";
import { ProfessionalGqlInputNames } from "@professional/enums/gql-names.enum";
import { Field, ID, InputType } from "@nestjs/graphql";
import { IsString } from "class-validator";

@InputType(ProfessionalGqlInputNames.UPDATE_PROFESSIONAL_CREDENTIAL_INPUT)
export class UpdateProfessionalCredentialInput extends CreateProfessionalCredentialInput {
  @Field(() => ID) @IsString() id: string;
}
