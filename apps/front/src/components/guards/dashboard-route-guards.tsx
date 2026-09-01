"use client";

import { RoleRouteGuard } from "@guards/role-route-guards";
import { ReactNode } from "react";
import { Role } from "@/lib/graphql/base";

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

export const AssociationRouteGuard = ({
  children,
}: {
  children: ReactNode;
}) => {
  return (
    <RoleRouteGuard allowedRoles={[Role.Association]}>
      {children}
    </RoleRouteGuard>
  );
};

export const AdminRouteGuard = ({ children }: { children: ReactNode }) => {
  return (
    <RoleRouteGuard allowedRoles={[Role.Admin]}>{children}</RoleRouteGuard>
  );
};
