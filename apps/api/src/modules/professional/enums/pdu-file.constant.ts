import { join } from "path";

export const MAX_EVIDENCE_FILES = 5;
export const MAX_EVIDENCE_SIZE_BYTES = 20 * 1024 * 1024;

export const EVIDENCE_UPLOAD_FIELD = "files";

export const ACCEPTED_EVIDENCE_MIME_TYPES: Record<string, string[]> = {
  "application/pdf": [".pdf"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
};

export const ACCEPTED_EVIDENCE_EXTENSIONS = Object.values(
  ACCEPTED_EVIDENCE_MIME_TYPES,
).flat();

export const getPduUploadDir = () =>
  process.env.PDU_UPLOAD_DIR ?? join(process.cwd(), "uploads", "pdu");

export const isAcceptedEvidenceFile = (mimeType: string, extension: string) => {
  const allowed = ACCEPTED_EVIDENCE_MIME_TYPES[mimeType];
  if (!allowed) return false;
  return allowed.includes(extension.toLowerCase());
};
