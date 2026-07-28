export const DOCUMENT_UPLOAD_DEFAULTS = {
  maxFiles: 5,
  maxFileSizeBytes: 20 * 1024 * 1024,
} as const;

export const PDU_EVIDENCE_LIMITS = {
  maxFiles: DOCUMENT_UPLOAD_DEFAULTS.maxFiles,
  maxFileSizeBytes: DOCUMENT_UPLOAD_DEFAULTS.maxFileSizeBytes,
} as const;

export const CERTIFICATE_EVIDENCE_LIMITS = {
  maxFiles: DOCUMENT_UPLOAD_DEFAULTS.maxFiles,
  maxFileSizeBytes: DOCUMENT_UPLOAD_DEFAULTS.maxFileSizeBytes,
} as const;
