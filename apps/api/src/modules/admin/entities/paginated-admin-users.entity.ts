import { AdminDashboardGqlObjectNames } from "@admin/enums/gql-names.enum";
import { Field, Int, ObjectType } from "@nestjs/graphql";
import { AdminPageInfoEntity } from "@admin/entities/admin-page-info.entity";
import { AdminUserEntity } from "@admin/entities/admin-user.entity";

@ObjectType(AdminDashboardGqlObjectNames.PAGINATED_ADMIN_USER)
export class PaginatedAdminUsersEntity {
  @Field(() => Int) totalCount: number;
  @Field(() => [AdminUserEntity]) items: AdminUserEntity[];
  @Field(() => AdminPageInfoEntity) pageInfo: AdminPageInfoEntity;
}
