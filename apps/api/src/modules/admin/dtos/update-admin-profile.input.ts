import { IsEmail, IsOptional, IsString } from "class-validator";
import { AdminDashboardGqlInputNames } from "@admin/enums/gql-names.enum";
import { Field, InputType } from "@nestjs/graphql";

@InputType(AdminDashboardGqlInputNames.UPDATE_ADMIN_PROFILE)
export class UpdateAdminProfileInput {
  @Field({ nullable: true }) @IsOptional() @IsString() bio?: string;
  @Field({ nullable: true }) @IsOptional() @IsEmail() email?: string;
  @Field({ nullable: true }) @IsOptional() @IsString() fullName?: string;
  @Field({ nullable: true }) @IsOptional() @IsString() avatarUrl?: string;
}
