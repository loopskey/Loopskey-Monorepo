import { OrganizationDashboardGqlObjectNames } from "@org/enums/org-dashboard-gql-names.enum";
import { OrganizationPageInfoEntity } from "@org/entities/page-info.entity";
import { OrganizationMemberEntity } from "@org/entities/org-member.entity";
import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType(OrganizationDashboardGqlObjectNames.PAGINATED_ORGANIZATION_MEMBERS)
export class PaginatedOrganizationMembersEntity {
  @Field(() => Int) totalCount: number;
  @Field(() => [OrganizationMemberEntity]) items: OrganizationMemberEntity[];
  @Field(() => OrganizationPageInfoEntity) pageInfo: OrganizationPageInfoEntity;
}
