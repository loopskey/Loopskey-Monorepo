import { IsArray, IsEmail, IsOptional, IsString } from "class-validator";
import { OrganizationDashboardGqlInputNames } from "@org/enums/org-dashboard-gql-names.enum";
import { MaxLength, ValidateNested } from "class-validator";
import { Field, InputType } from "@nestjs/graphql";
import { Type } from "class-transformer";

@InputType(OrganizationDashboardGqlInputNames.BULK_ORG_MEMBER_ROW_INPUT)
export class BulkOrganizationMemberRowInput {
  @Field() @IsEmail() email: string;
  @Field() @IsString() @MaxLength(120) fullName: string;
  @Field({ nullable: true }) @IsOptional() @IsString() jobRole?: string;
  @Field({ nullable: true }) @IsOptional() @IsString() departmentId?: string;
  @Field({ nullable: true }) @IsOptional() @IsString() departmentTitle?: string;
}

@InputType(OrganizationDashboardGqlInputNames.BULK_ADD_ORG_MEMBERS_INPUT)
export class BulkAddOrganizationMembersInput {
  @Field(() => [BulkOrganizationMemberRowInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkOrganizationMemberRowInput)
  rows: BulkOrganizationMemberRowInput[];
}
