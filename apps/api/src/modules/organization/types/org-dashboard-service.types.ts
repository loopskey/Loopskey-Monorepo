import { Role } from "@prisma/client";

export type TOrganizationDashboardUser = {
  id: string;
  role: Role;
};

export type TResolvedOrganizationAccess = {
  ownerId: string;
  organizationId: string;
};

export type TResolverUser = { id?: string; sub?: string; role: Role };
