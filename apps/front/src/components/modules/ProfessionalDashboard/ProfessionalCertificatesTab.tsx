"use client";

import { useProfessionalCertificates } from "@/hooks/useProfessionalCertificate";
import { CertificateSummaryCards } from "@modules/ProfessionalDashboard/parts/certificate-summary-cards";
import { CertificateDetailCard } from "@modules/ProfessionalDashboard/parts/certificate-detail-card";
import { CertificatesFilters } from "@modules/ProfessionalDashboard/parts/certificates-filters";
import { CertificatesTable } from "@modules/ProfessionalDashboard/parts/certificates-table";
import { ContentPagination } from "@elements/pagination";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";

import * as L from "lucide-react";

const CERTIFICATES = "professionalDashboard.certificates";

const ProfessionalCertificatesTab = () => {
  const {
    t,
    data,
    page,
    filters,
    summary,
    isError,
    pageInfo,
    isLoading,
    isFetching,
    isFiltered,
    handleNext,
    handleEdit,
    selectedId,
    planOptions,
    handleSelect,
    handleDelete,
    handleUpload,
    certificates,
    handleViewAll,
    issuerOptions,
    handleRefresh,
    handleDownload,
    isPlansLoading,
    handlePrevious,
    isSummaryError,
    isIssuersLoading,
    handleViewActive,
    isSummaryLoading,
    downloadingFileId,
    handleViewExpiring,
    handleFilterChange,
    handleResetFilters,
    wasSelectionDeleted,
    selectedCertificate,
    deletingCertificateId,
    isDeleting,
  } = useProfessionalCertificates();

  return (
    <div className="space-y-6">
      {/* 1. Page title and primary action */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <p className="text-sm font-medium text-primary">
            {t(`${CERTIFICATES}.eyebrow`)}
          </p>

          <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
            {t(`${CERTIFICATES}.title`)}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {t(`${CERTIFICATES}.subtitle`)}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            radius="xl"
            type="button"
            variant="glass"
            disabled={isFetching}
            onClick={handleRefresh}
          >
            {isFetching ? (
              <L.Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <L.RefreshCw className="h-4 w-4" aria-hidden />
            )}
            {t("professionalDashboard.common.refresh")}
          </Button>

          <Button
            radius="xl"
            type="button"
            variant="brand"
            onClick={handleUpload}
          >
            <L.UploadCloud className="h-4 w-4" aria-hidden />
            {t(`${CERTIFICATES}.uploadCertificate`)}
          </Button>
        </div>
      </div>

      {/* 2. Summary cards */}
      <CertificateSummaryCards
        t={t}
        summary={summary}
        isError={isSummaryError}
        isLoading={isSummaryLoading}
        onViewAll={handleViewAll}
        nearestExpiry={summary?.nearestExpiry ?? null}
        onViewActive={handleViewActive}
        onViewExpiring={handleViewExpiring}
      />

      {/* 3. Filters, table and the selected-certificate detail card */}
      <div className="grid gap-6 xl:grid-cols-3">
        <GlassCard className="xl:col-span-2">
          <div className="mb-6 space-y-5">
            <div>
              <h2 className="text-xl font-medium">
                {t(`${CERTIFICATES}.certificatesList`)}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t(`${CERTIFICATES}.certificatesListDesc`)}
              </p>
            </div>

            <CertificatesFilters
              t={t}
              filters={filters}
              isFiltered={isFiltered}
              planOptions={planOptions}
              onReset={handleResetFilters}
              issuerOptions={issuerOptions}
              onChange={handleFilterChange}
              isPlansLoading={isPlansLoading}
              isIssuersLoading={isIssuersLoading}
            />
          </div>

          {isLoading ? (
            <div className="flex min-h-72 items-center justify-center">
              <L.Loader2
                aria-hidden
                className="h-7 w-7 animate-spin text-primary"
              />
              <span className="sr-only">{t("common.loading")}</span>
            </div>
          ) : isError ? (
            <div
              role="alert"
              className="rounded-[2rem] border border-dashed border-destructive/40 bg-destructive/5 p-10 text-center"
            >
              <L.CircleAlert
                aria-hidden
                className="mx-auto h-10 w-10 text-destructive"
              />
              <h3 className="mt-4 text-xl font-medium">
                {t(`${CERTIFICATES}.errorTitle`)}
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                {t(`${CERTIFICATES}.errorDescription`)}
              </p>
              <Button
                radius="xl"
                type="button"
                variant="glass"
                className="mt-5"
                onClick={handleRefresh}
              >
                <L.RefreshCw className="h-4 w-4" aria-hidden />
                {t("professionalDashboard.common.refresh")}
              </Button>
            </div>
          ) : certificates.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-glass-border bg-background/40 p-10 text-center">
              <L.Award
                aria-hidden
                className="mx-auto h-10 w-10 text-muted-foreground"
              />
              <h3 className="mt-4 text-xl font-medium">
                {isFiltered
                  ? t(`${CERTIFICATES}.noMatchTitle`)
                  : t(`${CERTIFICATES}.emptyTitle`)}
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                {isFiltered
                  ? t(`${CERTIFICATES}.noMatchDescription`)
                  : t(`${CERTIFICATES}.emptyDescription`)}
              </p>

              {isFiltered ? (
                <Button
                  radius="xl"
                  type="button"
                  variant="glass"
                  className="mt-5"
                  onClick={handleResetFilters}
                >
                  <L.FilterX className="h-4 w-4" aria-hidden />
                  {t(`${CERTIFICATES}.filters.clear`)}
                </Button>
              ) : (
                <Button
                  radius="xl"
                  type="button"
                  variant="brand"
                  className="mt-5"
                  onClick={handleUpload}
                >
                  <L.UploadCloud className="h-4 w-4" aria-hidden />
                  {t(`${CERTIFICATES}.uploadCertificate`)}
                </Button>
              )}
            </div>
          ) : (
            <CertificatesTable
              t={t}
              onEdit={handleEdit}
              onSelect={handleSelect}
              onDelete={handleDelete}
              selectedId={selectedId}
              isDeleting={isDeleting}
              certificates={certificates}
              deletingCertificateId={deletingCertificateId}
            />
          )}

          <ContentPagination
            page={page}
            className="mt-6"
            onNext={handleNext}
            canPrevious={page > 1}
            isLoading={isFetching}
            onPrevious={handlePrevious}
            totalCount={data?.totalCount}
            hasNextPage={Boolean(pageInfo?.hasNextPage)}
          />
        </GlassCard>

        <div className="xl:col-span-1">
          {selectedCertificate ? (
            <CertificateDetailCard
              t={t}
              onEdit={handleEdit}
              onDownload={handleDownload}
              certificate={selectedCertificate}
              downloadingFileId={downloadingFileId}
            />
          ) : (
            <GlassCard className="flex min-h-56 flex-col items-center justify-center text-center lg:sticky lg:top-6">
              <L.MousePointerClick
                aria-hidden
                className="h-9 w-9 text-muted-foreground"
              />
              <h3 className="mt-4 font-medium">
                {wasSelectionDeleted
                  ? t(`${CERTIFICATES}.detail.deletedTitle`)
                  : t(`${CERTIFICATES}.detail.emptyTitle`)}
              </h3>
              <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
                {wasSelectionDeleted
                  ? t(`${CERTIFICATES}.detail.deletedDescription`)
                  : t(`${CERTIFICATES}.detail.emptyDescription`)}
              </p>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfessionalCertificatesTab;
