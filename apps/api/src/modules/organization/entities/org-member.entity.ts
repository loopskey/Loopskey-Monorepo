import { OrganizationDashboardGqlObjectNames } from "@org/enums/org-dashboard-gql-names.enum";
import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql";
import { OrganizationMemberStatus, Role } from "@prisma/client";
import { OrganizationPageInfoEntity } from "@org/entities/page-info.entity";

@ObjectType(OrganizationDashboardGqlObjectNames.ORGANIZATION_MEMBER)
export class OrganizationMemberEntity {
  @Field() joinedAt: Date;
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
  @Field(() => ID) id: string;
  @Field(() => Role) role: Role;
  @Field(() => ID) userId: string;
  @Field(() => Float) pdus: number;
  @Field(() => Float) compliance: number;
  @Field(() => ID) organizationId: string;
  @Field(() => Int) completedLearning: number;
  @Field(() => String, { nullable: true }) notes?: string | null;
  @Field(() => String, { nullable: true }) email?: string | null;
  @Field(() => String, { nullable: true }) jobRole?: string | null;
  @Field(() => String, { nullable: true }) fullName?: string | null;
  @Field(() => ID, { nullable: true }) departmentId?: string | null;
  @Field(() => String, { nullable: true }) avatarUrl?: string | null;
  @Field(() => OrganizationMemberStatus) status: OrganizationMemberStatus;
  @Field(() => String, { nullable: true }) departmentTitle?: string | null;
}

@ObjectType(OrganizationDashboardGqlObjectNames.PAGINATED_ORGANIZATION_MEMBERS)
export class PaginatedOrganizationMembersEntity {
  @Field(() => Int) totalCount: number;
  @Field(() => [OrganizationMemberEntity]) items: OrganizationMemberEntity[];
  @Field(() => OrganizationPageInfoEntity) pageInfo: OrganizationPageInfoEntity;
}
