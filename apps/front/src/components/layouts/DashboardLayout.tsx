"use client";

import { DashboardSidebar } from "@layouts/parts/DashboardSidebar";
import { ReactNode } from "react";

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex h-[calc(100dvh-5rem)] overflow-hidden">
      <DashboardSidebar />
      <main className="min-w-0 flex-1 overflow-y-auto bg-background px-3 py-4 md:px-6 md:py-6">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
