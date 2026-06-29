import { OrganizationDashboardGqlInputNames } from "@org/enums/org-dashboard-gql-names.enum";
import { IsBoolean, IsEnum, IsNumber, Min } from "class-validator";
import { Field, Float, InputType } from "@nestjs/graphql";
import { IsOptional, IsString } from "class-validator";
import { PDUCategory } from "@prisma/client";

@InputType(
  OrganizationDashboardGqlInputNames.CREATE_ORGANIZATION_CPD_CATEGORY_INPUT,
)
export class CreateOrganizationCpdCategoryInput {
  @Field() @IsString() title: string;
  @Field(() => Float) @IsNumber() @Min(0) requiredHours: number;
  @Field(() => PDUCategory) @IsEnum(PDUCategory) category: PDUCategory;
  @Field({ nullable: true }) @IsOptional() @IsBoolean() isActive?: boolean;
  @Field({ nullable: true }) @IsOptional() @IsString() description?: string;
}
