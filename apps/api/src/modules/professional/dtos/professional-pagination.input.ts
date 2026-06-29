import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { ProfessionalGqlInputNames } from "@professional/enums/gql-names.enum";
import { Field, InputType, Int } from "@nestjs/graphql";

@InputType(ProfessionalGqlInputNames.PROFESSIONAL_PAGINATION_INPUT)
export class ProfessionalPaginationInput {
  @Field(() => Int, { nullable: true, defaultValue: 12 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  take?: number;

  @Field({ nullable: true }) @IsOptional() @IsString() cursor?: string;
}
