import { ASSOCIATION_LOGO_LIMITS } from "@loopskey/api-contracts/upload";
import { isAcceptedImageFile } from "@loopskey/api-contracts/upload";
import { IMAGE_EXTENSIONS } from "@loopskey/api-contracts/upload";

export const MAX_LOGO_SIZE_BYTES = ASSOCIATION_LOGO_LIMITS.maxFileSizeBytes;

export const LOGO_UPLOAD_FIELD = "file";

export const LOGO_STORAGE_NAMESPACE = "logo" as const;

export const ACCEPTED_LOGO_EXTENSIONS = IMAGE_EXTENSIONS;

export const LOGO_STORAGE_KEY_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|webp)$/;

export const isAcceptedLogoFile = isAcceptedImageFile;

const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);

const JPEG_SIGNATURE = Buffer.from([0xff, 0xd8, 0xff]);

const RIFF_SIGNATURE = Buffer.from("RIFF", "ascii");

const WEBP_SIGNATURE = Buffer.from("WEBP", "ascii");

export const hasImageSignature = (data: Buffer, mimeType: string) => {
  if (mimeType === "image/png")
    return data.subarray(0, 8).equals(PNG_SIGNATURE);
  if (mimeType === "image/jpeg")
    return data.subarray(0, 3).equals(JPEG_SIGNATURE);

  return (
    data.subarray(0, 4).equals(RIFF_SIGNATURE) &&
    data.subarray(8, 12).equals(WEBP_SIGNATURE)
  );
};
