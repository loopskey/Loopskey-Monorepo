"use client";

import { TCertificateEvidenceFile } from "@/types/professional-dashboard.types";
import { getCertificateUploadUrl } from "@/utils/certificate.constant";
import { requestFile, saveBlobAs } from "@/utils/file-request.util";
import { getCertificateFileUrl } from "@/utils/certificate.constant";
import { useCallback, useState } from "react";
import { professionalApi } from "@/lib/rtk/endpoints/professional.api";
import { useDispatch } from "react-redux";

export const useCertificateEvidence = () => {
  const dispatch = useDispatch();
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const invalidateCertificates = useCallback(() => {
    dispatch(
      professionalApi.util.invalidateTags([
        "ProfessionalCertificates",
        "ProfessionalOverview",
      ]),
    );
  }, [dispatch]);

  const uploadEvidence = useCallback(
    async (certificateId: string, files: File[]) => {
      if (!files.length) return;
      setIsUploading(true);
      try {
        const body = new FormData();
        for (const file of files) body.append("files", file);
        await requestFile(getCertificateUploadUrl(certificateId), {
          method: "POST",
          body,
        });
        invalidateCertificates();
      } finally {
        setIsUploading(false);
      }
    },
    [invalidateCertificates],
  );

  const downloadEvidence = useCallback(
    async (file: Pick<TCertificateEvidenceFile, "id" | "fileName">) => {
      const response = await requestFile(getCertificateFileUrl(file.id));
      saveBlobAs(await response.blob(), file.fileName);
    },
    [],
  );

  const removeEvidence = useCallback(
    async (fileId: string) => {
      setIsRemoving(true);
      try {
        await requestFile(getCertificateFileUrl(fileId), { method: "DELETE" });
        invalidateCertificates();
      } finally {
        setIsRemoving(false);
      }
    },
    [invalidateCertificates],
  );

  return {
    isRemoving,
    isUploading,
    uploadEvidence,
    removeEvidence,
    downloadEvidence,
  };
};
