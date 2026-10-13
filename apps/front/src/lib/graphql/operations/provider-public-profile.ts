import * as Types from "@/lib/graphql/base";
import { TypedDocumentString } from "@/lib/graphql/base";
export type ProviderPublicProfileDraftFieldsFragment = { __typename?: 'ProviderPublicProfileDraft', id: string, slug: string, status: Types.ProviderProfileStatus, reviewState: Types.ProviderProfileReviewState, displayName?: string | null, biography?: string | null, websiteUrl?: string | null, logoImageId?: string | null, logoPath?: string | null, draftVersion: number, submittedAt?: string | null, reviewedAt?: string | null, reviewNote?: string | null, publishedAt?: string | null, isLive: boolean, hasUnpublishedChanges: boolean, links: Array<{ __typename?: 'ProviderPublicProfileLink', label: string, url: string }> };

export type AdminProviderPublicProfileFieldsFragment = { __typename?: 'AdminProviderPublicProfile', id: string, slug: string, status: Types.ProviderProfileStatus, reviewState: Types.ProviderProfileReviewState, displayName?: string | null, biography?: string | null, websiteUrl?: string | null, logoImageId?: string | null, logoPath?: string | null, draftVersion: number, submittedAt?: string | null, reviewedAt?: string | null, reviewNote?: string | null, publishedAt?: string | null, isLive: boolean, hasUnpublishedChanges: boolean, providerId: string, providerName?: string | null, excludeFromIndex: boolean, withdrawnAt?: string | null, links: Array<{ __typename?: 'ProviderPublicProfileLink', label: string, url: string }> };

export type ProviderPublicProfileBySlugQueryVariables = Types.Exact<{
  slug: Types.Scalars['String']['input'];
}>;


export type ProviderPublicProfileBySlugQuery = { __typename?: 'Query', providerPublicProfileBySlug: { __typename?: 'ProviderPublicProfile', slug: string, displayName: string, biography: string, logoPath?: string | null, websiteUrl?: string | null, excludeFromIndex: boolean, publishedAt: string, updatedAt: string, links: Array<{ __typename?: 'ProviderPublicProfileLink', label: string, url: string }>, items: Array<{ __typename?: 'ProviderPublicProfileItem', kind: Types.ContentUrlKind, slug: string, title: string, summary?: string | null, imageUrl?: string | null, category?: string | null }> } };

export type ProviderPublicBylineForContentQueryVariables = Types.Exact<{
  kind: Types.ContentUrlKind;
  contentId: Types.Scalars['String']['input'];
}>;


export type ProviderPublicBylineForContentQuery = { __typename?: 'Query', providerPublicBylineForContent?: { __typename?: 'ProviderPublicByline', slug: string, displayName: string } | null };

export type MyProviderPublicProfileQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type MyProviderPublicProfileQuery = { __typename?: 'Query', myProviderPublicProfile?: { __typename?: 'ProviderPublicProfileDraft', id: string, slug: string, status: Types.ProviderProfileStatus, reviewState: Types.ProviderProfileReviewState, displayName?: string | null, biography?: string | null, websiteUrl?: string | null, logoImageId?: string | null, logoPath?: string | null, draftVersion: number, submittedAt?: string | null, reviewedAt?: string | null, reviewNote?: string | null, publishedAt?: string | null, isLive: boolean, hasUnpublishedChanges: boolean, links: Array<{ __typename?: 'ProviderPublicProfileLink', label: string, url: string }> } | null };

export type SaveProviderPublicProfileMutationVariables = Types.Exact<{
  input: Types.SaveProviderPublicProfileInput;
}>;


export type SaveProviderPublicProfileMutation = { __typename?: 'Mutation', saveProviderPublicProfile: { __typename?: 'ProviderPublicProfileDraft', id: string, slug: string, status: Types.ProviderProfileStatus, reviewState: Types.ProviderProfileReviewState, displayName?: string | null, biography?: string | null, websiteUrl?: string | null, logoImageId?: string | null, logoPath?: string | null, draftVersion: number, submittedAt?: string | null, reviewedAt?: string | null, reviewNote?: string | null, publishedAt?: string | null, isLive: boolean, hasUnpublishedChanges: boolean, links: Array<{ __typename?: 'ProviderPublicProfileLink', label: string, url: string }> } };

export type SubmitProviderPublicProfileMutationVariables = Types.Exact<{
  input: Types.SubmitProviderPublicProfileInput;
}>;


