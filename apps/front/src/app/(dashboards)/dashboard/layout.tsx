import { SuspenseBoundary } from "@elements/suspense-boundry";
import { ReactNode } from "react";

import DashboardLayout from "@layouts/DashboardLayout";

const DashboardRootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <SuspenseBoundary>
      <DashboardLayout>{children}</DashboardLayout>
    </SuspenseBoundary>
  );
};

export default DashboardRootLayout;
