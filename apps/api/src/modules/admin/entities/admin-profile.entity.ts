import { AdminDashboardGqlObjectNames } from "@admin/enums/gql-names.enum";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { Role, UserStatus } from "@prisma/client";

@ObjectType(AdminDashboardGqlObjectNames.ADMIN_PROFILE)
export class AdminProfileEntity {
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
  @Field(() => ID) id: string;
  @Field(() => Role) role: Role;
  @Field(() => UserStatus) status: UserStatus;
  @Field(() => String, { nullable: true }) bio?: string | null;
  @Field(() => String, { nullable: true }) email?: string | null;
  @Field(() => String, { nullable: true }) fullName?: string | null;
  @Field(() => String, { nullable: true }) avatarUrl?: string | null;
}
