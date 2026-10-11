import * as Types from "@/lib/graphql/base";
import { TypedDocumentString } from "@/lib/graphql/base";
export type ContentUrlSettingsFieldsFragment = { __typename?: 'ContentUrlSettings', kind: Types.ContentUrlKind, contentId: string, slug: string, retiredSlugs: Array<string> };

export type ContentUrlQueryVariables = Types.Exact<{
  kind: Types.ContentUrlKind;
  contentId: Types.Scalars['String']['input'];
}>;


export type ContentUrlQuery = { __typename?: 'Query', contentUrl: { __typename?: 'ContentUrlSettings', kind: Types.ContentUrlKind, contentId: string, slug: string, retiredSlugs: Array<string> } };

export type ChangeContentSlugMutationVariables = Types.Exact<{
  input: Types.ChangeContentSlugInput;
}>;


export type ChangeContentSlugMutation = { __typename?: 'Mutation', changeContentSlug: { __typename?: 'ContentUrlSettings', kind: Types.ContentUrlKind, contentId: string, slug: string, retiredSlugs: Array<string> } };

export type ResolveContentUrlQueryVariables = Types.Exact<{
  kind: Types.ContentUrlKind;
  slug: Types.Scalars['String']['input'];
}>;


export type ResolveContentUrlQuery = { __typename?: 'Query', resolveContentUrl?: { __typename?: 'ContentUrlResolution', slug: string } | null };

export const ContentUrlSettingsFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment ContentUrlSettingsFields on ContentUrlSettings {
  kind
  contentId
  slug
  retiredSlugs
}
    `, {"fragmentName":"ContentUrlSettingsFields"}) as unknown as TypedDocumentString<ContentUrlSettingsFieldsFragment, unknown>;
export const ContentUrlDocument = /*#__PURE__*/ new TypedDocumentString(`
    query ContentUrl($kind: ContentUrlKind!, $contentId: String!) {
  contentUrl(kind: $kind, contentId: $contentId) {
    ...ContentUrlSettingsFields
  }
}
    fragment ContentUrlSettingsFields on ContentUrlSettings {
  kind
  contentId
  slug
  retiredSlugs
}`) as unknown as TypedDocumentString<ContentUrlQuery, ContentUrlQueryVariables>;
export const ChangeContentSlugDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation ChangeContentSlug($input: ChangeContentSlugInput!) {
  changeContentSlug(input: $input) {
    ...ContentUrlSettingsFields
  }
}
    fragment ContentUrlSettingsFields on ContentUrlSettings {
  kind
  contentId
  slug
  retiredSlugs
}`) as unknown as TypedDocumentString<ChangeContentSlugMutation, ChangeContentSlugMutationVariables>;
export const ResolveContentUrlDocument = /*#__PURE__*/ new TypedDocumentString(`
    query ResolveContentUrl($kind: ContentUrlKind!, $slug: String!) {
  resolveContentUrl(kind: $kind, slug: $slug) {
    slug
  }
}
    `) as unknown as TypedDocumentString<ResolveContentUrlQuery, ResolveContentUrlQueryVariables>;