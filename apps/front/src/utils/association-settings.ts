import { ASSOCIATION_LOGO_LIMITS } from "@loopskey/api-contracts/upload";
import { associationLogoUploadUrl } from "@loopskey/api-contracts/upload";
import { IMAGE_ACCEPT_ATTRIBUTE } from "@loopskey/api-contracts/upload";
import { isAcceptedImageFile } from "@loopskey/api-contracts/upload";
import { CreditType } from "@/lib/graphql/base";

import { PDU_API_ORIGIN } from "@utils/pdu.constant";

export const ASSOCIATION_SETTINGS_SECTIONS = [
  "profile",
  "branding",
  "compliance",
  "notifications",
  "account",
] as const;

export type TAssociationSettingsSection =
  (typeof ASSOCIATION_SETTINGS_SECTIONS)[number];

export const ASSOCIATION_CREDIT_TYPES = [
  CreditType.Cpd,
  CreditType.Pdu,
] as const;

export const LOGO_ACCEPT_ATTRIBUTE = IMAGE_ACCEPT_ATTRIBUTE;

export const LOGO_MAX_BYTES = ASSOCIATION_LOGO_LIMITS.maxFileSizeBytes;

export const LOGO_MAX_MB = Math.round(LOGO_MAX_BYTES / (1024 * 1024));

export const THRESHOLD_MIN = 1;

export const THRESHOLD_MAX = 100;

export const resolveAssociationLogoUrl = (
  logoUrl: string | null | undefined,
) => {
  if (!logoUrl) return undefined;
  if (logoUrl.startsWith("/")) return `${PDU_API_ORIGIN}${logoUrl}`;
  return logoUrl;
};

export const extensionOf = (fileName: string) => {
  const dot = fileName.lastIndexOf(".");
  return dot < 0 ? "" : fileName.slice(dot).toLowerCase();
};

export type TLogoRejection = "type" | "size" | null;

export const rejectionOf = (file: File): TLogoRejection => {
  if (!isAcceptedImageFile(file.type, extensionOf(file.name))) return "type";
  if (file.size > LOGO_MAX_BYTES) return "size";
  return null;
};

export const uploadAssociationLogo = async (file: File) => {
  const body = new FormData();
  body.append("file", file);

  const response = await fetch(associationLogoUploadUrl(PDU_API_ORIGIN), {
    method: "POST",
    credentials: "include",
    body,
  });

  if (!response.ok) throw new Error(`Upload failed (${response.status})`);

  return response.json() as Promise<{ logoUrl: string | null }>;
};

export const removeAssociationLogo = async () => {
  const response = await fetch(associationLogoUploadUrl(PDU_API_ORIGIN), {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) throw new Error(`Removal failed (${response.status})`);
};

export const isThresholdPairValid = (
  atRiskThreshold: number,
  onTrackThreshold: number,
) => atRiskThreshold < onTrackThreshold;
