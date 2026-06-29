import { ProfessionalRouteGuard } from "@guards/dashboard-route-guards";
import { ReactNode } from "react";

const ProfessionalDashboardLayout = ({ children }: { children: ReactNode }) => {
  return <ProfessionalRouteGuard>{children}</ProfessionalRouteGuard>;
};

export default ProfessionalDashboardLayout;
