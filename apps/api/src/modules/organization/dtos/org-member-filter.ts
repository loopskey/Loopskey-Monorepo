import { OrganizationDashboardGqlInputNames } from "@org/enums/org-dashboard-gql-names.enum";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { OrganizationMemberStatus } from "@prisma/client";
import { Field, InputType } from "@nestjs/graphql";

@InputType(OrganizationDashboardGqlInputNames.ORGANIZATION_MEMBER_FILTER_INPUT)
export class OrganizationMemberFilterInput {
  @Field({ nullable: true }) @IsOptional() @IsString() search?: string;
  @Field({ nullable: true }) @IsOptional() @IsString() departmentId?: string;
  @Field(() => OrganizationMemberStatus, { nullable: true })
  @IsOptional()
  @IsEnum(OrganizationMemberStatus)
  status?: OrganizationMemberStatus;
}
