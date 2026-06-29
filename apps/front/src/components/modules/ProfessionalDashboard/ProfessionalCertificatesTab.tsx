"use client";

import { useProfessionalCertificates } from "@/hooks/useProfessionalCertificate";
import { ContentPagination } from "@elements/pagination";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";
import { Input } from "@ui/input";

import Link from "next/link";

import * as L from "lucide-react";

const ProfessionalCertificatesTab = () => {
  const {
    t,
    data,
    page,
    search,
    pageInfo,
    isLoading,
    isFetching,
    handleNext,
    formatDate,
    certificates,
    handlePrevious,
    getValidUntilLabel,
    lastIssuedCertificate,
    handleSearchInputChange,
  } = useProfessionalCertificates();

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <p className="text-sm font-medium text-primary">
            {t("professionalDashboard.certificates.eyebrow")}
          </p>

          <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
            {t("professionalDashboard.certificates.title")}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {t("professionalDashboard.certificates.subtitle")}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button radius="xl" variant="glass">
            <L.Share2 className="h-4 w-4" />
            {t("professionalDashboard.certificates.sharePortfolio")}
          </Button>

          <Button radius="xl" variant="brand" asChild>
            <Link href="/courses">
              <L.GraduationCap className="h-4 w-4" />
              {t("professionalDashboard.certificates.earnMore")}
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <GlassCard className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {t("professionalDashboard.certificates.totalCertificates")}
              </p>

              <p className="mt-2 text-3xl font-medium">
                {data?.totalCertificates ?? 0}
              </p>
            </div>

            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <L.Award className="h-5 w-5" />
            </div>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            {t("professionalDashboard.certificates.acrossCourses")}
          </p>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {t("professionalDashboard.certificates.totalPdusEarned")}
              </p>

              <p className="mt-2 text-3xl font-medium">
                {data?.totalPdusEarned ?? 0}
              </p>
            </div>

            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <L.Medal className="h-5 w-5" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {t("professionalDashboard.certificates.activeCertifications")}
              </p>

              <p className="mt-2 text-3xl font-medium">
                {data?.activeCertificates ?? 0}
              </p>
            </div>

            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <L.BadgeCheck className="h-5 w-5" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {t("professionalDashboard.certificates.lastIssued")}
              </p>

              <p className="mt-2 line-clamp-1 text-lg font-medium">
                {formatDate(lastIssuedCertificate?.issuedAt)}
              </p>
            </div>

            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <L.FileCheck2 className="h-5 w-5" />
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-xl font-medium">
              {t("professionalDashboard.certificates.certificatesList")}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {t("professionalDashboard.certificates.certificatesListDesc")}
            </p>
          </div>

          <div className="w-full lg:max-w-sm">
            <Input
              value={search}
              className="h-12 rounded-2xl bg-background/60"
              onChange={handleSearchInputChange}
              placeholder={t("professionalDashboard.certificates.search")}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-72 items-center justify-center">
            <L.Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        ) : certificates.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-[2rem] border border-dashed border-glass-border bg-background/40 p-8 text-center">
            <L.Award className="h-12 w-12 text-muted-foreground" />

            <h3 className="mt-4 text-xl font-medium">
              {t("professionalDashboard.certificates.emptyTitle")}
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              {t("professionalDashboard.certificates.emptyDescription")}
            </p>

            <Button className="mt-5" radius="xl" variant="brand" asChild>
              <Link href="/courses">
                {t("professionalDashboard.certificates.earnMore")}
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {certificates.map((certificate) => (
              <div
                key={certificate.id}
                className="group rounded-[2rem] border border-glass-border bg-background/45 p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/30"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                    <L.Award className="h-5 w-5" />
                  </div>

                  <Badge variant="secondary">{certificate.status}</Badge>
                </div>

                <p className="text-xs font-medium uppercase tracking-wider text-primary">
                  {t("professionalDashboard.certificates.certificate")}
                </p>

                <h3 className="mt-2 line-clamp-2 min-h-14 text-lg font-medium">
                  {certificate.title}
                </h3>

                <p className="mt-2 line-clamp-1 text-sm text-muted-foreground">
                  {certificate.issuer ??
                    t("professionalDashboard.certificates.unknownIssuer")}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-primary/5 p-3">
                    <p className="text-xs text-muted-foreground">
                      {t("professionalDashboard.certificates.issueDate")}
                    </p>

                    <p className="mt-1 font-medium">
                      {formatDate(certificate.issuedAt)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-primary/5 p-3">
                    <p className="text-xs text-muted-foreground">
                      {t("professionalDashboard.certificates.validUntil")}
                    </p>

                    <p className="mt-1 font-medium">
                      {getValidUntilLabel(certificate.validUntil)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-primary/5 p-3">
                  <p className="text-xs text-muted-foreground">
                    {t("professionalDashboard.certificates.verificationCode")}
                  </p>

                  <p className="mt-1 truncate font-mono text-sm font-medium">
                    {certificate.verificationCode}
                  </p>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    radius="xl"
                    variant="glass"
                    disabled={!certificate.certificateUrl}
                    asChild={Boolean(certificate.certificateUrl)}
                  >
                    {certificate.certificateUrl ? (
                      <Link
                        target="_blank"
                        rel="noreferrer"
                        href={certificate.certificateUrl}
                      >
                        <L.ExternalLink className="h-4 w-4" />
                        {t("professionalDashboard.certificates.preview")}
                      </Link>
                    ) : (
                      <>
                        <L.ExternalLink className="h-4 w-4" />
                        {t("professionalDashboard.certificates.preview")}
                      </>
                    )}
                  </Button>

                  <Button
                    size="sm"
                    radius="xl"
                    variant="brand"
                    disabled={!certificate.certificateUrl}
                    asChild={Boolean(certificate.certificateUrl)}
                  >
                    {certificate.certificateUrl ? (
                      <Link
                        href={certificate.certificateUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <L.Download className="h-4 w-4" />
                        {t("professionalDashboard.certificates.download")}
                      </Link>
                    ) : (
                      <>
                        <L.Download className="h-4 w-4" />
                        {t("professionalDashboard.certificates.download")}
                      </>
                    )}
                  </Button>
                </div>

                <Button
                  asChild
                  size="sm"
                  radius="xl"
                  variant="ghost"
                  className="mt-3 w-full"
                >
                  <Link
                    href={`/certificates/verify/${certificate.verificationCode}`}
                  >
                    <L.BadgeCheck className="h-4 w-4" />
                    {t("professionalDashboard.certificates.verify")}
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        )}

        <ContentPagination
          page={page}
          className="mt-6"
          onNext={handleNext}
          isLoading={isFetching}
          canPrevious={page > 1}
          onPrevious={handlePrevious}
          totalCount={data?.totalCount}
          hasNextPage={Boolean(pageInfo?.hasNextPage)}
        />
      </GlassCard>
    </div>
  );
};

export default ProfessionalCertificatesTab;
