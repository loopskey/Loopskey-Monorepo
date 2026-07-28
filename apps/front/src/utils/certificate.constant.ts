import {
  CERTIFICATE_EVIDENCE_LIMITS,
  CERTIFICATE_LIMITS,
  DOCUMENT_ACCEPT_ATTRIBUTE,
  DOCUMENT_MIME_TYPES,
  certificateEvidenceFileUrl,
  certificateEvidenceUploadUrl,
} from "@loopskey/api-contracts";

import { PDU_API_ORIGIN } from "@/utils/pdu.constant";

/**
 * Upload rules and field bounds come from the shared contract, so the form and
 * the API cannot disagree about what is acceptable.
 */
export const MAX_CERTIFICATE_FILES = CERTIFICATE_EVIDENCE_LIMITS.maxFiles;
export const MAX_CERTIFICATE_FILE_SIZE_BYTES =
  CERTIFICATE_EVIDENCE_LIMITS.maxFileSizeBytes;

export const ACCEPTED_CERTIFICATE_MIME_TYPES = DOCUMENT_MIME_TYPES;

export const ACCEPTED_CERTIFICATE_ACCEPT_ATTRIBUTE = DOCUMENT_ACCEPT_ATTRIBUTE;

export const CERTIFICATE_TITLE_MAX = CERTIFICATE_LIMITS.titleMax;
export const CERTIFICATE_ISSUER_MAX = CERTIFICATE_LIMITS.issuerMax;
export const CERTIFICATE_NUMBER_MAX = CERTIFICATE_LIMITS.certificateNumberMax;

export const getCertificateUploadUrl = (certificateId: string) =>
  certificateEvidenceUploadUrl(PDU_API_ORIGIN, certificateId);

export const getCertificateFileUrl = (fileId: string) =>
  certificateEvidenceFileUrl(PDU_API_ORIGIN, fileId);
