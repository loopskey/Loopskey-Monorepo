import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { AdminDashboardGqlInputNames } from "@admin/enums/gql-names.enum";
import { Field, InputType, Int } from "@nestjs/graphql";

@InputType(AdminDashboardGqlInputNames.ADMIN_PAGINATION)
export class AdminPaginationInput {
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
