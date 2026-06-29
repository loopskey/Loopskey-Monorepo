import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql";
import { OrganizationDepartmentEntity } from "@org/entities/org-department.entity";
import { AdminDashboardGqlObjectNames } from "@admin/enums/gql-names.enum";
import { OrganizationSettingsEntity } from "@org/entities/org-settings.entity";
import { AdminOrgMemberEntity } from "@admin/entities/admin-org-member.entity";

@ObjectType(AdminDashboardGqlObjectNames.ADMIN_ORG_DETAIL)
export class AdminOrgDetailEntity {
  @Field() name: string;
  @Field() updatedAt: Date;
  @Field() createdAt: Date;
  @Field(() => ID) id: string;
  @Field(() => ID) ownerId: string;
  @Field(() => Float) totalPdus: number;
  @Field(() => Int) totalMembers: number;
  @Field(() => Int) activeMembers: number;
  @Field(() => Int) inactiveMembers: number;
  @Field(() => Float) averageCompliance: number;
  @Field(() => String, { nullable: true }) country?: string | null;
  @Field(() => String, { nullable: true }) logoUrl?: string | null;
  @Field(() => String, { nullable: true }) website?: string | null;
  @Field(() => String, { nullable: true }) industry?: string | null;
  @Field(() => String, { nullable: true }) ownerName?: string | null;
  @Field(() => String, { nullable: true }) ownerEmail?: string | null;
  @Field(() => String, { nullable: true }) description?: string | null;
  @Field(() => OrganizationSettingsEntity, { nullable: true })
  settings?: OrganizationSettingsEntity | null;
  @Field(() => [OrganizationDepartmentEntity])
  departments: OrganizationDepartmentEntity[];
  @Field(() => [AdminOrgMemberEntity])
  members: AdminOrgMemberEntity[];
}
