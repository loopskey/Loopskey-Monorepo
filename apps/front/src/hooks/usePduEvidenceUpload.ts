"use client";

import { getEvidenceFileUrl, getEvidenceUploadUrl } from "@/utils/pdu.constant";
import { requestFile, saveBlobAs } from "@/utils/file-request.util";
import { scheduleProgressResync } from "@/utils/progress-resync.util";
import { useCallback, useState } from "react";
import { TPduEvidenceFile } from "@/types/professional-dashboard.types";
import { professionalApi } from "@/lib/rtk/endpoints/professional.api";
import { useDispatch } from "react-redux";

const uploadKeysByFile = new WeakMap<File, string>();

const getUploadKey = (file: File) => {
  let key = uploadKeysByFile.get(file);
  if (!key) {
    key = crypto.randomUUID();
    uploadKeysByFile.set(file, key);
  }
  return key;
};

export const usePduEvidenceUpload = () => {
  const dispatch = useDispatch();
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const invalidatePdu = useCallback(() => {
    dispatch(professionalApi.util.invalidateTags(["ProfessionalPdu"]));
    scheduleProgressResync(dispatch);
  }, [dispatch]);

  const uploadEvidence = useCallback(
    async (activityId: string, files: File[]) => {
      if (!files.length) return;
      setIsUploading(true);
      try {
        const body = new FormData();
        for (const file of files) body.append("files", file);
        body.append(
          "uploadKeys",
          JSON.stringify(files.map((file) => getUploadKey(file))),
        );
        await requestFile(getEvidenceUploadUrl(activityId), {
          method: "POST",
          body,
        });
        invalidatePdu();
      } finally {
        setIsUploading(false);
      }
    },
    [invalidatePdu],
  );

  const downloadEvidence = useCallback(async (file: TPduEvidenceFile) => {
    const response = await requestFile(getEvidenceFileUrl(file.id));
    saveBlobAs(await response.blob(), file.fileName);
  }, []);

  const removeEvidence = useCallback(
    async (fileId: string) => {
      setIsRemoving(true);
      try {
        await requestFile(getEvidenceFileUrl(fileId), { method: "DELETE" });
        invalidatePdu();
      } finally {
        setIsRemoving(false);
      }
    },
    [invalidatePdu],
  );
  return {
    isRemoving,
    isUploading,
    uploadEvidence,
    removeEvidence,
    downloadEvidence,
  };
};
