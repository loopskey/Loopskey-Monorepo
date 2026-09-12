import {
  DOCUMENT_EXTENSIONS,
  DOCUMENT_MIME_EXTENSIONS,
  PDU_EVIDENCE_LIMITS,
  isAcceptedDocumentFile,
} from "@loopskey/api-contracts/upload";
import { join } from "path";

export const MAX_EVIDENCE_FILES = PDU_EVIDENCE_LIMITS.maxFiles;
export const MAX_EVIDENCE_SIZE_BYTES = PDU_EVIDENCE_LIMITS.maxFileSizeBytes;

export const EVIDENCE_UPLOAD_FIELD = "files";

export const ACCEPTED_EVIDENCE_MIME_TYPES: Record<string, readonly string[]> =
  DOCUMENT_MIME_EXTENSIONS;

export const ACCEPTED_EVIDENCE_EXTENSIONS = DOCUMENT_EXTENSIONS;

export const getPduUploadDir = () =>
  process.env.PDU_UPLOAD_DIR ?? join(process.cwd(), "uploads", "pdu");

export const isAcceptedEvidenceFile = isAcceptedDocumentFile;

export const parseUploadKeys = (
  uploadKeysJson: string | undefined,
): (string | null)[] => {
  if (!uploadKeysJson) return [];
  try {
    const parsed: unknown = JSON.parse(uploadKeysJson);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((value) => (typeof value === "string" ? value : null));
  } catch {
    return [];
  }
};
