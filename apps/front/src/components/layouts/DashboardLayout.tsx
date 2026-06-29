"use client";

import { DashboardBottomNav } from "@layouts/parts/DashboardBottomNav";
import { DashboardSidebar } from "@layouts/parts/DashboardSidebar";
import { ReactNode } from "react";

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen">
      <div className="flex min-h-screen overflow-hidden">
        <DashboardSidebar />
        <main className="min-w-0 flex-1 overflow-y-auto px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
      <DashboardBottomNav />
    </div>
  );
};

export default DashboardLayout;
