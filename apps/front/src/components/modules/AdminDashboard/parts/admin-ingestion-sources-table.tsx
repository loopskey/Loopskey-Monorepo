"use client";

import { TUseAdminIngestionTab } from "@hooks/useAdminIngestionTab";
import { DashboardContentSkeleton } from "@layouts/parts/DashboardSkeleton";
import { Td, Th } from "@modules/AdminDashboard/parts/td-and-th-table";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import * as L from "lucide-react";

const COLUMN_COUNT = 6;

export const AdminIngestionSourcesTable = ({
  hook,
}: {
  hook: TUseAdminIngestionTab;
}) => {
  const { t, sourcesQuery, sourceHasActiveFilters, openSourceDetail } = hook;
  const items = sourcesQuery.data?.items ?? [];

  if (sourcesQuery.isLoading) return <DashboardContentSkeleton />;

  return (
    <GlassCard className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-sm">
          <thead className="border-b border-border bg-muted/40 text-left">
            <tr>
              <Th>{t("adminDashboard.ingestion.sources.table.slug")}</Th>
              <Th>{t("adminDashboard.ingestion.sources.table.name")}</Th>
              <Th>{t("adminDashboard.ingestion.sources.table.kind")}</Th>
              <Th>{t("adminDashboard.ingestion.sources.table.autoPublish")}</Th>
              <Th>{t("adminDashboard.ingestion.sources.table.status")}</Th>
              <Th>{t("adminDashboard.ingestion.sources.table.actions")}</Th>
            </tr>
          </thead>

          <tbody>
            {sourcesQuery.isError ? (
              <tr>
                <td
                  colSpan={COLUMN_COUNT}
                  className="p-10 text-center text-destructive"
                >
                  {t("adminDashboard.ingestion.sources.error")}
                </td>
              </tr>
            ) : items.length ? (
              items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-border/70 transition-colors hover:bg-primary/5"
                >
                  <Td>
                    <code className="text-xs">{item.slug}</code>
                  </Td>
                  <Td>{item.name}</Td>
                  <Td>
                    <Badge variant="secondary" className="rounded-full">
                      {item.kind}
                    </Badge>
                  </Td>
                  <Td>
                    {item.autoPublish
                      ? t("common.yes")
                      : t("common.no")}
                  </Td>
                  <Td>
                    <Badge
                      variant={item.isActive ? "default" : "secondary"}
                      className="rounded-full"
                    >
                      {item.isActive
                        ? t("adminDashboard.ingestion.sources.filters.active")
                        : t("adminDashboard.ingestion.sources.filters.inactive")}
                    </Badge>
                  </Td>
                  <Td>
                    <Button
                      radius="xl"
                      size="sm"
                      type="button"
                      variant="outline"
                      onClick={() => openSourceDetail(item.id)}
                    >
                      <L.Settings2 className="h-4 w-4" />
                      {t("adminDashboard.ingestion.sources.table.manage")}
                    </Button>
                  </Td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={COLUMN_COUNT} className="p-10 text-center">
                  <L.DatabaseZap className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                  <p className="font-medium">
                    {t(
                      sourceHasActiveFilters
                        ? "adminDashboard.ingestion.sources.emptyFiltered"
                        : "adminDashboard.ingestion.sources.empty",
                    )}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
};