export type SubmitProviderPublicProfileMutation = { __typename?: 'Mutation', submitProviderPublicProfile: { __typename?: 'ProviderPublicProfileDraft', id: string, slug: string, status: Types.ProviderProfileStatus, reviewState: Types.ProviderProfileReviewState, displayName?: string | null, biography?: string | null, websiteUrl?: string | null, logoImageId?: string | null, logoPath?: string | null, draftVersion: number, submittedAt?: string | null, reviewedAt?: string | null, reviewNote?: string | null, publishedAt?: string | null, isLive: boolean, hasUnpublishedChanges: boolean, links: Array<{ __typename?: 'ProviderPublicProfileLink', label: string, url: string }> } };

export type WithdrawProviderPublicProfileMutationVariables = Types.Exact<{ [key: string]: never; }>;


export type WithdrawProviderPublicProfileMutation = { __typename?: 'Mutation', withdrawProviderPublicProfile: { __typename?: 'ProviderPublicProfileDraft', id: string, slug: string, status: Types.ProviderProfileStatus, reviewState: Types.ProviderProfileReviewState, displayName?: string | null, biography?: string | null, websiteUrl?: string | null, logoImageId?: string | null, logoPath?: string | null, draftVersion: number, submittedAt?: string | null, reviewedAt?: string | null, reviewNote?: string | null, publishedAt?: string | null, isLive: boolean, hasUnpublishedChanges: boolean, links: Array<{ __typename?: 'ProviderPublicProfileLink', label: string, url: string }> } };

export type AdminProviderPublicProfilesQueryVariables = Types.Exact<{
  reviewState?: Types.InputMaybe<Types.ProviderProfileReviewState>;
}>;


export type AdminProviderPublicProfilesQuery = { __typename?: 'Query', adminProviderPublicProfiles: Array<{ __typename?: 'AdminProviderPublicProfile', id: string, slug: string, status: Types.ProviderProfileStatus, reviewState: Types.ProviderProfileReviewState, displayName?: string | null, biography?: string | null, websiteUrl?: string | null, logoImageId?: string | null, logoPath?: string | null, draftVersion: number, submittedAt?: string | null, reviewedAt?: string | null, reviewNote?: string | null, publishedAt?: string | null, isLive: boolean, hasUnpublishedChanges: boolean, providerId: string, providerName?: string | null, excludeFromIndex: boolean, withdrawnAt?: string | null, links: Array<{ __typename?: 'ProviderPublicProfileLink', label: string, url: string }> }> };

export type ReviewProviderPublicProfileMutationVariables = Types.Exact<{
  input: Types.ReviewProviderPublicProfileInput;
}>;


export type ReviewProviderPublicProfileMutation = { __typename?: 'Mutation', reviewProviderPublicProfile: { __typename?: 'AdminProviderPublicProfile', id: string, slug: string, status: Types.ProviderProfileStatus, reviewState: Types.ProviderProfileReviewState, displayName?: string | null, biography?: string | null, websiteUrl?: string | null, logoImageId?: string | null, logoPath?: string | null, draftVersion: number, submittedAt?: string | null, reviewedAt?: string | null, reviewNote?: string | null, publishedAt?: string | null, isLive: boolean, hasUnpublishedChanges: boolean, providerId: string, providerName?: string | null, excludeFromIndex: boolean, withdrawnAt?: string | null, links: Array<{ __typename?: 'ProviderPublicProfileLink', label: string, url: string }> } };

export type WithdrawProviderPublicProfileAsAdminMutationVariables = Types.Exact<{
  input: Types.ModerateProviderPublicProfileInput;
}>;


export type WithdrawProviderPublicProfileAsAdminMutation = { __typename?: 'Mutation', withdrawProviderPublicProfileAsAdmin: { __typename?: 'AdminProviderPublicProfile', id: string, slug: string, status: Types.ProviderProfileStatus, reviewState: Types.ProviderProfileReviewState, displayName?: string | null, biography?: string | null, websiteUrl?: string | null, logoImageId?: string | null, logoPath?: string | null, draftVersion: number, submittedAt?: string | null, reviewedAt?: string | null, reviewNote?: string | null, publishedAt?: string | null, isLive: boolean, hasUnpublishedChanges: boolean, providerId: string, providerName?: string | null, excludeFromIndex: boolean, withdrawnAt?: string | null, links: Array<{ __typename?: 'ProviderPublicProfileLink', label: string, url: string }> } };

