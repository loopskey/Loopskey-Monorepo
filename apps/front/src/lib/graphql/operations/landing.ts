import * as Types from "@/lib/graphql/base";
import { TypedDocumentString } from "@/lib/graphql/base";
export type PopularCategoryFieldsFragment = { __typename?: 'PopularCategory', category: string, totalItems: number, courseCount: number, eventCount: number, podcastCount: number, youtubeCount: number, averageRating: number, popularityScore: number };

export type PopularCategoriesQueryVariables = Types.Exact<{
  input?: Types.InputMaybe<Types.PopularCategoriesInput>;
}>;


export type PopularCategoriesQuery = { __typename?: 'Query', popularCategories: Array<{ __typename?: 'PopularCategory', category: string, totalItems: number, courseCount: number, eventCount: number, podcastCount: number, youtubeCount: number, averageRating: number, popularityScore: number }> };

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