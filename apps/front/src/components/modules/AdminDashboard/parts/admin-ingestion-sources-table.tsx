"use client";

import { TUseAdminIngestionTab } from "@hooks/useAdminIngestionTab";
import { sourceActiveOptions } from "@hooks/useAdminIngestionTab";
import { sourceKindOptions } from "@hooks/useAdminIngestionTab";
import { DataTableFilters } from "@elements/data-table/data-table-filters";
import { DataTable } from "@elements/data-table/data-table";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import * as L from "lucide-react";

const SOURCES = "adminDashboard.ingestion.sources";
const ALL = "ALL";

export const AdminIngestionSourcesTable = ({
  hook,
}: {
  hook: TUseAdminIngestionTab;
}) => {
  const {
    t,
    openCreate,
    sourceKind,
    sourcePage,
    sourceActive,
    sourceSearch,
    sourcesQuery,
    setSourceKind,
    sourceNextPage,
    setSourceActive,
    setSourceSearch,
    openSourceDetail,
    resetSourceFilters,
    sourcePreviousPage,
    sourceHasActiveFilters,
  } = hook;

  const statusLabel = (value: (typeof sourceActiveOptions)[number]) => {
    if (value === "ACTIVE") return t(`${SOURCES}.filters.active`);
    if (value === "INACTIVE") return t(`${SOURCES}.filters.inactive`);
    return t(`${SOURCES}.filters.allStatuses`);
  };

  return (
    <GlassCard>
      <DataTable
        rowKey={(item) => item.id}
        rowLabel={(item) => item.name}
        isLoading={sourcesQuery.isLoading}
        isFiltered={sourceHasActiveFilters}
        isFetching={sourcesQuery.isFetching}
        rows={sourcesQuery.data?.items ?? []}
        onRowClick={(item) => openSourceDetail(item.id)}
        caption={t("adminDashboard.ingestion.tabs.sources")}
        error={
          sourcesQuery.isError
            ? {
                icon: L.CircleAlert,
                title: t(`${SOURCES}.error`),
                action: (
                  <Button
                    radius="lg"
                    type="button"
                    variant="outline"
                    onClick={() => void sourcesQuery.refetch()}
                  >
                    <L.RefreshCcw aria-hidden />
                    {t("common.refresh")}
                  </Button>
                ),
              }
            : null
        }
        empty={{
          icon: L.DatabaseZap,
          title: t(`${SOURCES}.empty`),
          action: (
            <Button radius="lg" type="button" onClick={openCreate}>
              <L.Plus aria-hidden />
              {t(`${SOURCES}.create.action`)}
            </Button>
          ),
        }}
        filteredEmpty={{
          icon: L.SearchX,
          title: t(`${SOURCES}.emptyFiltered`),
          action: (
            <Button
              radius="lg"
              type="button"
              variant="outline"
              onClick={resetSourceFilters}
            >
              <L.FilterX aria-hidden />
              {t("common.reset")}
            </Button>
          ),
        }}
        pagination={{
          kind: "cursor",
          page: sourcePage,
          onNext: sourceNextPage,
          onPrevious: sourcePreviousPage,
          total: sourcesQuery.data?.totalCount ?? 0,
          hasNextPage: sourcesQuery.data?.pageInfo?.hasNextPage ?? false,
        }}
        toolbar={
          <DataTableFilters
            onReset={resetSourceFilters}
            isFiltered={sourceHasActiveFilters}
            actions={
              <Button radius="lg" type="button" onClick={openCreate}>
                <L.Plus aria-hidden />
                {t(`${SOURCES}.create.action`)}
              </Button>
            }
            search={{
              value: sourceSearch,
              onChange: setSourceSearch,
              label: t(`${SOURCES}.searchPlaceholder`),
              placeholder: t(`${SOURCES}.searchPlaceholder`),
            }}
            filters={[
              {
                type: "select",
                id: "kind",
                value: sourceKind,
                defaultValue: ALL,
                label: t(`${SOURCES}.filters.kind`),
                onChange: (value) =>
                  setSourceKind(
                    sourceKindOptions.find((option) => option === value) ?? ALL,
                  ),
                options: sourceKindOptions.map((option) => ({
                  value: option,
                  label:
                    option === ALL ? t(`${SOURCES}.filters.allKinds`) : option,
                })),
              },
              {
                type: "select",
                id: "status",
                value: sourceActive,
                defaultValue: ALL,
                label: t(`${SOURCES}.filters.status`),
                onChange: (value) =>
                  setSourceActive(
                    sourceActiveOptions.find((option) => option === value) ??
                      ALL,
                  ),
                options: sourceActiveOptions.map((option) => ({
                  value: option,
                  label: statusLabel(option),
                })),
              },
            ]}
          />
        }
        columns={[
          {
            id: "name",
            mobile: "title",
            header: t(`${SOURCES}.table.name`),
            cell: (item) => (
              <span className="block">
                <span className="block font-medium">{item.name}</span>
                <code className="block text-xs font-normal text-muted-foreground">
                  {item.slug}
                </code>
              </span>
            ),
          },
          {
            id: "status",
            mobile: "badge",
            header: t(`${SOURCES}.table.status`),
            cell: (item) => (
              <Badge variant={item.isActive ? "default" : "secondary"}>
                {item.isActive
                  ? t(`${SOURCES}.filters.active`)
                  : t(`${SOURCES}.filters.inactive`)}
              </Badge>
            ),
          },
          {
            id: "kind",
            header: t(`${SOURCES}.table.kind`),
            cell: (item) => <Badge variant="secondary">{item.kind}</Badge>,
          },
          {
            id: "autoPublish",
            header: t(`${SOURCES}.table.autoPublish`),
            cell: (item) =>
              item.autoPublish ? t("common.yes") : t("common.no"),
          },
        ]}
        rowActions={(item) => [
          {
            id: "manage",
            icon: L.Settings2,
            label: t(`${SOURCES}.table.manage`),
            onSelect: () => openSourceDetail(item.id),
          },
        ]}
      />
    </GlassCard>
  );
};
