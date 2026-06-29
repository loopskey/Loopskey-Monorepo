import { ProfessionalGqlInputNames } from "@professional/enums/gql-names.enum";
import { IsOptional, IsString } from "class-validator";
import { Field, InputType } from "@nestjs/graphql";

@InputType(ProfessionalGqlInputNames.PROFESSIONAL_SEARCH_INPUT)
export class ProfessionalSearchInput {
  @Field({ nullable: true }) @IsOptional() @IsString() search?: string;
}
