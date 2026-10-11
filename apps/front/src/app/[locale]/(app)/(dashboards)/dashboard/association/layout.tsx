import { AssociationRouteGuard } from "@guards/dashboard-route-guards";
import { ReactNode } from "react";

const AssociationDashboardLayout = ({ children }: { children: ReactNode }) => {
  return <AssociationRouteGuard>{children}</AssociationRouteGuard>;
};

export default AssociationDashboardLayout;
