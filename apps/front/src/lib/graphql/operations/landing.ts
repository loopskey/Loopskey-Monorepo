import * as Types from "@/lib/graphql/base";
import { TypedDocumentString } from "@/lib/graphql/document";
export type LandingCatalogSearchItemFieldsFragment = { __typename?: 'LandingCatalogSearchItem', id: string, contentType: Types.ContentType, slug: string, title: string, imageUrl?: string | null, category: string, rating: number, durationMinutes?: number | null, startDate?: string | null, episodeCount?: number | null, videoCount?: number | null };

export type LandingCatalogSearchQueryVariables = Types.Exact<{
  input: Types.LandingCatalogSearchInput;
}>;


export type LandingCatalogSearchQuery = { __typename?: 'Query', landingCatalogSearch: Array<{ __typename?: 'LandingCatalogSearchItem', id: string, contentType: Types.ContentType, slug: string, title: string, imageUrl?: string | null, category: string, rating: number, durationMinutes?: number | null, startDate?: string | null, episodeCount?: number | null, videoCount?: number | null }> };

export const LandingCatalogSearchItemFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment LandingCatalogSearchItemFields on LandingCatalogSearchItem {
  id
  contentType
  slug
  title
  imageUrl
  category
  rating
  durationMinutes
  startDate
  episodeCount
  videoCount
}
    `, {"fragmentName":"LandingCatalogSearchItemFields"}) as unknown as TypedDocumentString<LandingCatalogSearchItemFieldsFragment, unknown>;
export const LandingCatalogSearchDocument = /*#__PURE__*/ new TypedDocumentString(`
    query LandingCatalogSearch($input: LandingCatalogSearchInput!) {
  landingCatalogSearch(input: $input) {
    ...LandingCatalogSearchItemFields
  }
}
    fragment LandingCatalogSearchItemFields on LandingCatalogSearchItem {
  id
  contentType
  slug
  title
  imageUrl
  category
  rating
  durationMinutes
  startDate
  episodeCount
  videoCount
}`) as unknown as TypedDocumentString<LandingCatalogSearchQuery, LandingCatalogSearchQueryVariables>;