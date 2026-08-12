import type { ReactNode } from "react";
import type { Role } from "@/lib/graphql/base";

export type TSessionPayload = {
  sub?: string;
  role?: string;
};

export type TRoleRouteGuardProps = {
  children: ReactNode;
  allowedRoles: Role[];
  redirectUnauthorizedTo?: string;
  redirectUnauthenticatedTo?: string;
};
