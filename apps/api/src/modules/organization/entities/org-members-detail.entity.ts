import { OrganizationDashboardGqlObjectNames } from "@org/enums/org-dashboard-gql-names.enum";
import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql";
import { OrganizationMemberStatus } from "@prisma/client";

@ObjectType(OrganizationDashboardGqlObjectNames.ORGANIZATION_MEMBERS_DETAIL)
export class OrganizationMemberDetailEntity {
  @Field() joinedAt: Date;
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
  @Field(() => ID) id: string;
  @Field(() => ID) userId: string;
  @Field(() => Float) pdus: number;
  @Field(() => Float) pduGoal: number;
  @Field(() => Float) compliance: number;
  @Field(() => ID) organizationId: string;
  @Field(() => Float) pduProgress: number;
  @Field(() => Int) completedLearning: number;
  @Field(() => String, { nullable: true }) notes?: string | null;
  @Field(() => String, { nullable: true }) email?: string | null;
  @Field(() => String, { nullable: true }) jobRole?: string | null;
  @Field(() => String, { nullable: true }) fullName?: string | null;
  @Field(() => String, { nullable: true }) avatarUrl?: string | null;
  @Field(() => Date, { nullable: true }) lastActivityAt?: Date | null;
  @Field(() => String, { nullable: true }) departmentId?: string | null;
  @Field(() => OrganizationMemberStatus) status: OrganizationMemberStatus;
  @Field(() => String, { nullable: true }) departmentTitle?: string | null;
  @Field(() => String, { nullable: true }) lastCourseTitle?: string | null;
}
