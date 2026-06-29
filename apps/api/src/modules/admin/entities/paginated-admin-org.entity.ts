import { AdminDashboardGqlObjectNames } from "@admin/enums/gql-names.enum";
import { AdminOrganizationEntity } from "@admin/entities/admin-org.entity";
import { Field, Int, ObjectType } from "@nestjs/graphql";
import { AdminPageInfoEntity } from "@admin/entities/admin-page-info.entity";

@ObjectType(AdminDashboardGqlObjectNames.PAGINATED_ADMIN_ORG)
export class PaginatedAdminOrganizationsEntity {
  @Field(() => Int) totalCount: number;
  @Field(() => AdminPageInfoEntity) pageInfo: AdminPageInfoEntity;
  @Field(() => [AdminOrganizationEntity]) items: AdminOrganizationEntity[];
}
