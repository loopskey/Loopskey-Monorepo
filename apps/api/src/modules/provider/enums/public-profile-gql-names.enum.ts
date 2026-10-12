export enum ProviderProfileGqlObjectNames {
  LINK = "ProviderPublicProfileLink",
  ITEM = "ProviderPublicProfileItem",
  PUBLIC = "ProviderPublicProfile",
  BYLINE = "ProviderPublicByline",
  OWN = "ProviderPublicProfileDraft",
  ADMIN = "AdminProviderPublicProfile",
}

export enum ProviderProfileGqlInputNames {
  LINK = "ProviderPublicProfileLinkInput",
  SAVE = "SaveProviderPublicProfileInput",
  SUBMIT = "SubmitProviderPublicProfileInput",
  REVIEW = "ReviewProviderPublicProfileInput",
  MODERATE = "ModerateProviderPublicProfileInput",
  SET_INDEX_EXCLUSION = "SetProviderPublicProfileIndexExclusionInput",
}

export enum ProviderProfileGqlQueryNames {
  PUBLIC_BY_SLUG = "providerPublicProfileBySlug",
  BYLINE_FOR_CONTENT = "providerPublicBylineForContent",
  MY_PROFILE = "myProviderPublicProfile",
  ADMIN_PROFILES = "adminProviderPublicProfiles",
  URL_SHARDS = "providerProfileUrlShards",
  URL_PAGE = "providerProfileUrlPage",
}

export enum ProviderProfileGqlMutationNames {
  SAVE = "saveProviderPublicProfile",
  SUBMIT = "submitProviderPublicProfile",
  WITHDRAW = "withdrawProviderPublicProfile",
  REVIEW = "reviewProviderPublicProfile",
  MODERATE_WITHDRAW = "withdrawProviderPublicProfileAsAdmin",
  SET_INDEX_EXCLUSION = "setProviderPublicProfileIndexExclusion",
}

export enum ProviderProfileDecision {
  APPROVE = "APPROVE",
  REJECT = "REJECT",
}

export const PROVIDER_PROFILE_STATUS_GQL_NAME = "ProviderProfileStatus";
export const PROVIDER_PROFILE_REVIEW_STATE_GQL_NAME =
  "ProviderProfileReviewState";
export const PROVIDER_PROFILE_DECISION_GQL_NAME = "ProviderProfileDecision";
