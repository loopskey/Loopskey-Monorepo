import { ContentUrlMessageCode } from "@loopskey/api-contracts/error-codes";
import { CONTENT_SLUG_LIMITS } from "@loopskey/api-contracts/validation";

export const CONTENT_SLUG_MAX_LENGTH = CONTENT_SLUG_LIMITS.maxLength;

export const URL_FEEDBACK_KEY: Record<string, string> = {
  changed: "contentSeo.url.feedback.changed",
  FORBIDDEN: "contentSeo.url.feedback.forbidden",
  BAD_USER_INPUT: "contentSeo.url.feedback.invalid",
  [ContentUrlMessageCode.INVALID_SLUG]: "contentSeo.url.feedback.invalid",
  [ContentUrlMessageCode.SLUG_TAKEN]: "contentSeo.url.feedback.taken",
  [ContentUrlMessageCode.VERSION_CONFLICT]: "contentSeo.url.feedback.conflict",
  [ContentUrlMessageCode.NOT_FOUND]: "contentSeo.url.feedback.notFound",
  [ContentUrlMessageCode.ACCESS_DENIED]: "contentSeo.url.feedback.forbidden",
};

export const RECOVERY_FEEDBACK_KEY: Record<string, string> = {
  attached: "contentSeo.url.recovery.feedback.attached",
  [ContentUrlMessageCode.SLUG_TAKEN]: "contentSeo.url.recovery.feedback.taken",
  [ContentUrlMessageCode.TARGET_NOT_PUBLIC]:
    "contentSeo.url.recovery.feedback.notPublic",
};

export const RETIRED_SLUG_EVIDENCE_MIN_LENGTH = 10;

export const normalizeSlugInput = (value: string) => value.trim().toLowerCase();
