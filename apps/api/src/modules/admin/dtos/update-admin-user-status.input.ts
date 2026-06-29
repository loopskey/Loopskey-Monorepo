import { AdminDashboardGqlInputNames } from "@admin/enums/gql-names.enum";
import { Field, InputType } from "@nestjs/graphql";
import { IsEnum, IsString } from "class-validator";
import { UserStatus } from "@prisma/client";

@InputType(AdminDashboardGqlInputNames.UPDATE_ADMIN_USER_STATUS)
export class UpdateAdminUserStatusInput {
  @Field() @IsString() userId: string;
  @Field(() => UserStatus) @IsEnum(UserStatus) status: UserStatus;
}
