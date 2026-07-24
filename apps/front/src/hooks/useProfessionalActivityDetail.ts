"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { usePduEvidenceUpload } from "@/hooks/usePduEvidenceUpload";
import { useMemo, useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";

import * as API from "@/lib/rtk/endpoints/professional.api";
import * as H from "@/utils/learning-activities.helper";
import * as T from "@/types/professional-dashboard.types";

const getErrorStatus = (error: unknown): number | undefined => {
  if (error && typeof error === "object" && "status" in error) {
    const { status } = error as { status: unknown };
    if (typeof status === "number") return status;
  }
  return undefined;
};

const classifyError = (
  error: unknown,
  hasId: boolean,
): T.TActivityDetailErrorKind => {
  if (!hasId) return "not-found";
  const status = getErrorStatus(error);
  if (status === 404) return "not-found";
  if (status === 401 || status === 403) return "unauthorized";
  return "generic";
};

export const useProfessionalActivityDetail = () => {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentYear = new Date().getFullYear();

  const activityId = searchParams?.get("id") ?? null;

  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(
    null,
  );

  const {
    data: activity,
    isLoading,
    isError,
    error,
    refetch,
  } = API.useProfessionalPduActivityQuery(
    { activityId: activityId ?? "" },
    { skip: !activityId },
  );

  const { downloadEvidence } = usePduEvidenceUpload();

  const cancelHref = useMemo(
    () => H.buildTrackerReturnHref(searchParams, currentYear),
    [searchParams, currentYear],
  );

  const errorKind = useMemo<T.TActivityDetailErrorKind>(
    () => classifyError(error, Boolean(activityId)),
    [error, activityId],
  );

  const handleCancel = () => router.push(cancelHref);

  const handleEdit = () => {
    if (!activityId) return;
    router.push(H.buildActivityEditHref(activityId));
  };

  const handleDownload = async (file: T.TPduEvidenceFile) => {
    if (downloadingFileId) return;
    setDownloadingFileId(file.id);
    try {
      await downloadEvidence(file);
    } catch {
      notify.error(
        t("professionalDashboard.cpdPduTracker.activities.downloadError"),
      );
    } finally {
      setDownloadingFileId(null);
    }
  };

  return {
    t,
    activity,
    errorKind,
    cancelHref,
    downloadingFileId,
    isLoading: Boolean(activityId) && isLoading,
    isError: !activityId || isError,
    handleCancel,
    handleEdit,
    handleDownload,
    handleRetry: () => {
      if (activityId) void refetch();
    },
  };
};
