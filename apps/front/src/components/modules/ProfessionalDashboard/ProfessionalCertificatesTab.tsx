"use client";

import { useProfessionalCertificates } from "@/hooks/useProfessionalCertificate";
import { CertificateSummaryStrip } from "@modules/ProfessionalDashboard/parts/certificate-summary-strip";
import { CertificateDetailCard } from "@modules/ProfessionalDashboard/parts/certificate-detail-card";
import { CertificatesTable } from "@modules/ProfessionalDashboard/parts/certificates-table";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";

import * as L from "lucide-react";

const CERTIFICATES = "professionalDashboard.certificates";

const ProfessionalCertificatesTab = () => {
  const hook = useProfessionalCertificates();

  const {
    t,
    filters,
    summary,
    handleEdit,
    handleUpload,
    handleViewAll,
    handleDownload,
    isSummaryError,
    handleViewActive,
    isSummaryLoading,
    downloadingFileId,
    handleViewExpiring,
    wasSelectionDeleted,
    selectedCertificate,
  } = hook;

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
            onClick={handleUpload}
            className="w-full justify-center sm:w-auto"
          >
            <L.UploadCloud className="h-4 w-4" aria-hidden />
            {t(`${CERTIFICATES}.uploadCertificate`)}
          </Button>
        </div>
      </div>

      {/* 2. Summary strip */}
      <CertificateSummaryStrip
        t={t}
        summary={summary}
        isError={isSummaryError}
        onViewAll={handleViewAll}
        isLoading={isSummaryLoading}
        statusFilter={filters.status}
        onViewActive={handleViewActive}
        onViewExpiring={handleViewExpiring}
        nearestExpiry={summary?.nearestExpiry ?? null}
      />

      {/* 3. Filters, table and the selected-certificate detail card */}
      <div className="grid gap-6 xl:grid-cols-3">
        <GlassCard className="xl:col-span-2">
          <div className="mb-5">
            <h2 className="text-xl font-medium">
              {t(`${CERTIFICATES}.certificatesList`)}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t(`${CERTIFICATES}.certificatesListDesc`)}
            </p>
          </div>

          <CertificatesTable hook={hook} />
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
            <GlassCard className="flex min-h-56 flex-col items-center justify-center text-center lg:sticky lg:top-22">
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
