import { AdminDashboardGqlObjectNames } from "@admin/enums/gql-names.enum";
import { Field, Int, ObjectType } from "@nestjs/graphql";
import { AdminOrgMemberEntity } from "@admin/entities/admin-org-member.entity";

@ObjectType(AdminDashboardGqlObjectNames.ADMIN_PAGE_INFO)
export class AdminPageInfoEntity {
  @Field() hasNextPage: boolean;
  @Field(() => String, { nullable: true }) nextCursor?: string | null;
}

@ObjectType(AdminDashboardGqlObjectNames.PAGINATED_ADMIN_ORG_MEMBERS)
export class PaginatedAdminOrgMembersEntity {
  @Field(() => Int) totalCount: number;
  @Field(() => AdminPageInfoEntity) pageInfo: AdminPageInfoEntity;
  @Field(() => [AdminOrgMemberEntity]) items: AdminOrgMemberEntity[];
}
