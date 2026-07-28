export const DOCUMENT_MIME_EXTENSIONS = {
  "application/pdf": [".pdf"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
} as const satisfies Record<string, readonly string[]>;

export type DocumentMimeType = keyof typeof DOCUMENT_MIME_EXTENSIONS;

export const DOCUMENT_MIME_TYPES = Object.keys(
  DOCUMENT_MIME_EXTENSIONS,
) as readonly DocumentMimeType[];

export const DOCUMENT_EXTENSIONS: readonly string[] = Object.values(
  DOCUMENT_MIME_EXTENSIONS,
).flat();

export const DOCUMENT_ACCEPT_ATTRIBUTE = DOCUMENT_EXTENSIONS.join(",");

export const isAcceptedDocumentFile = (
  mimeType: string,
  extension: string,
): boolean => {
  const allowed = (
    DOCUMENT_MIME_EXTENSIONS as Record<string, readonly string[] | undefined>
  )[mimeType];
  if (!allowed) return false;
  return allowed.includes(extension.toLowerCase());
};
