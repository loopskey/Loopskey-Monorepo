import { IsOptional, IsString, IsUrl } from "class-validator";
import { ProfessionalGqlInputNames } from "@professional/enums/gql-names.enum";
import { Field, InputType } from "@nestjs/graphql";

@InputType(ProfessionalGqlInputNames.UPDATE_PROFESSIONAL_PROFILE_INPUT)
export class UpdateProfessionalProfileInput {
  @Field({ nullable: true }) @IsOptional() @IsString() bio?: string;
  @Field({ nullable: true }) @IsOptional() @IsUrl() website?: string;
  @Field({ nullable: true }) @IsOptional() @IsString() phone?: string;
  @Field({ nullable: true }) @IsOptional() @IsString() fullName?: string;
  @Field({ nullable: true }) @IsOptional() @IsString() location?: string;
  @Field({ nullable: true }) @IsOptional() @IsString() education?: string;
  @Field({ nullable: true }) @IsOptional() @IsString() avatarUrl?: string;
  @Field({ nullable: true }) @IsOptional() @IsString() occupation?: string;
}
