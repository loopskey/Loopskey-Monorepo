"use client";

import { AdminIngestionSourceCreateDialog } from "@modules/AdminDashboard/parts/admin-ingestion-source-create-dialog";
import { AdminIngestionSourceDetail } from "@modules/AdminDashboard/parts/admin-ingestion-source-detail";
import { AdminIngestionSourcesTable } from "@modules/AdminDashboard/parts/admin-ingestion-sources-table";
import { AdminIngestionReviewQueue } from "@modules/AdminDashboard/parts/admin-ingestion-review-queue";
import { useAdminIngestionTab } from "@hooks/useAdminIngestionTab";
import { Button } from "@ui/button";

import * as L from "lucide-react";

const AdminIngestionTab = () => {
  const hook = useAdminIngestionTab();

  const { t, view, setView, selectedSourceId } = hook;

  if (selectedSourceId) return <AdminIngestionSourceDetail hook={hook} />;

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-medium text-primary">
            {t("adminDashboard.ingestion.eyebrow")}
          </p>

          <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
            {t("adminDashboard.ingestion.title")}
          </h1>

          <p className="mt-2 max-w-3xl text-muted-foreground">
            {t("adminDashboard.ingestion.description")}
          </p>
        </div>

        <div
          role="tablist"
          aria-label={t("adminDashboard.ingestion.viewSwitchLabel")}
          className="flex w-fit gap-1 rounded-full border p-1"
        >
          <Button
            role="tab"
            radius="full"
            type="button"
            aria-selected={view === "sources"}
            onClick={() => setView("sources")}
            variant={view === "sources" ? "default" : "ghost"}
          >
            <L.Database className="h-4 w-4" />
            {t("adminDashboard.ingestion.tabs.sources")}
          </Button>

          <Button
            role="tab"
            radius="full"
            type="button"
            aria-selected={view === "review"}
            onClick={() => setView("review")}
            variant={view === "review" ? "default" : "ghost"}
          >
            <L.ListChecks className="h-4 w-4" />
            {t("adminDashboard.ingestion.tabs.review")}
          </Button>
        </div>
      </section>

      {view === "sources" ? <AdminIngestionSourcesTable hook={hook} /> : null}
      {view === "review" ? <AdminIngestionReviewQueue hook={hook} /> : null}

      <AdminIngestionSourceCreateDialog hook={hook} />
    </div>
  );
};

export default AdminIngestionTab;
