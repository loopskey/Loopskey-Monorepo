import { noindexMetadata } from "@/lib/site/page-metadata";
import { SuspenseBoundary } from "@elements/suspense-boundry";
import { ReactNode } from "react";

export const metadata = noindexMetadata();

import DashboardLayout from "@layouts/DashboardLayout";

const DashboardRootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <SuspenseBoundary>
      <DashboardLayout>{children}</DashboardLayout>
    </SuspenseBoundary>
  );
};

export default DashboardRootLayout;
