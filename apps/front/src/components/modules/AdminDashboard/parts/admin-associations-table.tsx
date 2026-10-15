"use client";

import { TAdminAssociationsTable } from "@/types/admin-dashboard.types";
import { DataTableFilters } from "@elements/data-table/data-table-filters";
import { UserStatus } from "@/lib/graphql/base";
import { formatDate } from "@/utils/function-helper";
import { DataTable } from "@elements/data-table/data-table";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import type { DataTableRowAction } from "@/types/data-table.types";

import * as L from "lucide-react";

const ASSOCIATIONS = "adminDashboard.associations";
const ALL = "ALL";

const ownerStatusVariant = (status: UserStatus) => {
  if (status === UserStatus.Active) return "default" as const;
  if (status === UserStatus.Pending) return "secondary" as const;
  return "destructive" as const;
};

export const AdminAssociationsTable = ({ hook }: TAdminAssociationsTable) => {
  const {
    t,
    page,
    query,
    items,
    resend,
    search,
    refresh,
    nextPage,
    setSearch,
    isFiltered,
    isDeleting,
    openCreate,
    totalCount,
    ownerStatus,
    hasNextPage,
    isResending,
    previousPage,
    resetFilters,
    setOwnerStatus,
    hasActiveFilters,
    deleteAssociation,
    ownerStatusOptions,
  } = hook;

  return (
    <GlassCard>
      <DataTable
        rows={items}
        rowKey={(item) => item.id}
        rowLabel={(item) => item.name}
        isFiltered={isFiltered}
        isLoading={query.isLoading}
        isFetching={query.isFetching}
        error={
          query.isError
            ? {
                icon: L.CircleAlert,
                title: t(`${ASSOCIATIONS}.error`),
                action: (
                  <Button
                    radius="lg"
                    type="button"
                    variant="outline"
                    onClick={() => void refresh()}
                  >
                    <L.RefreshCcw aria-hidden />
                    {t("common.refresh")}
                  </Button>
                ),
              }
            : null
        }
        caption={t(`${ASSOCIATIONS}.title`)}
        pagination={{
          kind: "cursor",
          page,
          hasNextPage,
          onNext: nextPage,
          total: totalCount,
          onPrevious: previousPage,
        }}
        empty={{
          icon: L.Landmark,
          title: t(`${ASSOCIATIONS}.empty`),
          action: (
            <Button radius="lg" type="button" onClick={openCreate}>
              <L.Plus aria-hidden />
              {t(`${ASSOCIATIONS}.actions.create`)}
            </Button>
          ),
        }}
        filteredEmpty={{
          icon: L.SearchX,
          title: t(`${ASSOCIATIONS}.noResults`),
          action: (
            <Button
              radius="lg"
              type="button"
              variant="outline"
              onClick={resetFilters}
            >
              <L.FilterX aria-hidden />
              {t("common.reset")}
            </Button>
          ),
        }}
        toolbar={
          <DataTableFilters
            onReset={resetFilters}
            isFiltered={hasActiveFilters}
            search={{
              value: search,
              onChange: setSearch,
              label: t(`${ASSOCIATIONS}.filters.search`),
              placeholder: t(`${ASSOCIATIONS}.filters.search`),
            }}
            filters={[
              {
                type: "select",
                id: "ownerStatus",
                value: ownerStatus,
                defaultValue: ALL,
                label: t(`${ASSOCIATIONS}.filters.ownerStatus`),
                onChange: (value) =>
                  setOwnerStatus(
                    ownerStatusOptions.find((option) => option === value) ??
                      ALL,
                  ),
                options: ownerStatusOptions.map((option) => ({
                  value: option,
                  label: t(`${ASSOCIATIONS}.ownerStatus.${option}`),
                })),
              },
            ]}
          />
        }
        columns={[
          {
            id: "association",
            mobile: "title",
            header: t(`${ASSOCIATIONS}.table.association`),
            cell: (item) => (
              <span className="block">
                <span className="block font-medium">{item.name}</span>
                {item.country ? (
                  <span className="block text-xs font-normal text-muted-foreground">
                    {item.country}
                  </span>
                ) : null}
              </span>
            ),
          },
          {
            id: "ownerStatus",
            mobile: "badge",
            header: t(`${ASSOCIATIONS}.table.ownerStatus`),
            cell: (item) => (
              <Badge variant={ownerStatusVariant(item.ownerStatus)}>
                {t(`${ASSOCIATIONS}.ownerStatus.${item.ownerStatus}`)}
              </Badge>
            ),
          },
          {
            id: "representative",
            header: t(`${ASSOCIATIONS}.table.representative`),
            cell: (item) => item.ownerFullName ?? "—",
          },
          {
            id: "workEmail",
            mobile: "wide",
            header: t(`${ASSOCIATIONS}.table.workEmail`),
            cell: (item) => item.ownerEmail ?? item.contactEmail ?? "—",
          },
          {
            id: "createdAt",
            header: t(`${ASSOCIATIONS}.table.createdAt`),
            cell: (item) => formatDate(item.createdAt) ?? "—",
          },
        ]}
        rowActions={(item) => {
          const actions: DataTableRowAction[] = [];

          if (item.ownerStatus === UserStatus.Pending)
            actions.push({
              id: "resend",
              icon: L.Send,
              isPending: isResending,
              label: t(`${ASSOCIATIONS}.actions.resend`),
              onSelect: () => resend(item),
              confirm: {
                title: t(`${ASSOCIATIONS}.resend.title`),
                description: t(`${ASSOCIATIONS}.resend.description`, {
                  name: item.name,
                }),
                confirmLabel: t(`${ASSOCIATIONS}.resend.confirm`),
                cancelLabel: t("common.cancel"),
              },
            });

          actions.push({
            id: "delete",
            tone: "danger",
            icon: L.Trash2,
            isPending: isDeleting,
            label: t(`${ASSOCIATIONS}.actions.delete`),
            onSelect: () => deleteAssociation(item),
            confirm: {
              title: t(`${ASSOCIATIONS}.confirmDelete.title`),
              description: t(`${ASSOCIATIONS}.confirmDelete.description`, {
                name: item.name,
              }),
              confirmLabel: t("common.confirm"),
              cancelLabel: t("common.cancel"),
            },
          });

          return actions;
        }}
      />
    </GlassCard>
  );
};
