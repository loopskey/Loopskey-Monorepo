import { OrganizationDashboardGqlObjectNames } from "@org/enums/org-dashboard-gql-names.enum";
import { Field, Float, Int, ObjectType } from "@nestjs/graphql";

@ObjectType(OrganizationDashboardGqlObjectNames.ORGANIZATION_CPD_CATEGORY_STATS)
export class OrganizationCpdCategoryStatsEntity {
  @Field(() => Int) totalCategories: number;
  @Field(() => Int) activeCategories: number;
  @Field(() => Float) totalRequiredHours: number;
  @Field(() => Int) mostPopularActiveMembers: number;
  @Field(() => String, { nullable: true }) mostPopularCategory?: string | null;
}
