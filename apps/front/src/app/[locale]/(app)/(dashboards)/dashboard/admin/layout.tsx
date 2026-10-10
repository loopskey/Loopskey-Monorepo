import { AdminRouteGuard } from "@guards/dashboard-route-guards";
import { ReactNode } from "react";

const AdminDashboardLayout = ({ children }: { children: ReactNode }) => {
  return <AdminRouteGuard>{children}</AdminRouteGuard>;
};

export default AdminDashboardLayout;
