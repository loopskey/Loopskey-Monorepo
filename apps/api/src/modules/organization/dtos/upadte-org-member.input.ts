import { OrganizationDashboardGqlInputNames } from "@org/enums/org-dashboard-gql-names.enum";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { OrganizationMemberStatus } from "@prisma/client";
import { Field, InputType } from "@nestjs/graphql";

@InputType(OrganizationDashboardGqlInputNames.UPDATE_ORGANIZATION_MEMBER_INPUT)
export class UpdateOrganizationMemberInput {
  @Field() @IsString() memberId: string;
  @Field({ nullable: true }) @IsOptional() @IsString() jobRole?: string;
  @Field({ nullable: true }) @IsOptional() @IsString() departmentId?: string;
  @Field(() => OrganizationMemberStatus, { nullable: true })
  @IsOptional()
  @IsEnum(OrganizationMemberStatus)
  status?: OrganizationMemberStatus;
}
