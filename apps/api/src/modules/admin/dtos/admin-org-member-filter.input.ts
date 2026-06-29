import { IsEnum, IsOptional, IsString } from "class-validator";
import { AdminDashboardGqlInputNames } from "@admin/enums/gql-names.enum";
import { OrganizationMemberStatus } from "@prisma/client";
import { Field, InputType } from "@nestjs/graphql";

@InputType(AdminDashboardGqlInputNames.ADMIN_ORG_MEMBER_FILTER)
export class AdminOrgMemberFilterInput {
  @Field() @IsString() organizationId: string;
  @Field({ nullable: true }) @IsOptional() @IsString() search?: string;
  @Field({ nullable: true }) @IsOptional() @IsString() departmentId?: string;
  @Field(() => OrganizationMemberStatus, { nullable: true })
  @IsOptional()
  @IsEnum(OrganizationMemberStatus)
  status?: OrganizationMemberStatus;
}
