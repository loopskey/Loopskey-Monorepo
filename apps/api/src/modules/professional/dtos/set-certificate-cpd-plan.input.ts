import { ProfessionalGqlInputNames } from "@professional/enums/gql-names.enum";
import { IsOptional, IsString } from "class-validator";
import { Field, ID, InputType } from "@nestjs/graphql";
import { trimToNull } from "@utils/transform.util";
import { Transform } from "class-transformer";

@InputType(ProfessionalGqlInputNames.SET_CERTIFICATE_CPD_PLAN_INPUT)
export class SetCertificateCpdPlanInput {
  @Field(() => ID) @IsString() certificateId: string;

  @Field(() => ID, { nullable: true })
  @Transform(trimToNull)
  @IsOptional()
  @IsString()
  cpdPlanId?: string | null;
}
