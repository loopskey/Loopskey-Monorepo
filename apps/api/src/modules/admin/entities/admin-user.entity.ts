import { AdminDashboardGqlObjectNames } from "@admin/enums/gql-names.enum";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { Role, UserStatus } from "@prisma/client";

@ObjectType(AdminDashboardGqlObjectNames.ADMIN_USER)
export class AdminUserEntity {
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
  @Field() isPremium: boolean;
  @Field(() => ID) id: string;
  @Field(() => Role) role: Role;
  @Field(() => UserStatus) status: UserStatus;
  @Field(() => String, { nullable: true }) email?: string | null;
  @Field(() => Date, { nullable: true }) lastLoginAt?: Date | null;
  @Field(() => String, { nullable: true }) location?: String | null;
  @Field(() => String, { nullable: true }) fullName?: string | null;
  @Field(() => String, { nullable: true }) avatarUrl?: string | null;
}
