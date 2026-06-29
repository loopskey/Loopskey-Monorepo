import { IsInt, IsOptional, Max, Min } from "class-validator";
import { Field, InputType, Int } from "@nestjs/graphql";
import { LandingGqlInputNames } from "@landing/enums/gql-names";

@InputType(LandingGqlInputNames.POPULAR_CATEGORIES_INPUT)
export class PopularCategoriesInput {
  @Field(() => Int, { nullable: true, defaultValue: 8 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(24)
  take?: number;
}
