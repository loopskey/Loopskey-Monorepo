import { PDU_API_ORIGIN } from "@/utils/pdu.constant";

export const MAX_CERTIFICATE_FILES = 5;
export const MAX_CERTIFICATE_FILE_SIZE_BYTES = 20 * 1024 * 1024;

export const ACCEPTED_CERTIFICATE_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const ACCEPTED_CERTIFICATE_ACCEPT_ATTRIBUTE =
  ".pdf,.jpg,.jpeg,.png,.doc,.docx";

export const CERTIFICATE_TITLE_MAX = 200;
export const CERTIFICATE_ISSUER_MAX = 200;
export const CERTIFICATE_NUMBER_MAX = 120;

export const getCertificateUploadUrl = (certificateId: string) =>
  `${PDU_API_ORIGIN}/professional/certificates/${encodeURIComponent(
    certificateId,
  )}/files`;

export const getCertificateFileUrl = (fileId: string) =>
  `${PDU_API_ORIGIN}/professional/certificates/files/${encodeURIComponent(
    fileId,
  )}`;
