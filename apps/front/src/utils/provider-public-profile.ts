import { ProviderPublicProfileMessageCode } from "@loopskey/api-contracts/error-codes";
import { ProviderProfileReviewState } from "@/lib/graphql/base";
import { PROVIDER_PROFILE_LIMITS } from "@loopskey/api-contracts/validation";
import { ProviderProfileStatus } from "@/lib/graphql/base";

import type { ProviderPublicProfileDraftFieldsFragment } from "@/lib/graphql/operations/provider-public-profile";

export const PROFILE_LIMITS = PROVIDER_PROFILE_LIMITS;

export type TProviderProfileForm = {
  displayName: string;
  biography: string;
  websiteUrl: string;
  links: { label: string; url: string }[];
  logoImageId: string | null;
  logoPath: string | null;
};

export const EMPTY_PROFILE_FORM: TProviderProfileForm = {
  displayName: "",
  biography: "",
  websiteUrl: "",
  links: [],
  logoImageId: null,
  logoPath: null,
};

export const formOfProfile = (
  profile: ProviderPublicProfileDraftFieldsFragment | null | undefined,
): TProviderProfileForm =>
  profile
    ? {
        displayName: profile.displayName ?? "",
        biography: profile.biography ?? "",
        websiteUrl: profile.websiteUrl ?? "",
        links: profile.links.map((link) => ({
          label: link.label,
          url: link.url,
        })),
        logoImageId: profile.logoImageId ?? null,
        logoPath: profile.logoPath ?? null,
      }
    : EMPTY_PROFILE_FORM;

export const sameProfileForm = (
  left: TProviderProfileForm,
  right: TProviderProfileForm,
) =>
  left.displayName.trim() === right.displayName.trim() &&
  left.biography.trim() === right.biography.trim() &&
  left.websiteUrl.trim() === right.websiteUrl.trim() &&
  left.logoImageId === right.logoImageId &&
  JSON.stringify(left.links) === JSON.stringify(right.links);

export const profileStatusKey = (
  profile: ProviderPublicProfileDraftFieldsFragment | null | undefined,
) => {
  if (!profile) return "none";
  if (profile.status === ProviderProfileStatus.Published)
    return profile.hasUnpublishedChanges ? "publishedChanges" : "published";
  if (profile.status === ProviderProfileStatus.Withdrawn) return "withdrawn";
  if (profile.reviewState === ProviderProfileReviewState.Submitted)
    return "submitted";
  if (profile.reviewState === ProviderProfileReviewState.Rejected)
    return "rejected";
  return "draft";
};

const BASE = "providerPublicProfile.feedback";

export const PROFILE_FEEDBACK_KEY: Record<string, string> = {
  saved: `${BASE}.saved`,
  submitted: `${BASE}.submitted`,
  withdrawn: `${BASE}.withdrawn`,
  logoUploaded: `${BASE}.logoUploaded`,
  FORBIDDEN: `${BASE}.forbidden`,
  BAD_USER_INPUT: `${BASE}.invalid`,
  [ProviderPublicProfileMessageCode.VERSION_CONFLICT]: `${BASE}.conflict`,
  [ProviderPublicProfileMessageCode.INVALID_FIELD]: `${BASE}.invalid`,
  [ProviderPublicProfileMessageCode.INCOMPLETE]: `${BASE}.incomplete`,
  [ProviderPublicProfileMessageCode.INVALID_STATE]: `${BASE}.invalidState`,
  [ProviderPublicProfileMessageCode.LOGO_NOT_FOUND]: `${BASE}.logoMissing`,
};

const REVIEW_BASE = "providerProfileReview.feedback";

export const REVIEW_FEEDBACK_KEY: Record<string, string> = {
  approved: `${REVIEW_BASE}.approved`,
  rejected: `${REVIEW_BASE}.rejected`,
  withdrawn: `${REVIEW_BASE}.withdrawn`,
  indexed: `${REVIEW_BASE}.indexed`,
  excluded: `${REVIEW_BASE}.excluded`,
  BAD_USER_INPUT: `${REVIEW_BASE}.invalid`,
  [ProviderPublicProfileMessageCode.VERSION_CONFLICT]: `${REVIEW_BASE}.conflict`,
  [ProviderPublicProfileMessageCode.INVALID_FIELD]: `${REVIEW_BASE}.invalid`,
  [ProviderPublicProfileMessageCode.INVALID_STATE]: `${REVIEW_BASE}.invalidState`,
  [ProviderPublicProfileMessageCode.INCOMPLETE]: `${REVIEW_BASE}.invalidState`,
  [ProviderPublicProfileMessageCode.NOT_FOUND]: `${REVIEW_BASE}.notFound`,
};
