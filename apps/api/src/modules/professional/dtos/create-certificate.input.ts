import { IsDateString, IsOptional, IsString, MaxLength } from "class-validator";
import { ProfessionalGqlInputNames } from "@professional/enums/gql-names.enum";
import { CERTIFICATE_LIMITS } from "@loopskey/api-contracts/validation";
import { trim, trimToNull } from "@utils/transform.util";
import { Field, InputType } from "@nestjs/graphql";
import { Transform } from "class-transformer";

@InputType(ProfessionalGqlInputNames.CREATE_CERTIFICATE_INPUT)
export class CreateCertificateInput {
  @Field(() => String)
  @Transform(trim)
  @IsString()
  @MaxLength(CERTIFICATE_LIMITS.titleMax)
  title: string;

  @Field(() => String)
  @Transform(trim)
  @IsString()
  @MaxLength(CERTIFICATE_LIMITS.issuerMax)
  issuer: string;

  @Field(() => String, { nullable: true })
  @Transform(trimToNull)
  @IsOptional()
  @IsString()
  @MaxLength(CERTIFICATE_LIMITS.certificateNumberMax)
  certificateNumber?: string | null;

  @Field(() => String)
  @IsDateString()
  issueDate: string;

  @Field(() => String)
  @IsDateString()
  validUntil: string;

  @Field(() => String, { nullable: true })
  @Transform(trimToNull)
  @IsOptional()
  @IsString()
  cpdPlanId?: string | null;
}
