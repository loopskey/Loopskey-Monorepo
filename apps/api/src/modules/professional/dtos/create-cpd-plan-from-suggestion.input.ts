import { IsDateString, IsOptional, IsString } from "class-validator";
import { ProfessionalGqlInputNames } from "@professional/enums/gql-names.enum";
import { Field, ID, InputType } from "@nestjs/graphql";

@InputType(ProfessionalGqlInputNames.CREATE_CPD_PLAN_FROM_SUGGESTION_INPUT)
export class CreateCpdPlanFromSuggestionInput {
  @Field(() => ID) @IsString() certificationId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  reportingStart?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  reportingEnd?: string;
}
