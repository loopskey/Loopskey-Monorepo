import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql";
import { AdminDashboardGqlObjectNames } from "@admin/enums/gql-names.enum";
import { OrganizationMemberStatus } from "@prisma/client";

@ObjectType(AdminDashboardGqlObjectNames.ADMIN_ORG_MEMBER)
export class AdminOrgMemberEntity {
  @Field() joinedAt: Date;
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
  @Field(() => ID) id: string;
  @Field(() => ID) userId: string;
  @Field(() => Float) pdus: number;
  @Field(() => Float) compliance: number;
  @Field(() => ID) organizationId: string;
  @Field(() => Int) completedLearning: number;
  @Field(() => String, { nullable: true }) email?: string | null;
  @Field(() => String, { nullable: true }) jobRole?: string | null;
  @Field(() => String, { nullable: true }) fullName?: string | null;
  @Field(() => ID, { nullable: true }) departmentId?: string | null;
  @Field(() => String, { nullable: true }) avatarUrl?: string | null;
  @Field(() => OrganizationMemberStatus) status: OrganizationMemberStatus;
  @Field(() => String, { nullable: true }) departmentTitle?: string | null;
}
