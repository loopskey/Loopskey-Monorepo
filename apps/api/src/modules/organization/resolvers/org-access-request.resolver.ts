import { OrganizationAccessRequestGqlMutationNames } from "@org/enums/org-access-request-gql-names.enum";
import { PaginatedOrganizationAccessRequestsEntity } from "@org/entities/paginated-org-access-request.entity";
import { OrganizationAccessRequestPaginationInput } from "@org/dtos/org-access-request-pagination.input";
import { OrganizationAccessRequestGqlQueryNames } from "@org/enums/org-access-request-gql-names.enum";
import { OrganizationAccessRequestFilterInput } from "@org/dtos/org-access-request-filter";
import { SubmitOrganizationAccessRequestInput } from "@org/dtos/submit-org-access-request.input";
import { OrganizationAccessRequestEntity } from "@org/entities/org-access-request.entity";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { OrgAccessRequestService } from "@org/services/org-access-request.service";
import { Public } from "@auth/decorators/public.decorator";
import { Roles } from "@auth/decorators/roles.decorator";
import { Role } from "@prisma/client";

@Resolver(() => OrganizationAccessRequestEntity)
export class OrgAccessRequestResolver {
  constructor(
    private readonly orgAccessRequestService: OrgAccessRequestService,
  ) {}

  @Public()
  @Mutation(() => OrganizationAccessRequestEntity, {
    name: OrganizationAccessRequestGqlMutationNames.SUBMIT_ORGANIZATION_ACCESS_REQUEST,
  })
  submitOrganizationAccessRequest(
    @Args("input") input: SubmitOrganizationAccessRequestInput,
  ) {
    return this.orgAccessRequestService.submitRequest(input);
  }

  @Roles(Role.ADMIN)
  @Query(() => PaginatedOrganizationAccessRequestsEntity, {
    name: OrganizationAccessRequestGqlQueryNames.ORGANIZATION_ACCESS_REQUESTS,
  })
  organizationAccessRequests(
    @Args("filter", { nullable: true })
    filter?: OrganizationAccessRequestFilterInput,
    @Args("pagination", { nullable: true })
    pagination?: OrganizationAccessRequestPaginationInput,
  ) {
    return this.orgAccessRequestService.findRequests(filter, pagination);
  }

  @Roles(Role.ADMIN)
  @Query(() => OrganizationAccessRequestEntity, {
    name: OrganizationAccessRequestGqlQueryNames.ORGANIZATION_ACCESS_REQUEST_BY_ID,
  })
  organizationAccessRequestById(
    @Args("requestId", { type: () => String }) requestId: string,
  ) {
    return this.orgAccessRequestService.findRequestById(requestId);
  }
}
