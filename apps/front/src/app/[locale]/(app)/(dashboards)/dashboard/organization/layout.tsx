import { OrganizationRouteGuard } from "@guards/dashboard-route-guards";
import { ReactNode } from "react";

const OrganizationDashboardLayout = ({ children }: { children: ReactNode }) => {
  return <OrganizationRouteGuard>{children}</OrganizationRouteGuard>;
};

export default OrganizationDashboardLayout;
