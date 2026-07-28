import {
  DOCUMENT_EXTENSIONS,
  DOCUMENT_MIME_EXTENSIONS,
  PDU_EVIDENCE_LIMITS,
  isAcceptedDocumentFile,
} from "@loopskey/api-contracts/upload";
import { join } from "path";

/**
 * PDU evidence upload rules.
 *
 * Values come from the shared contract so the browser cannot accept a file the
 * API will reject. The names stay PDU-specific: PDU and certificate limits are
 * equal today but are separate policies, and raising one must not move the
 * other.
 */
export const MAX_EVIDENCE_FILES = PDU_EVIDENCE_LIMITS.maxFiles;
export const MAX_EVIDENCE_SIZE_BYTES = PDU_EVIDENCE_LIMITS.maxFileSizeBytes;

export const EVIDENCE_UPLOAD_FIELD = "files";

export const ACCEPTED_EVIDENCE_MIME_TYPES: Record<string, readonly string[]> =
  DOCUMENT_MIME_EXTENSIONS;

export const ACCEPTED_EVIDENCE_EXTENSIONS = DOCUMENT_EXTENSIONS;

export const getPduUploadDir = () =>
  process.env.PDU_UPLOAD_DIR ?? join(process.cwd(), "uploads", "pdu");

export const isAcceptedEvidenceFile = isAcceptedDocumentFile;