export type SetProviderPublicProfileIndexExclusionMutationVariables = Types.Exact<{
  input: Types.SetProviderPublicProfileIndexExclusionInput;
}>;


export type SetProviderPublicProfileIndexExclusionMutation = { __typename?: 'Mutation', setProviderPublicProfileIndexExclusion: { __typename?: 'AdminProviderPublicProfile', id: string, excludeFromIndex: boolean } };

export const ProviderPublicProfileDraftFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment ProviderPublicProfileDraftFields on ProviderPublicProfileDraft {
  id
  slug
  status
  reviewState
  displayName
  biography
  websiteUrl
  logoImageId
  logoPath
  draftVersion
  submittedAt
  reviewedAt
  reviewNote
  publishedAt
  isLive
  hasUnpublishedChanges
  links {
    label
    url
  }
}
    `, {"fragmentName":"ProviderPublicProfileDraftFields"}) as unknown as TypedDocumentString<ProviderPublicProfileDraftFieldsFragment, unknown>;
export const AdminProviderPublicProfileFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment AdminProviderPublicProfileFields on AdminProviderPublicProfile {
  id
  slug
  status
  reviewState
  displayName
  biography
  websiteUrl
  logoImageId
  logoPath
  draftVersion
  submittedAt
  reviewedAt
  reviewNote
  publishedAt
  isLive
  hasUnpublishedChanges
  links {
    label
    url
  }
  providerId
  providerName
  excludeFromIndex
  withdrawnAt
}
    `, {"fragmentName":"AdminProviderPublicProfileFields"}) as unknown as TypedDocumentString<AdminProviderPublicProfileFieldsFragment, unknown>;
export const ProviderPublicProfileBySlugDocument = /*#__PURE__*/ new TypedDocumentString(`
    query ProviderPublicProfileBySlug($slug: String!) {
  providerPublicProfileBySlug(slug: $slug) {
    slug
    displayName
    biography
    logoPath
    websiteUrl
    excludeFromIndex
    publishedAt
    updatedAt
    links {
      label
      url
    }
    items {
      kind
      slug
      title
      summary
      imageUrl
      category
    }
  }
}
    `) as unknown as TypedDocumentString<ProviderPublicProfileBySlugQuery, ProviderPublicProfileBySlugQueryVariables>;
export const ProviderPublicBylineForContentDocument = /*#__PURE__*/ new TypedDocumentString(`
    query ProviderPublicBylineForContent($kind: ContentUrlKind!, $contentId: String!) {
  providerPublicBylineForContent(kind: $kind, contentId: $contentId) {
    slug
    displayName
  }
}
    `) as unknown as TypedDocumentString<ProviderPublicBylineForContentQuery, ProviderPublicBylineForContentQueryVariables>;
