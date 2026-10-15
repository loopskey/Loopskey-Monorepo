"use client";

import { AdminAssociationCreateDialog } from "@modules/AdminDashboard/parts/admin-association-create-dialog";
import { useAdminAssociationsTab } from "@/hooks/useAdminAssociationsTab";
import { AdminAssociationsTable } from "@modules/AdminDashboard/parts/admin-associations-table";
import { Button } from "@ui/button";

import * as L from "lucide-react";

const AdminAssociationsTab = () => {
  const hook = useAdminAssociationsTab();

  const { t, refresh, isLoading, openCreate } = hook;

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-medium text-primary">
            {t("adminDashboard.associations.eyebrow")}
          </p>

          <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
            {t("adminDashboard.associations.title")}
          </h1>

          <p className="mt-2 max-w-3xl text-muted-foreground">
            {t("adminDashboard.associations.description")}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            radius="xl"
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={() => refresh()}
          >
            <L.RefreshCcw className="h-4 w-4" />
            {t("common.refresh")}
          </Button>

          <Button radius="xl" type="button" onClick={openCreate}>
            <L.Plus className="h-4 w-4" />
            {t("adminDashboard.associations.actions.create")}
          </Button>
        </div>
      </section>

      <AdminAssociationsTable hook={hook} />

      <AdminAssociationCreateDialog hook={hook} />
    </div>
  );
};

export default AdminAssociationsTab;
