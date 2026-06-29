import { OrganizationAccessRequestStatus } from "@prisma/client";
import { OrganizationType } from "@prisma/client";

export type FindOrganizationAccessRequestsParams = {
  page?: number;
  limit?: number;
  search?: string;
  organizationType?: OrganizationType;
  status?: OrganizationAccessRequestStatus;
};

export type TemporaryOrganizationCredential = {
  email: string;
  temporaryPassword: string;
};
