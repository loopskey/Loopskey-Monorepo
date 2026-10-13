import { IMAGE_UPLOAD_DEFAULTS } from "@loopskey/api-contracts/upload";
import { isAcceptedImageFile } from "@loopskey/api-contracts/upload";
import { IMAGE_EXTENSIONS } from "@loopskey/api-contracts/upload";

export const MAX_SOCIAL_IMAGE_SIZE_BYTES =
  IMAGE_UPLOAD_DEFAULTS.maxFileSizeBytes;

export const SOCIAL_IMAGE_UPLOAD_FIELD = "file";

export const SOCIAL_IMAGE_STORAGE_NAMESPACE = "content" as const;

export const SOCIAL_IMAGE_KEY_PREFIX = "social-";

export const ACCEPTED_SOCIAL_IMAGE_EXTENSIONS = IMAGE_EXTENSIONS;

export const MAX_UNREFERENCED_IMAGES_PER_OWNER = 10;

export const UNREFERENCED_IMAGE_TTL_MS = 24 * 60 * 60 * 1000;

export const SOCIAL_IMAGE_ID_PATTERN = /^[a-z0-9]{20,32}$/;

export const isAcceptedSocialImageFile = isAcceptedImageFile;

const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);

const JPEG_SIGNATURE = Buffer.from([0xff, 0xd8, 0xff]);

const RIFF_SIGNATURE = Buffer.from("RIFF", "ascii");

const WEBP_SIGNATURE = Buffer.from("WEBP", "ascii");

export const hasSocialImageSignature = (data: Buffer, mimeType: string) => {
  if (mimeType === "image/png")
    return data.subarray(0, 8).equals(PNG_SIGNATURE);
  if (mimeType === "image/jpeg")
    return data.subarray(0, 3).equals(JPEG_SIGNATURE);
  if (mimeType === "image/webp")
    return (
      data.subarray(0, 4).equals(RIFF_SIGNATURE) &&
      data.subarray(8, 12).equals(WEBP_SIGNATURE)
    );
  return false;
};
