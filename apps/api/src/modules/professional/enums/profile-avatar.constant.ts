import { join } from "path";

export const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;

export const AVATAR_UPLOAD_FIELD = "file";

export const AVATAR_ROUTE_PREFIX = "professional/profile/avatar";

export const ACCEPTED_AVATAR_MIME_TYPES: Record<string, string[]> = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
};

export const ACCEPTED_AVATAR_EXTENSIONS = Object.values(
  ACCEPTED_AVATAR_MIME_TYPES,
).flat();

export const AVATAR_STORAGE_KEY_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|webp)$/;

export const getAvatarUploadDir = () =>
  process.env.AVATAR_UPLOAD_DIR ?? join(process.cwd(), "uploads", "avatars");

export const getAvatarPublicBaseUrl = () => {
  const configured = process.env.PUBLIC_API_URL;
  if (configured) return configured.replace(/\/+$/, "");
  const host = process.env.APP_HOST ?? "localhost";
  const port = process.env.APP_PORT ?? "5700";
  return `http://${host}:${port}`;
};

export const buildAvatarUrl = (storageKey: string) =>
  `${getAvatarPublicBaseUrl()}/${AVATAR_ROUTE_PREFIX}/${storageKey}`;

export const isAcceptedAvatarFile = (mimeType: string, extension: string) => {
  const allowed = ACCEPTED_AVATAR_MIME_TYPES[mimeType];
  if (!allowed) return false;
  return allowed.includes(extension.toLowerCase());
};
