"use client";

import { useAdminOrganizationUsersTab } from "@/hooks/useAdminOrgUsersTab";
import { DataTableFilters } from "@elements/data-table/data-table-filters";
import { DataTable } from "@elements/data-table/data-table";
import { GlassCard } from "@elements/glass-card";

import * as L from "lucide-react";

type Props = {
  hook: ReturnType<typeof useAdminOrganizationUsersTab>;
};

const ORG = "adminDashboard.organizationUsers";

export const AdminOrganizationUsersTable = ({ hook }: Props) => {
  const {
    t,
    orgPage,
    orgSearch,
    isLoading,
    orgCountry,
    hasNextOrg,
    orgIndustry,
    nextOrgPage,
    setOrgFilter,
    organizations,
    previousOrgPage,
    resetOrgFilters,
    organizationsQuery,
    deleteOrganization,
    hasActiveOrgFilters,
    openOrganizationDetail,
  } = hook;

  return (
    <GlassCard>
      <div className="mb-5">
        <h2 className="text-lg font-medium">{t(`${ORG}.filters.title`)}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t(`${ORG}.filters.description`)}
        </p>
      </div>

      <DataTable
        rows={organizations}
        rowKey={(org) => org.id}
        rowLabel={(org) => org.name}
        caption={t(`${ORG}.title`)}
        isFiltered={hasActiveOrgFilters}
        isError={organizationsQuery.isError}
        isLoading={organizationsQuery.isLoading}
        isFetching={organizationsQuery.isFetching}
        onRetry={() => void organizationsQuery.refetch()}
        empty={{ icon: L.Building2, title: t(`${ORG}.empty`) }}
        pagination={{
          kind: "cursor",
          page: orgPage,
          onNext: nextOrgPage,
          hasNextPage: hasNextOrg,
          onPrevious: previousOrgPage,
          total: organizationsQuery.data?.totalCount,
        }}
        toolbar={
          <DataTableFilters
            isFiltered={hasActiveOrgFilters}
            onReset={resetOrgFilters}
            search={{
              value: orgSearch,
              label: t(`${ORG}.search`),
              placeholder: t(`${ORG}.search`),
              onChange: (value) => setOrgFilter("search", value),
            }}
            filters={[
              {
                type: "text",
                id: "country",
                value: orgCountry,
                label: t(`${ORG}.filters.country`),
                onChange: (value) => setOrgFilter("country", value),
              },
              {
                type: "text",
                id: "industry",
                value: orgIndustry,
                label: t(`${ORG}.filters.industry`),
                onChange: (value) => setOrgFilter("industry", value),
              },
            ]}
          />
        }
        columns={[
          {
            id: "organization",
            mobile: "title",
            header: t(`${ORG}.table.organization`),
            cell: (org) => (
              <span className="block">
                <span className="block font-medium">{org.name}</span>
                <span className="block text-xs font-normal text-muted-foreground">
                  {org.ownerName ?? "-"}
                </span>
              </span>
            ),
          },
          {
            id: "email",
            mobile: "wide",
            header: t(`${ORG}.table.email`),
            cell: (org) => org.ownerEmail ?? "-",
          },
          {
            id: "members",
            align: "end",
            header: t(`${ORG}.table.members`),
            cell: (org) => org.totalMembers,
          },
          {
            id: "compliance",
            align: "end",
            header: t(`${ORG}.table.compliance`),
            cell: (org) => `${Number(org.averageCompliance ?? 0).toFixed(2)}%`,
          },
          {
            id: "pdus",
            align: "end",
            header: t(`${ORG}.table.pdus`),
            cell: (org) => Number(org.totalPdus ?? 0).toFixed(2),
          },
        ]}
        rowActions={(org) => [
          {
            id: "details",
            icon: L.Eye,
            label: t(`${ORG}.actions.details`),
            onSelect: () => openOrganizationDetail(org.id),
          },
          {
            id: "delete",
            tone: "danger",
            icon: L.Trash2,
            isPending: isLoading,
            label: t(`${ORG}.actions.delete`),
            onSelect: () => deleteOrganization(org.ownerId),
            confirm: {
              title: t(`${ORG}.confirmDelete.title`),
              description: t(`${ORG}.confirmDelete.description`),
              confirmLabel: t("common.confirm"),
              cancelLabel: t("common.cancel"),
            },
          },
        ]}
      />
    </GlassCard>
  );
};
