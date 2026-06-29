"use client";

import { RoleRouteGuard } from "@guards/role-route-guards";
import { ReactNode } from "react";
import { Role } from "@/lib/graphql/generated";

export const ProfessionalRouteGuard = ({
  children,
}: {
  children: ReactNode;
}) => {
  return (
    <RoleRouteGuard allowedRoles={[Role.Professional]}>
      {children}
    </RoleRouteGuard>
  );
};

export const ProviderRouteGuard = ({ children }: { children: ReactNode }) => {
  return (
    <RoleRouteGuard allowedRoles={[Role.Provider]}>{children}</RoleRouteGuard>
  );
};

export const OrganizationRouteGuard = ({
  children,
}: {
  children: ReactNode;
}) => {
  return (
    <RoleRouteGuard allowedRoles={[Role.Organization]}>
      {children}
    </RoleRouteGuard>
  );
};

export const AdminRouteGuard = ({ children }: { children: ReactNode }) => {
  return (
    <RoleRouteGuard allowedRoles={[Role.Admin]}>{children}</RoleRouteGuard>
  );
};
