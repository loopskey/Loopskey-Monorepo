import { IsInt, IsOptional, Max, Min } from "class-validator";
import { Field, InputType, Int } from "@nestjs/graphql";
import { UserGqlInputNames } from "@user/enums/gql-names.enum";

@InputType(UserGqlInputNames.USER_PAGINATION)
export class UserPaginationInput {
  @Field(() => Int, { nullable: true, defaultValue: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @Field(() => Int, { nullable: true, defaultValue: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
