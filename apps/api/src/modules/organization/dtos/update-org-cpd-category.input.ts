import { OrganizationDashboardGqlInputNames } from "@org/enums/org-dashboard-gql-names.enum";
import { IsBoolean, IsEnum, IsString } from "class-validator";
import { Field, Float, InputType } from "@nestjs/graphql";
import { IsNumber, IsOptional } from "class-validator";
import { PDUCategory } from "@prisma/client";

@InputType(
  OrganizationDashboardGqlInputNames.UPDATE_ORGANIZATION_CPD_CATEGORY_INPUT,
)
export class UpdateOrganizationCpdCategoryInput {
  @Field() @IsString() categoryId: string;
  @Field({ nullable: true }) @IsOptional() @IsBoolean() isActive?: boolean;
  @Field({ nullable: true }) @IsOptional() @IsString() title?: string;
  @Field({ nullable: true }) @IsOptional() @IsString() description?: string;
  @Field(() => PDUCategory, { nullable: true })
  @IsOptional()
  @IsEnum(PDUCategory)
  category?: PDUCategory;
  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  requiredHours?: number;
}
