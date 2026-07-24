import { join } from "path";

export const MAX_CERTIFICATE_FILES = 5;
export const MAX_CERTIFICATE_FILE_SIZE_BYTES = 20 * 1024 * 1024;

export const MAX_CERTIFICATE_OPTIONS = 200;

export const MAX_CERTIFICATE_ISSUERS = 200;

export const CERTIFICATE_UPLOAD_FIELD = "files";

export const ACCEPTED_CERTIFICATE_MIME_TYPES: Record<string, string[]> = {
  "application/pdf": [".pdf"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
};

export const ACCEPTED_CERTIFICATE_EXTENSIONS = Object.values(
  ACCEPTED_CERTIFICATE_MIME_TYPES,
).flat();

export const getCertificateUploadDir = () =>
  process.env.CERTIFICATE_UPLOAD_DIR ??
  join(process.cwd(), "uploads", "certificate");

export const isAcceptedCertificateFile = (
  mimeType: string,
  extension: string,
) => {
  const allowed = ACCEPTED_CERTIFICATE_MIME_TYPES[mimeType];
  if (!allowed) return false;
  return allowed.includes(extension.toLowerCase());
};
