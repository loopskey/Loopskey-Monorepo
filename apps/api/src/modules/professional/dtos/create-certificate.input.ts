import { IsDateString, IsOptional, IsString, MaxLength } from "class-validator";
import { ProfessionalGqlInputNames } from "@professional/enums/gql-names.enum";
import { trim, trimToNull } from "@professional/utils/function-helper";
import { Field, InputType } from "@nestjs/graphql";
import { Transform } from "class-transformer";

@InputType(ProfessionalGqlInputNames.CREATE_CERTIFICATE_INPUT)
export class CreateCertificateInput {
  @Field(() => String)
  @Transform(trim)
  @IsString()
  @MaxLength(200)
  title: string;

  @Field(() => String)
  @Transform(trim)
  @IsString()
  @MaxLength(200)
  issuer: string;

  @Field(() => String, { nullable: true })
  @Transform(trimToNull)
  @IsOptional()
  @IsString()
  @MaxLength(120)
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
