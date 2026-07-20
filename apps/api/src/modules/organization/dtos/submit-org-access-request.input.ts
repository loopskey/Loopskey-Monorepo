import { Transform } from "class-transformer";
import { OrganizationAccessRequestGqlInputNames } from "@org/enums/org-access-request-gql-names.enum";
import { Field, InputType, Int } from "@nestjs/graphql";
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";
import { OrganizationType } from "@prisma/client";

const trimString = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

@InputType(
  OrganizationAccessRequestGqlInputNames.SUBMIT_ORGANIZATION_ACCESS_REQUEST,
)
export class SubmitOrganizationAccessRequestInput {
  @Field(() => String)
  @Transform(trimString)
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  representativeFullName!: string;

  @Field(() => String)
  @Transform(trimString)
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  organizationName!: string;

  @Field(() => String)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(255)
  workEmail!: string;

  @Field(() => OrganizationType)
  @IsEnum(OrganizationType)
  organizationType!: OrganizationType;

  @Field(() => String)
  @Transform(trimString)
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  representativeJobRole!: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  expectedLicensedProfessionals!: number;

  @Field(() => String)
  @Transform(trimString)
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  country!: string;

  @Field(() => String)
  @Transform(trimString)
  @IsString()
  @MinLength(5)
  @MaxLength(2000)
  goals!: string;
}
