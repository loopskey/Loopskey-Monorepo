import { OrganizationAccessRequestGqlObjectNames } from "@org/enums/org-access-request-gql-names.enum";
import { OrganizationAccessRequestEntity } from "@org/entities/org-access-request.entity";
import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType(
  OrganizationAccessRequestGqlObjectNames.ORGANIZATION_ACCESS_REQUEST_PAGE_INFO,
)
export class OrganizationAccessRequestPageInfoEntity {
  @Field(() => Int) page!: number;
  @Field(() => Int) limit!: number;
  @Field(() => Int) totalPages!: number;
  @Field(() => Int) totalItems!: number;
  @Field(() => Boolean) hasNextPage!: boolean;
  @Field(() => Boolean) hasPreviousPage!: boolean;
}

@ObjectType(
  OrganizationAccessRequestGqlObjectNames.PAGINATED_ORGANIZATION_ACCESS_REQUESTS,
)
export class PaginatedOrganizationAccessRequestsEntity {
  @Field(() => [OrganizationAccessRequestEntity])
  items!: OrganizationAccessRequestEntity[];
  @Field(() => OrganizationAccessRequestPageInfoEntity)
  pageInfo!: OrganizationAccessRequestPageInfoEntity;
}
