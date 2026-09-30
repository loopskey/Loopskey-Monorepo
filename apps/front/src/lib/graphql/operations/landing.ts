import * as Types from "@/lib/graphql/base";
import { TypedDocumentString } from "@/lib/graphql/base";
export type PopularCategoryFieldsFragment = { __typename?: 'PopularCategory', category: string, totalItems: number, courseCount: number, eventCount: number, podcastCount: number, youtubeCount: number, averageRating: number, popularityScore: number };

export type PopularCategoriesQueryVariables = Types.Exact<{
  input?: Types.InputMaybe<Types.PopularCategoriesInput>;
}>;


export type PopularCategoriesQuery = { __typename?: 'Query', popularCategories: Array<{ __typename?: 'PopularCategory', category: string, totalItems: number, courseCount: number, eventCount: number, podcastCount: number, youtubeCount: number, averageRating: number, popularityScore: number }> };

export type LandingCatalogSearchItemFieldsFragment = { __typename?: 'LandingCatalogSearchItem', id: string, contentType: Types.ContentType, slug: string, title: string, imageUrl?: string | null, category: string, rating: number, durationMinutes?: number | null, startDate?: string | null, episodeCount?: number | null, videoCount?: number | null };

export type LandingCatalogSearchQueryVariables = Types.Exact<{
  input: Types.LandingCatalogSearchInput;
}>;


export type LandingCatalogSearchQuery = { __typename?: 'Query', landingCatalogSearch: Array<{ __typename?: 'LandingCatalogSearchItem', id: string, contentType: Types.ContentType, slug: string, title: string, imageUrl?: string | null, category: string, rating: number, durationMinutes?: number | null, startDate?: string | null, episodeCount?: number | null, videoCount?: number | null }> };

export const PopularCategoryFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment PopularCategoryFields on PopularCategory {
  category
  totalItems
  courseCount
  eventCount
  podcastCount
  youtubeCount
  averageRating
  popularityScore
}
    `, {"fragmentName":"PopularCategoryFields"}) as unknown as TypedDocumentString<PopularCategoryFieldsFragment, unknown>;
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
export const PopularCategoriesDocument = /*#__PURE__*/ new TypedDocumentString(`
    query PopularCategories($input: PopularCategoriesInput) {
  popularCategories(input: $input) {
    ...PopularCategoryFields
  }
}
    fragment PopularCategoryFields on PopularCategory {
  category
  totalItems
  courseCount
  eventCount
  podcastCount
  youtubeCount
  averageRating
  popularityScore
}`) as unknown as TypedDocumentString<PopularCategoriesQuery, PopularCategoriesQueryVariables>;
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