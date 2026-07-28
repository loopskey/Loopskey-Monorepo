import {
  CERTIFICATE_EVIDENCE_LIMITS,
  DOCUMENT_EXTENSIONS,
  DOCUMENT_MIME_EXTENSIONS,
  isAcceptedDocumentFile,
} from "@loopskey/api-contracts/upload";
import { join } from "path";

/**
 * Certificate evidence upload rules.
 *
 * Values come from the shared contract so the browser cannot accept a file the
 * API will reject. The names stay certificate-specific: PDU and certificate
 * limits are equal today but are separate policies.
 */
export const MAX_CERTIFICATE_FILES = CERTIFICATE_EVIDENCE_LIMITS.maxFiles;
export const MAX_CERTIFICATE_FILE_SIZE_BYTES =
  CERTIFICATE_EVIDENCE_LIMITS.maxFileSizeBytes;

export const MAX_CERTIFICATE_OPTIONS = 200;

export const MAX_CERTIFICATE_ISSUERS = 200;

export const CERTIFICATE_UPLOAD_FIELD = "files";

export const ACCEPTED_CERTIFICATE_MIME_TYPES: Record<
  string,
  readonly string[]
> = DOCUMENT_MIME_EXTENSIONS;

export const ACCEPTED_CERTIFICATE_EXTENSIONS = DOCUMENT_EXTENSIONS;

export const getCertificateUploadDir = () =>
  process.env.CERTIFICATE_UPLOAD_DIR ??
  join(process.cwd(), "uploads", "certificate");

export const isAcceptedCertificateFile = isAcceptedDocumentFile;
