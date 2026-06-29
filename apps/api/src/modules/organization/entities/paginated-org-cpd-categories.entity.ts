import { OrganizationDashboardGqlObjectNames } from "@org/enums/org-dashboard-gql-names.enum";
import { OrganizationCpdCategoryEntity } from "@org/entities/org-cpd-category.entity";
import { OrganizationPageInfoEntity } from "@org/entities/page-info.entity";
import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType(
  OrganizationDashboardGqlObjectNames.PAGINATED_ORGANIZATION_CPD_CATEGORIES,
)
export class PaginatedOrganizationCpdCategoriesEntity {
  @Field(() => Int) totalCount: number;
  @Field(() => OrganizationPageInfoEntity) pageInfo: OrganizationPageInfoEntity;
  @Field(() => [OrganizationCpdCategoryEntity])
  items: OrganizationCpdCategoryEntity[];
}
