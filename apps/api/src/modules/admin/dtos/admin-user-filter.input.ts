import { IsBoolean, IsEnum, IsOptional, IsString } from "class-validator";
import { AdminDashboardGqlInputNames } from "@admin/enums/gql-names.enum";
import { Field, InputType } from "@nestjs/graphql";
import { Role, UserStatus } from "@prisma/client";

@InputType(AdminDashboardGqlInputNames.ADMIN_USER_FILTER)
export class AdminUserFilterInput {
  @Field({ nullable: true }) @IsOptional() @IsString() search?: string;
  @Field({ nullable: true }) @IsOptional() @IsBoolean() premiumOnly?: boolean;
  @Field(() => Role, { nullable: true })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
  @Field(() => UserStatus, { nullable: true })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
