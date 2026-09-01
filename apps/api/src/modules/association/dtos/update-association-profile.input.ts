import { IsEmail, IsOptional, IsString } from "class-validator";
import { IsUrl, MaxLength, MinLength } from "class-validator";
import { AssociationGqlInputNames } from "@association/enums/association-gql-names.enum";
import { ASSOCIATION_LIMITS } from "@loopskey/api-contracts/validation";
import { Field, InputType } from "@nestjs/graphql";

@InputType(AssociationGqlInputNames.UPDATE_ASSOCIATION_PROFILE)
export class UpdateAssociationProfileInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(ASSOCIATION_LIMITS.nameMin)
  @MaxLength(ASSOCIATION_LIMITS.nameMax)
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(ASSOCIATION_LIMITS.descriptionMax)
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(ASSOCIATION_LIMITS.countryMax)
  country?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  @MaxLength(ASSOCIATION_LIMITS.websiteMax)
  website?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  @MaxLength(ASSOCIATION_LIMITS.emailMax)
  contactEmail?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  @MaxLength(ASSOCIATION_LIMITS.logoUrlMax)
  logoUrl?: string;
}
