"use client";

import { useProfessionalActivityDetail } from "@/hooks/useProfessionalActivityDetail";
import { ActivityDetailView } from "@modules/ProfessionalDashboard/parts/activity-detail-view";
import { GlassCard } from "@elements/glass-card";
import { Skeleton } from "@ui/skeleton";
import { Button } from "@ui/button";

import * as L from "lucide-react";

const TRACKER = "professionalDashboard.cpdPduTracker";

const DetailSkeleton = () => (
  <div className="space-y-6">
    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
      <div className="space-y-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-10 w-72 max-w-full" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-11 w-28 rounded-2xl" />
        <Skeleton className="h-11 w-28 rounded-2xl" />
      </div>
    </div>
    <Skeleton className="h-56 w-full rounded-[2rem]" />
    <Skeleton className="h-56 w-full rounded-[2rem]" />
  </div>
);

const ProfessionalActivityDetailTab = () => {
  const {
    t,
    isError,
    activity,
    errorKind,
    isLoading,
    handleEdit,
    handleRetry,
    handleCancel,
    handleDownload,
    downloadingFileId,
  } = useProfessionalActivityDetail();

  if (isLoading) return <DetailSkeleton />;

  if (isError || !activity) {
    const isGeneric = errorKind === "generic";
    const Icon =
      errorKind === "unauthorized"
        ? L.ShieldAlert
        : errorKind === "generic"
          ? L.TriangleAlert
          : L.FileQuestion;

    return (
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium text-primary">
            {t(`${TRACKER}.detail.eyebrow`)}
          </p>
          <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
            {t(`${TRACKER}.detail.title`)}
          </h1>
        </div>

        <GlassCard>
          <div className="flex min-h-64 flex-col items-center justify-center text-center">
            <div className="rounded-full bg-primary/10 p-4 text-primary">
              <Icon className="h-7 w-7" aria-hidden />
            </div>

            <h2 className="mt-4 text-xl font-medium">
              {t(`${TRACKER}.detail.errors.${errorKind}.title`)}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              {t(`${TRACKER}.detail.errors.${errorKind}.description`)}
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Button
                radius="xl"
                type="button"
                variant="glass"
                onClick={handleCancel}
              >
                <L.ArrowLeft className="h-4 w-4" aria-hidden />
                {t(`${TRACKER}.detail.back`)}
              </Button>

              {isGeneric && (
                <Button
                  radius="xl"
                  type="button"
                  variant="brand"
                  onClick={handleRetry}
                >
                  <L.RefreshCw className="h-4 w-4" aria-hidden />
                  {t(`${TRACKER}.detail.retry`)}
                </Button>
              )}
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <ActivityDetailView
      t={t}
      onEdit={handleEdit}
      activity={activity}
      onCancel={handleCancel}
      onDownload={handleDownload}
      downloadingFileId={downloadingFileId}
    />
  );
};

export default ProfessionalActivityDetailTab;
