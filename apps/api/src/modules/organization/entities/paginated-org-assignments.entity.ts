import { OrganizationDashboardGqlObjectNames } from "@org/enums/org-dashboard-gql-names.enum";
import { OrganizationAssignmentEntity } from "./org-assignment.entity";
import { OrganizationPageInfoEntity } from "@org/entities/page-info.entity";
import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType(
  OrganizationDashboardGqlObjectNames.PAGINATED_ORGANIZATION_ASSIGNMENTS,
)
export class PaginatedOrganizationAssignmentsEntity {
  @Field(() => [OrganizationAssignmentEntity])
  items: OrganizationAssignmentEntity[];
  @Field(() => Int) totalCount: number;
  @Field(() => OrganizationPageInfoEntity)
  pageInfo: OrganizationPageInfoEntity;
}
