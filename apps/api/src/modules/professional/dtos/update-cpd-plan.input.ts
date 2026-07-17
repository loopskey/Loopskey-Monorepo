import { ProfessionalGqlInputNames } from "@professional/enums/gql-names.enum";
import { Field, ID, InputType } from "@nestjs/graphql";
import { CreateCpdPlanInput } from "@professional/dtos/create-cpd-plan.input";
import { IsString } from "class-validator";

@InputType(ProfessionalGqlInputNames.UPDATE_CPD_PLAN_INPUT)
export class UpdateCpdPlanInput extends CreateCpdPlanInput {
  @Field(() => ID) @IsString() id: string;
}
