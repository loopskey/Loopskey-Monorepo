import { Field, ID, InputType, OmitType } from "@nestjs/graphql";
import { ProfessionalGqlInputNames } from "@professional/enums/gql-names.enum";
import { CreateCertificateInput } from "@professional/dtos/create-certificate.input";
import { IsString } from "class-validator";

@InputType(ProfessionalGqlInputNames.UPDATE_CERTIFICATE_INPUT)
export class UpdateCertificateInput extends OmitType(CreateCertificateInput, [
  "cpdPlanId",
] as const) {
  @Field(() => ID) @IsString() id: string;
}
