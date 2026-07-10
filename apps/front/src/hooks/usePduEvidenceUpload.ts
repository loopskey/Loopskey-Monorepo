"use client";

import { getEvidenceFileUrl, getEvidenceUploadUrl } from "@/utils/pdu.constant";
import { useCallback, useState } from "react";
import { TPduEvidenceFile } from "@/types/professional-dashboard.types";
import { professionalApi } from "@/lib/rtk/endpoints/professional.api";
import { useDispatch } from "react-redux";

export const usePduEvidenceUpload = () => {
  const dispatch = useDispatch();
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const invalidatePdu = useCallback(() => {
    dispatch(professionalApi.util.invalidateTags(["ProfessionalPdu"]));
  }, [dispatch]);

  const uploadEvidence = useCallback(
    async (activityId: string, files: File[]) => {
      if (!files.length) return;
      setIsUploading(true);
      try {
        const body = new FormData();
        for (const file of files) body.append("files", file);
        const response = await fetch(getEvidenceUploadUrl(activityId), {
          method: "POST",
          credentials: "include",
          body,
        });
        if (!response.ok) throw new Error(`Upload failed (${response.status})`);
        invalidatePdu();
      } finally {
        setIsUploading(false);
      }
    },
    [invalidatePdu],
  );

  const downloadEvidence = useCallback(async (file: TPduEvidenceFile) => {
    const response = await fetch(getEvidenceFileUrl(file.id), {
      credentials: "include",
    });
    if (!response.ok) throw new Error(`Download failed (${response.status})`);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = file.fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  }, []);

  const removeEvidence = useCallback(
    async (fileId: string) => {
      setIsRemoving(true);
      try {
        const response = await fetch(getEvidenceFileUrl(fileId), {
          method: "DELETE",
          credentials: "include",
        });
        if (!response.ok) throw new Error(`Delete failed (${response.status})`);
        invalidatePdu();
      } finally {
        setIsRemoving(false);
      }
    },
    [invalidatePdu],
  );
  return {
    isUploading,
    isRemoving,
    uploadEvidence,
    removeEvidence,
    downloadEvidence,
  };
};
