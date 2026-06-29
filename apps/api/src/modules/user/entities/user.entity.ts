import { ProfessionalProfileEntity } from "@user/entities/professional-profile.entity";
import { OrganizationProfileEntity } from "@user/entities/organization-profile.entity";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { ProviderProfileEntity } from "@user/entities/provider-profile.entity";
import { UserGqlObjectNames } from "@user/enums/gql-names.enum";
import { Role, UserStatus } from "@prisma/client";

@ObjectType(UserGqlObjectNames.USER)
export class UserEntity {
  @Field(() => ID) id!: string;
  @Field(() => Role) role!: Role;
  @Field(() => Date) updatedAt!: Date;
  @Field(() => Date) createdAt!: Date;
  @Field(() => UserStatus) status!: UserStatus;
  @Field(() => String, { nullable: true }) bio?: string | null;
  @Field(() => Date, { nullable: true }) deletedAt?: Date | null;
  @Field(() => String, { nullable: true }) email?: string | null;
  @Field(() => String, { nullable: true }) phone?: string | null;
  @Field(() => Date, { nullable: true }) lastLoginAt?: Date | null;
  @Field(() => String, { nullable: true }) lastName?: string | null;
  @Field(() => String, { nullable: true }) fullName?: string | null;
  @Field(() => String, { nullable: true }) firstName?: string | null;
  @Field(() => String, { nullable: true }) avatarUrl?: string | null;
  @Field(() => Date, { nullable: true }) emailVerifiedAt?: Date | null;
  @Field(() => Date, { nullable: true }) phoneVerifiedAt?: Date | null;
  @Field(() => ProfessionalProfileEntity, { nullable: true })
  professionalProfile?: ProfessionalProfileEntity | null;
  @Field(() => ProviderProfileEntity, { nullable: true })
  providerProfile?: ProviderProfileEntity | null;
  @Field(() => OrganizationProfileEntity, { nullable: true })
  organizationProfile?: OrganizationProfileEntity | null;
}
