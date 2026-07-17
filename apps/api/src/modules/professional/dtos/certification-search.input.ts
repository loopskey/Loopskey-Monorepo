import { IsInt, IsOptional, IsString } from "class-validator";
import { ProfessionalGqlInputNames } from "@professional/enums/gql-names.enum";
import { Field, InputType, Int } from "@nestjs/graphql";
import { Max, MaxLength, Min } from "class-validator";

@InputType(ProfessionalGqlInputNames.CERTIFICATION_SEARCH_INPUT)
export class CertificationSearchInput {
  @Field() @IsString() @MaxLength(120) query: string;

  @Field(() => Int, { nullable: true, defaultValue: 8 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(25)
  limit?: number;
}
