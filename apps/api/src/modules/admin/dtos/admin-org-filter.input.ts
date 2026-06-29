import { IsOptional, IsString } from "class-validator";
import { Field, InputType } from "@nestjs/graphql";

@InputType("AdminOrgFilter")
export class AdminOrganizationFilterInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  country?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  industry?: string;
}
