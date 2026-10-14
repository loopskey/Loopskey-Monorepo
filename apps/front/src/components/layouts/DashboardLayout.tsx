"use client";

import { DashboardDrawerProvider } from "@/providers/dashboard-drawer-provider";
import { MobileDashboardDrawer } from "@layouts/parts/MobileDashboardDrawer";
import { useDashboardDrawer } from "@/providers/dashboard-drawer-provider";
import { DashboardSidebar } from "@layouts/parts/DashboardSidebar";
import { DashboardTopBar } from "@layouts/parts/DashboardTopBar";
import { ReactNode } from "react";
import { useI18n } from "@/hooks/useI18n";
import { cn } from "@/lib/utils";

const DashboardFrame = ({ children }: { children: ReactNode }) => {
  const { t } = useI18n();
  const { isOpen, close } = useDashboardDrawer();

  return (
    <div className="min-h-dvh overflow-x-clip bg-primary">
      <MobileDashboardDrawer />

      <div
        className={cn(
          "relative flex min-h-dvh flex-col bg-background transition-transform duration-300 ease-out motion-reduce:transition-none",
          isOpen && "translate-x-[280px] lg:translate-x-0",
        )}
      >
        <DashboardTopBar />
        <div className="flex min-h-0 flex-1">
          <DashboardSidebar />
          <main
            id="dashboard-main"
            tabIndex={-1}
            className="min-w-0 flex-1 bg-background px-3 py-4 outline-none md:px-6 md:py-6"
          >
            <div className="mx-auto max-w-7xl max-lg:[&>section:first-child]:text-center max-lg:[&>div>section:first-child]:text-center">
              {children}
            </div>
          </main>
        </div>

        {isOpen ? (
          <button
            type="button"
            tabIndex={-1}
            onClick={close}
            aria-label={t("dashboardShell.closeMenu")}
            className="fixed inset-0 z-40 cursor-pointer bg-transparent lg:hidden"
          />
        ) : null}
      </div>
    </div>
  );
};

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  return (
    <DashboardDrawerProvider>
      <DashboardFrame>{children}</DashboardFrame>
    </DashboardDrawerProvider>
  );
};

export default DashboardLayout;
