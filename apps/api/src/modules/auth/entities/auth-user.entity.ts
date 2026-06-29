import { Field, ID, ObjectType } from "@nestjs/graphql";
import { AuthGqlObjectNames } from "@auth/enums/gql-names.enum";
import { Role, UserStatus } from "@prisma/client";

@ObjectType(AuthGqlObjectNames.AUTH_USER)
export class AuthUserEntity {
  @Field(() => ID) id!: string;
  @Field(() => Role) role!: Role;
  @Field(() => UserStatus) status!: UserStatus;
  @Field(() => Boolean) forcePasswordChange!: boolean;
  @Field(() => String, { nullable: true }) bio?: string | null;
  @Field(() => String, { nullable: true }) email?: string | null;
  @Field(() => String, { nullable: true }) fullName?: string | null;
  @Field(() => String, { nullable: true }) avatarUrl?: string | null;
  @Field(() => Date, { nullable: true }) emailVerifiedAt?: Date | null;
}
