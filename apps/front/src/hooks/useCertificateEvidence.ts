"use client";

import { getCertificateFileUrl, getCertificateUploadUrl } from "@/utils/certificate.constant";
import { professionalApi } from "@/lib/rtk/endpoints/professional.api";
import { TCertificateEvidenceFile } from "@/types/professional-dashboard.types";
import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";

/** Distinguishes an authorization failure from a missing or deleted file. */
export type TCertificateDownloadError = "unauthorized" | "missing" | "generic";

export class CertificateFileError extends Error {
  constructor(readonly kind: TCertificateDownloadError) {
    super(`Certificate file request failed (${kind})`);
    this.name = "CertificateFileError";
  }
}

const classifyResponse = (status: number): TCertificateDownloadError => {
  if (status === 401 || status === 403) return "unauthorized";
  if (status === 404 || status === 410) return "missing";
  return "generic";
};

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
        const response = await fetch(getCertificateUploadUrl(certificateId), {
          method: "POST",
          credentials: "include",
          body,
        });
        if (!response.ok)
          throw new CertificateFileError(classifyResponse(response.status));
        invalidateCertificates();
      } finally {
        setIsUploading(false);
      }
    },
    [invalidateCertificates],
  );

  /**
   * Streams the file through the authenticated endpoint and hands the browser a
   * short-lived object URL, so no private storage location is ever exposed.
   */
  const downloadEvidence = useCallback(
    async (file: Pick<TCertificateEvidenceFile, "id" | "fileName">) => {
      const response = await fetch(getCertificateFileUrl(file.id), {
        credentials: "include",
      });
      if (!response.ok)
        throw new CertificateFileError(classifyResponse(response.status));

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = file.fileName;
      anchor.click();
      URL.revokeObjectURL(url);
    },
    [],
  );

  const removeEvidence = useCallback(
    async (fileId: string) => {
      setIsRemoving(true);
      try {
        const response = await fetch(getCertificateFileUrl(fileId), {
          method: "DELETE",
          credentials: "include",
        });
        if (!response.ok)
          throw new CertificateFileError(classifyResponse(response.status));
        invalidateCertificates();
      } finally {
        setIsRemoving(false);
      }
    },
    [invalidateCertificates],
  );

  return {
    isUploading,
    isRemoving,
    uploadEvidence,
    removeEvidence,
    downloadEvidence,
  };
};
