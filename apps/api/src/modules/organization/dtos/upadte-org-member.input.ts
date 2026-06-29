import { OrganizationDashboardGqlInputNames } from "@org/enums/org-dashboard-gql-names.enum";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { OrganizationMemberStatus, Role } from "@prisma/client";
import { Field, InputType } from "@nestjs/graphql";

@InputType(OrganizationDashboardGqlInputNames.UPDATE_ORGANIZATION_MEMBER_INPUT)
export class UpdateOrganizationMemberInput {
  @Field() @IsString() memberId: string;
  @Field({ nullable: true }) @IsOptional() @IsString() jobRole?: string;
  @Field({ nullable: true }) @IsOptional() @IsString() departmentId?: string;
  @Field(() => Role, { nullable: true })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
  @Field(() => OrganizationMemberStatus, { nullable: true })
  @IsOptional()
  @IsEnum(OrganizationMemberStatus)
  status?: OrganizationMemberStatus;
}
