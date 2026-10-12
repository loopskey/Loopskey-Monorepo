import { ProviderPublicProfileMessageCode } from "@loopskey/api-contracts/error-codes";
import { cleanSingleLine, containsMarkup } from "@utils/plain-text.util";
import { PROVIDER_PROFILE_LIMITS } from "@loopskey/api-contracts/validation";
import { BadRequestException } from "@nestjs/common";
import { cleanPlainText } from "@utils/plain-text.util";

export type ProviderProfileLink = { label: string; url: string };

export type ProviderProfileField =
  | "links"
  | "biography"
  | "websiteUrl"
  | "displayName"
  | "logoImageId"
  | "note";

export type ProviderProfileDraft = {
  displayName: string | null;
  biography: string | null;
  websiteUrl: string | null;
  links: ProviderProfileLink[];
};

const IPV4 = /^\d{1,3}(?:\.\d{1,3}){3}$/;
const HOSTNAME_LABEL = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;
const SAFE_PROTOCOLS: ReadonlySet<string> = new Set(["http:", "https:"]);

export const invalidProviderProfileField = (field: ProviderProfileField) =>
  new BadRequestException({
    code: ProviderPublicProfileMessageCode.INVALID_FIELD,
    message: ProviderPublicProfileMessageCode.INVALID_FIELD,
    field,
  });

export const incompleteProviderProfile = (field: ProviderProfileField) =>
  new BadRequestException({
    code: ProviderPublicProfileMessageCode.INCOMPLETE,
    message: ProviderPublicProfileMessageCode.INCOMPLETE,
    field,
  });

export const cleanDisplayName = (value: string) => {
  const cleaned = cleanSingleLine(value);
  if (
    !cleaned ||
    cleaned.length > PROVIDER_PROFILE_LIMITS.displayNameMax ||
    containsMarkup(cleaned)
  )
    throw invalidProviderProfileField("displayName");
  return cleaned;
};

export const cleanBiography = (value: string | null | undefined) => {
  if (value === undefined || value === null) return null;
  const cleaned = cleanPlainText(value);
  if (!cleaned) return null;
  if (
    cleaned.length > PROVIDER_PROFILE_LIMITS.biographyMax ||
    containsMarkup(cleaned)
  )
    throw invalidProviderProfileField("biography");
  return cleaned;
};

export const cleanPublicUrl = (
  value: string,
  field: ProviderProfileField,
  maximum: number,
) => {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maximum)
    throw invalidProviderProfileField(field);
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw invalidProviderProfileField(field);
  }
  const labels = url.hostname.split(".");
  const isDomain =
    labels.length >= 2 &&
    labels.every((label) => HOSTNAME_LABEL.test(label)) &&
    !IPV4.test(url.hostname);
  if (
    !SAFE_PROTOCOLS.has(url.protocol) ||
    url.username ||
    url.password ||
    !isDomain
  )
    throw invalidProviderProfileField(field);
  url.hash = "";
  return url.toString();
};

export const cleanWebsiteUrl = (value: string | null | undefined) => {
  if (value === undefined || value === null || !value.trim()) return null;
  return cleanPublicUrl(
    value,
    "websiteUrl",
    PROVIDER_PROFILE_LIMITS.websiteMax,
  );
};

export const cleanLinks = (
  links: readonly { label: string; url: string }[] | null | undefined,
): ProviderProfileLink[] => {
  const cleaned = (links ?? []).map((link) => {
    const label = cleanSingleLine(link.label);
    if (
      !label ||
      label.length > PROVIDER_PROFILE_LIMITS.linkLabelMax ||
      containsMarkup(label)
    )
      throw invalidProviderProfileField("links");
    return {
      label,
      url: cleanPublicUrl(
        link.url,
        "links",
        PROVIDER_PROFILE_LIMITS.linkUrlMax,
      ),
    };
  });
  if (cleaned.length > PROVIDER_PROFILE_LIMITS.linksMax)
    throw invalidProviderProfileField("links");
  return cleaned;
};

export const linksFromJson = (value: unknown): ProviderProfileLink[] => {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (typeof entry !== "object" || entry === null) return [];
    const { label, url } = entry as Record<string, unknown>;
    return typeof label === "string" && typeof url === "string"
      ? [{ label, url }]
      : [];
  });
};

export const assertSubmittableProfile = (draft: ProviderProfileDraft) => {
  if (!draft.displayName) throw incompleteProviderProfile("displayName");
  if (
    !draft.biography ||
    draft.biography.length < PROVIDER_PROFILE_LIMITS.biographyMin
  )
    throw incompleteProviderProfile("biography");
};

export const cleanReviewNote = (value: string | null | undefined) => {
  if (value === undefined || value === null) return null;
  const cleaned = cleanPlainText(value);
  if (!cleaned) return null;
  if (
    cleaned.length > PROVIDER_PROFILE_LIMITS.noteMax ||
    containsMarkup(cleaned)
  )
    throw invalidProviderProfileField("note");
  return cleaned;
};
