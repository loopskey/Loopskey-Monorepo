import { IsDateString, IsNumber, IsOptional, IsString } from "class-validator";
import { LICENCE_NUMBER_MAX_LENGTH } from "@professional/enums/profile-section.enum";
import { ProfessionalGqlInputNames } from "@professional/enums/gql-names.enum";
import { Field, Float, InputType } from "@nestjs/graphql";
import { MaxLength, Min } from "class-validator";
import { Transform } from "class-transformer";

const trimToNull = ({ value }: { value: unknown }) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

@InputType(ProfessionalGqlInputNames.CREATE_PROFESSIONAL_CREDENTIAL_INPUT)
export class CreateProfessionalCredentialInput {
  @Field(() => String)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim() : value,
  )
  @IsString()
  @MaxLength(200)
  name: string;

  @Field(() => String)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim() : value,
  )
  @IsString()
  @MaxLength(200)
  issuingOrganization: string;

  @Field(() => String)
  @IsDateString()
  issueDate: string;

  @Field(() => String, { nullable: true })
  @Transform(trimToNull)
  @IsOptional()
  @IsDateString()
  expiryDate?: string | null;

  @Field(() => String, { nullable: true })
  @Transform(trimToNull)
  @IsOptional()
  @IsString()
  @MaxLength(LICENCE_NUMBER_MAX_LENGTH)
  licenceNumber?: string | null;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(0)
  annualCpdHours?: number | null;

  @Field(() => String, { nullable: true })
  @Transform(trimToNull)
  @IsOptional()
  @IsString()
  pduTargetId?: string | null;
}
