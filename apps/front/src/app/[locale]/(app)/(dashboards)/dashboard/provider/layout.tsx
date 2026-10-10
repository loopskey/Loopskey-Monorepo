import { ProviderRouteGuard } from "@guards/dashboard-route-guards";
import { ReactNode } from "react";

const ProviderDashboardLayout = ({ children }: { children: ReactNode }) => {
  return <ProviderRouteGuard>{children}</ProviderRouteGuard>;
};

export default ProviderDashboardLayout;
