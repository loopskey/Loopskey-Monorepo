"use client";

import { useAdminOrganizationUsersTab } from "@/hooks/useAdminOrgUsersTab";
import { Button } from "@ui/button";

import * as L from "lucide-react";

type Props = {
  hook: ReturnType<typeof useAdminOrganizationUsersTab>;
};

export const AdminOrganizationUsersHeader = ({ hook }: Props) => {
  const { t, isLoading, refreshAll, resetOrgFilters, hasActiveOrgFilters } =
    hook;

  return (
    <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
      <div>
        <p className="text-sm font-medium text-primary">
          {t("adminDashboard.organizationUsers.eyebrow")}
        </p>

        <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
          {t("adminDashboard.organizationUsers.title")}
        </h1>

        <p className="mt-2 max-w-3xl text-muted-foreground">
          {t("adminDashboard.organizationUsers.description")}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          radius="xl"
          type="button"
          variant="glass"
          disabled={!hasActiveOrgFilters || isLoading}
          onClick={resetOrgFilters}
        >
          <L.RotateCcw className="h-4 w-4" />
          {t("common.reset")}
        </Button>

        <Button
          radius="xl"
          type="button"
          variant="glass"
          disabled={isLoading}
          onClick={refreshAll}
        >
          <L.RefreshCcw className="h-4 w-4" />
          {t("common.refresh")}
        </Button>
      </div>
    </section>
  );
};
