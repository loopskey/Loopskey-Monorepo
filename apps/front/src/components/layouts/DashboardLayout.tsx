"use client";

import { DashboardTopBar } from "@layouts/parts/DashboardTopBar";
import { DashboardSidebar } from "@layouts/parts/DashboardSidebar";
import { ReactNode } from "react";

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex min-h-dvh flex-col">
      <DashboardTopBar />
      <div className="flex min-h-0 flex-1">
        <DashboardSidebar />
        <main
          id="dashboard-main"
          tabIndex={-1}
          className="min-w-0 flex-1 bg-background px-3 py-4 outline-none md:px-6 md:py-6"
        >
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
