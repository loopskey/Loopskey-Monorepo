import { OrganizationAccessRequestStatus } from "@prisma/client";
import { registerEnumType } from "@nestjs/graphql";
import { OrganizationType } from "@prisma/client";

export enum OrganizationAccessRequestGqlObjectNames {
  ORGANIZATION_ACCESS_REQUEST = "OrganizationAccessRequest",
  PAGINATED_ORGANIZATION_ACCESS_REQUESTS = "PaginatedOrganizationAccessRequests",
  ORGANIZATION_ACCESS_REQUEST_PAGE_INFO = "OrganizationAccessRequestPageInfo",
}

export enum OrganizationAccessRequestGqlInputNames {
  SUBMIT_ORGANIZATION_ACCESS_REQUEST = "SubmitOrganizationAccessRequestInput",
  REVIEW_ORGANIZATION_ACCESS_REQUEST = "ReviewOrganizationAccessRequestInput",
  ORGANIZATION_ACCESS_REQUEST_FILTER = "OrganizationAccessRequestFilterInput",
  ORGANIZATION_ACCESS_REQUEST_PAGINATION = "OrganizationAccessRequestPaginationInput",
}

export enum OrganizationAccessRequestGqlQueryNames {
  ORGANIZATION_ACCESS_REQUESTS = "organizationAccessRequests",
  ORGANIZATION_ACCESS_REQUEST_BY_ID = "organizationAccessRequestById",
}

export enum OrganizationAccessRequestGqlMutationNames {
  SUBMIT_ORGANIZATION_ACCESS_REQUEST = "submitOrganizationAccessRequest",
  REVIEW_ORGANIZATION_ACCESS_REQUEST = "reviewOrganizationAccessRequest",
}

registerEnumType(OrganizationAccessRequestStatus, {
  name: "OrganizationAccessRequestStatus",
});

registerEnumType(OrganizationType, {
  name: "OrganizationType",
});
