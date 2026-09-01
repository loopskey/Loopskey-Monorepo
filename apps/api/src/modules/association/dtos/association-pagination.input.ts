import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { AssociationGqlInputNames } from "@association/enums/association-gql-names.enum";
import { Field, InputType, Int } from "@nestjs/graphql";

@InputType(AssociationGqlInputNames.ASSOCIATION_PAGINATION)
export class AssociationPaginationInput {
  @Field(() => Int, { nullable: true, defaultValue: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  take?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  cursor?: string;
}
