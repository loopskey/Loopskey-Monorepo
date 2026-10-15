"use client";

import { CertificateStatusBadge } from "@modules/ProfessionalDashboard/parts/certificate-status-badge";
import { DataTableFilters } from "@elements/data-table/data-table-filters";
import { CertificateSort } from "@/lib/graphql/base";
import { formatDate } from "@/utils/function-helper";
import { DataTable } from "@elements/data-table/data-table";
import { Button } from "@ui/button";

import type { TCertificateStatusFilter } from "@/types/professional-dashboard.types";
import type { CertificatesTableProps } from "@/types/professional-tables.types";

import * as H from "@/utils/certificates.helper";
import * as L from "lucide-react";

const CERTIFICATES = "professionalDashboard.certificates";
const FILTERS = `${CERTIFICATES}.filters`;

const toStatusFilter = (value: string): TCertificateStatusFilter =>
  H.CERTIFICATE_STATUS_OPTIONS.find((status) => status === value) ??
  H.CERTIFICATE_ANY;

const toSort = (value: string): CertificateSort =>
  H.CERTIFICATE_SORT_OPTIONS.find((sort) => sort === value) ??
  CertificateSort.Recent;

export const CertificatesTable = ({ hook }: CertificatesTableProps) => {
  const {
    t,
    data,
    page,
    filters,
    isError,
    pageInfo,
    isLoading,
    isFetching,
    isFiltered,
    handleNext,
    handleEdit,
    selectedId,
    isDeleting,
    planOptions,
    handleSelect,
    handleDelete,
    handleUpload,
    certificates,
    issuerOptions,
    handlePrevious,
    isPlansLoading,
    isIssuersLoading,
    handleFilterChange,
    handleResetFilters,
    handleRetryAfterError,
    deletingCertificateId,
  } = hook;

  return (
    <DataTable
      rows={certificates}
      isLoading={isLoading}
      isFetching={isFetching}
      isFiltered={isFiltered}
      selectedRowKey={selectedId}
      rowKey={(certificate) => certificate.id}
      rowLabel={(certificate) => certificate.title}
      onRowClick={(certificate) => handleSelect(certificate.id)}
      caption={t(`${CERTIFICATES}.table.caption`)}
      pagination={{
        kind: "cursor",
        page,
        onNext: handleNext,
        total: data?.totalCount,
        onPrevious: handlePrevious,
        hasNextPage: Boolean(pageInfo?.hasNextPage),
      }}
      error={
        isError
          ? {
              icon: L.CircleAlert,
              title: t(`${CERTIFICATES}.errorTitle`),
              description: t(`${CERTIFICATES}.errorDescription`),
              action: (
                <Button
                  radius="lg"
                  type="button"
                  variant="outline"
                  onClick={handleRetryAfterError}
                >
                  <L.RefreshCw aria-hidden />
                  {t("professionalDashboard.common.refresh")}
                </Button>
              ),
            }
          : null
      }
      empty={{
        icon: L.Award,
        title: t(`${CERTIFICATES}.emptyTitle`),
        description: t(`${CERTIFICATES}.emptyDescription`),
        action: (
          <Button radius="lg" type="button" onClick={handleUpload}>
            <L.UploadCloud aria-hidden />
            {t(`${CERTIFICATES}.uploadCertificate`)}
          </Button>
        ),
      }}
      filteredEmpty={{
        icon: L.SearchX,
        title: t(`${CERTIFICATES}.noMatchTitle`),
        description: t(`${CERTIFICATES}.noMatchDescription`),
        action: (
          <Button
            radius="lg"
            type="button"
            variant="outline"
            onClick={handleResetFilters}
          >
            <L.FilterX aria-hidden />
            {t(`${FILTERS}.clear`)}
          </Button>
        ),
      }}
      toolbar={
        <DataTableFilters
          isFiltered={isFiltered}
          onReset={handleResetFilters}
          search={{
            value: filters.search,
            label: t(`${FILTERS}.searchPlaceholder`),
            placeholder: t(`${FILTERS}.searchPlaceholder`),
            onChange: (value) => handleFilterChange("search", value),
          }}
          filters={[
            {
              type: "select",
              id: "status",
              label: t(`${FILTERS}.status`),
              value: filters.status,
              defaultValue: H.CERTIFICATE_ANY,
              options: [
                { value: H.CERTIFICATE_ANY, label: t(`${FILTERS}.anyStatus`) },
                ...H.CERTIFICATE_STATUS_OPTIONS.map((status) => ({
                  value: status,
                  label: t(`${CERTIFICATES}.statuses.${status}`),
                })),
              ],
              onChange: (value) =>
                handleFilterChange("status", toStatusFilter(value)),
            },
            {
              type: "select",
              id: "issuer",
              label: t(`${FILTERS}.issuer`),
              value: filters.issuer,
              isDisabled: isIssuersLoading,
              defaultValue: H.CERTIFICATE_ANY,
              options: [
                { value: H.CERTIFICATE_ANY, label: t(`${FILTERS}.anyIssuer`) },
                ...issuerOptions.map((issuer) => ({
                  value: issuer,
                  label: issuer,
                })),
              ],
              onChange: (value) => handleFilterChange("issuer", value),
            },
            {
              type: "select",
              id: "cpdPlan",
              label: t(`${FILTERS}.cpdPlan`),
              value: filters.cpdPlan,
              isDisabled: isPlansLoading,
              defaultValue: H.CERTIFICATE_ANY,
              options: [
                { value: H.CERTIFICATE_ANY, label: t(`${FILTERS}.anyPlan`) },
                {
                  value: H.CERTIFICATE_PLAN_NONE,
                  label: t(`${FILTERS}.noPlan`),
                },
                ...planOptions.map((plan) => ({
                  value: plan.id,
                  label: plan.name,
                })),
              ],
              onChange: (value) => handleFilterChange("cpdPlan", value),
            },
            {
              type: "select",
              id: "sort",
              label: t(`${FILTERS}.sort`),
              value: filters.sort,
              defaultValue: CertificateSort.Recent,
              options: H.CERTIFICATE_SORT_OPTIONS.map((sort) => ({
                value: sort,
                label: t(`${FILTERS}.sorts.${sort}`),
              })),
              onChange: (value) => handleFilterChange("sort", toSort(value)),
            },
          ]}
        />
      }
      columns={[
        {
          id: "certificate",
          mobile: "title",
          className: "max-w-72",
          header: t(`${CERTIFICATES}.table.certificate`),
          cell: (certificate) => (
            <span className="block min-w-0">
              <span
                className="block truncate font-medium"
                title={certificate.title}
              >
                {certificate.title}
              </span>
              {certificate.certificateNumber ? (
                <span className="block truncate text-xs font-normal text-muted-foreground">
                  {certificate.certificateNumber}
                </span>
              ) : null}
            </span>
          ),
        },
        {
          id: "status",
          mobile: "badge",
          header: t(`${CERTIFICATES}.table.status`),
          cell: (certificate) => (
            <CertificateStatusBadge t={t} status={certificate.status} />
          ),
        },
        {
          id: "issuer",
          className: "max-w-48",
          header: t(`${CERTIFICATES}.table.issuer`),
          cell: (certificate) => (
            <span
              className="block truncate text-muted-foreground"
              title={certificate.issuer ?? undefined}
            >
              {certificate.issuer ?? t(`${CERTIFICATES}.unknownIssuer`)}
            </span>
          ),
        },
        {
          id: "issueDate",
          header: t(`${CERTIFICATES}.table.issueDate`),
          cell: (certificate) => formatDate(certificate.issuedAt) ?? "—",
        },
        {
          id: "expiryDate",
          header: t(`${CERTIFICATES}.table.expiryDate`),
          cell: (certificate) =>
            formatDate(certificate.validUntil) ?? t(`${CERTIFICATES}.lifetime`),
        },
        {
          id: "linkedTo",
          className: "max-w-48",
          header: t(`${CERTIFICATES}.table.linkedTo`),
          cell: (certificate) =>
            certificate.cpdPlanName ? (
              <span className="block truncate" title={certificate.cpdPlanName}>
                {certificate.cpdPlanName}
              </span>
            ) : (
              <span className="text-muted-foreground">
                {t(`${CERTIFICATES}.table.notLinked`)}
              </span>
            ),
        },
      ]}
      rowActions={(certificate) => [
        {
          id: "edit",
          icon: L.Pencil,
          isDisabled: isDeleting,
          label: t(`${CERTIFICATES}.actions.edit`),
          onSelect: () => handleEdit(certificate.id),
        },
        {
          id: "delete",
          tone: "danger",
          icon: L.Trash2,
          isDisabled: isDeleting,
          label: t(`${CERTIFICATES}.actions.delete`),
          isPending: deletingCertificateId === certificate.id,
          onSelect: () => handleDelete(certificate.id),
          confirm: {
            title: t(`${CERTIFICATES}.deleteTitle`),
            description: t(`${CERTIFICATES}.deleteDescription`),
            confirmLabel: t("common.delete"),
            cancelLabel: t("common.cancel"),
          },
        },
      ]}
    />
  );
};
