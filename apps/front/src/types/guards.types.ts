import { ReactNode } from "react";
import { Role } from "@/lib/graphql/generated";

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
