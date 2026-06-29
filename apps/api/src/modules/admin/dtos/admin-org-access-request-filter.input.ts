import { OrganizationAccessRequestStatus } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { AdminDashboardGqlInputNames } from "@admin/enums/gql-names.enum";
import { Field, InputType } from "@nestjs/graphql";

@InputType(AdminDashboardGqlInputNames.ADMIN_ORG_ACCESS_REQUEST_FILTER)
export class AdminOrgAccessRequestFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => OrganizationAccessRequestStatus, { nullable: true })
  @IsOptional()
  @IsEnum(OrganizationAccessRequestStatus)
  status?: OrganizationAccessRequestStatus;
}