export const MyProviderPublicProfileDocument = /*#__PURE__*/ new TypedDocumentString(`
    query MyProviderPublicProfile {
  myProviderPublicProfile {
    ...ProviderPublicProfileDraftFields
  }
}
    fragment ProviderPublicProfileDraftFields on ProviderPublicProfileDraft {
  id
  slug
  status
  reviewState
  displayName
  biography
  websiteUrl
  logoImageId
  logoPath
  draftVersion
  submittedAt
  reviewedAt
  reviewNote
  publishedAt
  isLive
  hasUnpublishedChanges
  links {
    label
    url
  }
}`) as unknown as TypedDocumentString<MyProviderPublicProfileQuery, MyProviderPublicProfileQueryVariables>;
export const SaveProviderPublicProfileDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation SaveProviderPublicProfile($input: SaveProviderPublicProfileInput!) {
  saveProviderPublicProfile(input: $input) {
    ...ProviderPublicProfileDraftFields
  }
}
    fragment ProviderPublicProfileDraftFields on ProviderPublicProfileDraft {
  id
  slug
  status
  reviewState
  displayName
  biography
  websiteUrl
  logoImageId
  logoPath
  draftVersion
  submittedAt
  reviewedAt
  reviewNote
  publishedAt
  isLive
  hasUnpublishedChanges
  links {
    label
    url
  }
}`) as unknown as TypedDocumentString<SaveProviderPublicProfileMutation, SaveProviderPublicProfileMutationVariables>;
export const SubmitProviderPublicProfileDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation SubmitProviderPublicProfile($input: SubmitProviderPublicProfileInput!) {
  submitProviderPublicProfile(input: $input) {
    ...ProviderPublicProfileDraftFields
  }
}
    fragment ProviderPublicProfileDraftFields on ProviderPublicProfileDraft {
  id
  slug
  status
  reviewState
  displayName
  biography
  websiteUrl
  logoImageId
  logoPath
  draftVersion
  submittedAt
  reviewedAt
  reviewNote
  publishedAt
  isLive
  hasUnpublishedChanges
  links {
    label
    url
  }
}`) as unknown as TypedDocumentString<SubmitProviderPublicProfileMutation, SubmitProviderPublicProfileMutationVariables>;
export const WithdrawProviderPublicProfileDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation WithdrawProviderPublicProfile {
  withdrawProviderPublicProfile {
    ...ProviderPublicProfileDraftFields
  }
}
    fragment ProviderPublicProfileDraftFields on ProviderPublicProfileDraft {
  id
  slug
  status
  reviewState
  displayName
  biography
  websiteUrl
  logoImageId
  logoPath
  draftVersion
  submittedAt
  reviewedAt
  reviewNote
  publishedAt
  isLive
  hasUnpublishedChanges
  links {
    label
    url
  }
}`) as unknown as TypedDocumentString<WithdrawProviderPublicProfileMutation, WithdrawProviderPublicProfileMutationVariables>;
export const AdminProviderPublicProfilesDocument = /*#__PURE__*/ new TypedDocumentString(`
    query AdminProviderPublicProfiles($reviewState: ProviderProfileReviewState) {
  adminProviderPublicProfiles(reviewState: $reviewState) {
    ...AdminProviderPublicProfileFields
  }
}
    fragment AdminProviderPublicProfileFields on AdminProviderPublicProfile {
  id
  slug
  status
  reviewState
  displayName
  biography
  websiteUrl
  logoImageId
  logoPath
  draftVersion
  submittedAt
  reviewedAt
  reviewNote
  publishedAt
  isLive
  hasUnpublishedChanges
  links {
    label
    url
  }
  providerId
  providerName
  excludeFromIndex
  withdrawnAt
}`) as unknown as TypedDocumentString<AdminProviderPublicProfilesQuery, AdminProviderPublicProfilesQueryVariables>;
export const ReviewProviderPublicProfileDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation ReviewProviderPublicProfile($input: ReviewProviderPublicProfileInput!) {
  reviewProviderPublicProfile(input: $input) {
    ...AdminProviderPublicProfileFields
  }
}
    fragment AdminProviderPublicProfileFields on AdminProviderPublicProfile {
  id
  slug
  status
  reviewState
  displayName
  biography
  websiteUrl
  logoImageId
  logoPath
  draftVersion
  submittedAt
  reviewedAt
  reviewNote
  publishedAt
  isLive
  hasUnpublishedChanges
  links {
    label
    url
  }
  providerId
  providerName
  excludeFromIndex
  withdrawnAt
}`) as unknown as TypedDocumentString<ReviewProviderPublicProfileMutation, ReviewProviderPublicProfileMutationVariables>;
export const WithdrawProviderPublicProfileAsAdminDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation WithdrawProviderPublicProfileAsAdmin($input: ModerateProviderPublicProfileInput!) {
  withdrawProviderPublicProfileAsAdmin(input: $input) {
    ...AdminProviderPublicProfileFields
  }
}
    fragment AdminProviderPublicProfileFields on AdminProviderPublicProfile {
  id
  slug
  status
  reviewState
  displayName
  biography
  websiteUrl
  logoImageId
  logoPath
  draftVersion
  submittedAt
  reviewedAt
  reviewNote
  publishedAt
  isLive
  hasUnpublishedChanges
  links {
    label
    url
  }
  providerId
  providerName
  excludeFromIndex
  withdrawnAt
}`) as unknown as TypedDocumentString<WithdrawProviderPublicProfileAsAdminMutation, WithdrawProviderPublicProfileAsAdminMutationVariables>;
export const SetProviderPublicProfileIndexExclusionDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation SetProviderPublicProfileIndexExclusion($input: SetProviderPublicProfileIndexExclusionInput!) {
  setProviderPublicProfileIndexExclusion(input: $input) {
    id
    excludeFromIndex
  }
}
    `) as unknown as TypedDocumentString<SetProviderPublicProfileIndexExclusionMutation, SetProviderPublicProfileIndexExclusionMutationVariables>;