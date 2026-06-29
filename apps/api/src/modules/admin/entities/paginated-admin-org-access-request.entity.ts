import { AdminDashboardGqlObjectNames } from "@admin/enums/gql-names.enum";
import { AdminOrgAccessRequestEntity } from "@admin/entities/admin-org-access-request.entity";
import { Field, Int, ObjectType } from "@nestjs/graphql";
import { AdminPageInfoEntity } from "@admin/entities/admin-page-info.entity";

@ObjectType(AdminDashboardGqlObjectNames.PAGINATED_ADMIN_ORG_ACCESS_REQUESTS)
export class PaginatedAdminOrgAccessRequestsEntity {
  @Field(() => Int) totalCount: number;
  @Field(() => AdminPageInfoEntity) pageInfo: AdminPageInfoEntity;
  @Field(() => [AdminOrgAccessRequestEntity])
  items: AdminOrgAccessRequestEntity[];
}
