import { contentSocialImageUploadUrl } from "@loopskey/api-contracts/upload";
import { IMAGE_ACCEPT_ATTRIBUTE } from "@loopskey/api-contracts/upload";
import { ContentSeoMessageCode } from "@loopskey/api-contracts/error-codes";
import { IMAGE_UPLOAD_DEFAULTS } from "@loopskey/api-contracts/upload";
import { isAcceptedImageFile } from "@loopskey/api-contracts/upload";
import { CONTENT_SEO_LIMITS } from "@loopskey/api-contracts/validation";
import { publicPagePath } from "@/lib/content-catalog/public-path";
import { fromApiLanguage } from "@/lib/i18n/locale";
import { localizePath } from "@/lib/i18n/locale";
import { API_ORIGIN } from "@/utils/api-origin.util";

import type { TGraphQLBaseQueryError } from "@/types/rtk.types";
import type { TContentSeoImageUpload } from "@/types/content-seo.types";
import type { AppLanguage } from "@/lib/graphql/base";
import type { PublicPageKind } from "@/lib/content-catalog/public-path";

export const SEO_TITLE_MAX_LENGTH = CONTENT_SEO_LIMITS.titleMax;

export const SEO_DESCRIPTION_MAX_LENGTH = CONTENT_SEO_LIMITS.descriptionMax;

export const SEO_IMAGE_ALT_MAX_LENGTH = CONTENT_SEO_LIMITS.imageAltMax;

export const SOCIAL_IMAGE_ACCEPT = IMAGE_ACCEPT_ATTRIBUTE;

export const SOCIAL_IMAGE_MAX_BYTES = IMAGE_UPLOAD_DEFAULTS.maxFileSizeBytes;

export const SOCIAL_IMAGE_MAX_MB = Math.round(
  SOCIAL_IMAGE_MAX_BYTES / (1024 * 1024),
);

const extensionOf = (fileName: string) => {
  const dot = fileName.lastIndexOf(".");
  return dot < 0 ? "" : fileName.slice(dot).toLowerCase();
};

export const socialImageRejection = (file: File): "type" | "size" | null => {
  if (!isAcceptedImageFile(file.type, extensionOf(file.name))) return "type";
  if (file.size > SOCIAL_IMAGE_MAX_BYTES) return "size";
  return null;
};

export class ContentSeoUploadError extends Error {
  code: string | null;

  constructor(code: string | null) {
    super(code ?? "CONTENT_SEO_UPLOAD_FAILED");
    this.code = code;
  }
}

const codeOfResponse = async (response: Response) => {
  try {
    const body = (await response.json()) as { code?: unknown };
    return typeof body.code === "string" ? body.code : null;
  } catch {
    return null;
  }
};

export const uploadSocialImage = async (
  file: File,
): Promise<TContentSeoImageUpload> => {
  const body = new FormData();
  body.append("file", file);

  const response = await fetch(contentSocialImageUploadUrl(API_ORIGIN), {
    method: "POST",
    credentials: "include",
    body,
  });

  if (!response.ok)
    throw new ContentSeoUploadError(await codeOfResponse(response));

  return response.json() as Promise<TContentSeoImageUpload>;
};

export const resolveSocialImageUrl = (path: string | null | undefined) =>
  path ? `${API_ORIGIN}${path}` : null;

const siteOrigin = () => {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");
  return typeof window === "undefined" ? "" : window.location.origin;
};

export const previewCanonicalUrl = (
  kind: PublicPageKind,
  slug: string | undefined,
  locale: AppLanguage,
) => {
  if (!slug) return siteOrigin();
  return `${siteOrigin()}${localizePath(publicPagePath(kind, slug), fromApiLanguage(locale))}`;
};

export const errorCodeOf = (error: unknown) => {
  const failure = error as TGraphQLBaseQueryError | undefined;
  return failure?.errors?.[0]?.extensions?.code ?? "UNKNOWN";
};

export const SEO_FEEDBACK_KEY: Record<string, string> = {
  saved: "contentSeo.feedback.saved",
  reset: "contentSeo.feedback.saved",
  uploaded: "contentSeo.feedback.uploaded",
  indexed: "contentSeo.feedback.indexed",
  excluded: "contentSeo.feedback.excluded",
  FORBIDDEN: "contentSeo.feedback.forbidden",
  [ContentSeoMessageCode.VERSION_CONFLICT]: "contentSeo.feedback.conflict",
  [ContentSeoMessageCode.INVALID_FIELD]: "contentSeo.feedback.invalid",
  BAD_USER_INPUT: "contentSeo.feedback.invalid",
  [ContentSeoMessageCode.IMAGE_NOT_FOUND]: "contentSeo.feedback.imageMissing",
  [ContentSeoMessageCode.IMAGE_INVALID_TYPE]: "contentSeo.feedback.imageType",
  [ContentSeoMessageCode.IMAGE_TOO_LARGE]: "contentSeo.feedback.imageSize",
  [ContentSeoMessageCode.IMAGE_QUOTA_REACHED]: "contentSeo.feedback.imageQuota",
  [ContentSeoMessageCode.INDEX_FORBIDDEN]: "contentSeo.feedback.forbidden",
};
