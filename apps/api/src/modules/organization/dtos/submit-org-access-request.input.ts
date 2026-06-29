import { IsEmail, IsEnum, IsInt, Min, MinLength } from "class-validator";
import { OrganizationAccessRequestGqlInputNames } from "@org/enums/org-access-request-gql-names.enum";
import { Field, InputType, Int } from "@nestjs/graphql";
import { IsString, MaxLength } from "class-validator";
import { OrganizationType } from "@prisma/client";

@InputType(
  OrganizationAccessRequestGqlInputNames.SUBMIT_ORGANIZATION_ACCESS_REQUEST,
)
export class SubmitOrganizationAccessRequestInput {
  @Field(() => String)
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  representativeFullName!: string;

  @Field(() => String)
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  organizationName!: string;

  @Field(() => String)
  @IsEmail()
  @MaxLength(255)
  workEmail!: string;

  @Field(() => OrganizationType)
  @IsEnum(OrganizationType)
  organizationType!: OrganizationType;

  @Field(() => String)
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  representativeJobRole!: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  expectedLicensedProfessionals!: number;

  @Field(() => String)
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  country!: string;

  @Field(() => String)
  @IsString()
  @MinLength(5)
  @MaxLength(2000)
  goals!: string;
}
