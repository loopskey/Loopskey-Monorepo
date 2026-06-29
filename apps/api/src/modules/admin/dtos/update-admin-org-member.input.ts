import { Field, Float, ID, InputType, Int } from "@nestjs/graphql";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { AdminDashboardGqlInputNames } from "@admin/enums/gql-names.enum";
import { OrganizationMemberStatus } from "@prisma/client";
import { IsEnum, IsInt, Max, Min } from "class-validator";

@InputType(AdminDashboardGqlInputNames.UPDATE_ADMIN_ORG_MEMBER)
export class UpdateAdminOrgMemberInput {
  @Field(() => ID)
  @IsString()
  memberId: string;

  @Field(() => OrganizationMemberStatus, { nullable: true })
  @IsOptional()
  @IsEnum(OrganizationMemberStatus)
  status?: OrganizationMemberStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  jobRole?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  pdus?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  compliance?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  completedLearning?: number;
}
