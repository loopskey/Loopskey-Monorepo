import * as Types from "@/lib/graphql/base";
import { TypedDocumentString } from "@/lib/graphql/document";
export type TopicHubItemFieldsFragment = { __typename?: 'TopicHubItem', kind: Types.ContentUrlKind, slug: string, title: string, summary?: string | null, imageUrl?: string | null, category?: string | null };

export type AdminTopicHubSummaryFieldsFragment = { __typename?: 'AdminTopicHubSummary', id: string, slug: string, title: string, status: Types.TopicHubStatus, version: number, linkCount: number, eligibleLinkCount: number, needsReview: boolean, excludeFromIndex: boolean, publishedAt?: string | null, updatedAt: string };

export type AdminTopicHubFieldsFragment = { __typename?: 'AdminTopicHub', id: string, slug: string, title: string, status: Types.TopicHubStatus, version: number, linkCount: number, eligibleLinkCount: number, needsReview: boolean, excludeFromIndex: boolean, publishedAt?: string | null, updatedAt: string, introduction: string, guidance: string, category?: string | null, sections: Array<{ __typename?: 'TopicHubSection', heading: string, body: string }>, references: Array<{ __typename?: 'AdminTopicHubReference', kind: Types.ContentUrlKind, contentId: string, slug?: string | null, title?: string | null, isEligible: boolean }>, translations: Array<{ __typename?: 'AdminTopicHubTranslation', locale: Types.AppLanguage, title: string, introduction: string, guidance: string, isPublished: boolean, version: number, sections: Array<{ __typename?: 'TopicHubSection', heading: string, body: string }> }> };

export type TopicHubBySlugQueryVariables = Types.Exact<{
  slug: Types.Scalars['String']['input'];
  locale?: Types.InputMaybe<Types.AppLanguage>;
}>;


export type TopicHubBySlugQuery = { __typename?: 'Query', topicHubBySlug: { __typename?: 'TopicHub', slug: string, title: string, introduction: string, guidance: string, category?: string | null, availableLocales: Array<Types.AppLanguage>, contentLanguage?: Types.AppLanguage | null, excludeFromIndex: boolean, publishedAt: string, updatedAt: string, sections: Array<{ __typename?: 'TopicHubSection', heading: string, body: string }>, items: Array<{ __typename?: 'TopicHubItem', kind: Types.ContentUrlKind, slug: string, title: string, summary?: string | null, imageUrl?: string | null, category?: string | null }> } };

export type TopicHubsQueryVariables = Types.Exact<{
  locale?: Types.InputMaybe<Types.AppLanguage>;
  take?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type TopicHubsQuery = { __typename?: 'Query', topicHubs: Array<{ __typename?: 'TopicHubSummary', slug: string, title: string, introduction: string }> };

export type TopicHubsForContentQueryVariables = Types.Exact<{
  kind: Types.ContentUrlKind;
  contentId: Types.Scalars['String']['input'];
  locale?: Types.InputMaybe<Types.AppLanguage>;
}>;


export type TopicHubsForContentQuery = { __typename?: 'Query', topicHubsForContent: Array<{ __typename?: 'TopicHubSummary', slug: string, title: string, introduction: string }> };

export type AdminTopicHubsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type AdminTopicHubsQuery = { __typename?: 'Query', adminTopicHubs: Array<{ __typename?: 'AdminTopicHubSummary', id: string, slug: string, title: string, status: Types.TopicHubStatus, version: number, linkCount: number, eligibleLinkCount: number, needsReview: boolean, excludeFromIndex: boolean, publishedAt?: string | null, updatedAt: string }> };

export type AdminTopicHubQueryVariables = Types.Exact<{
  hubId: Types.Scalars['String']['input'];
}>;


export type AdminTopicHubQuery = { __typename?: 'Query', adminTopicHub: { __typename?: 'AdminTopicHub', id: string, slug: string, title: string, status: Types.TopicHubStatus, version: number, linkCount: number, eligibleLinkCount: number, needsReview: boolean, excludeFromIndex: boolean, publishedAt?: string | null, updatedAt: string, introduction: string, guidance: string, category?: string | null, sections: Array<{ __typename?: 'TopicHubSection', heading: string, body: string }>, references: Array<{ __typename?: 'AdminTopicHubReference', kind: Types.ContentUrlKind, contentId: string, slug?: string | null, title?: string | null, isEligible: boolean }>, translations: Array<{ __typename?: 'AdminTopicHubTranslation', locale: Types.AppLanguage, title: string, introduction: string, guidance: string, isPublished: boolean, version: number, sections: Array<{ __typename?: 'TopicHubSection', heading: string, body: string }> }> } };

export type SaveTopicHubMutationVariables = Types.Exact<{
  input: Types.SaveTopicHubInput;
}>;


export type SaveTopicHubMutation = { __typename?: 'Mutation', saveTopicHub: { __typename?: 'AdminTopicHub', id: string, slug: string, title: string, status: Types.TopicHubStatus, version: number, linkCount: number, eligibleLinkCount: number, needsReview: boolean, excludeFromIndex: boolean, publishedAt?: string | null, updatedAt: string, introduction: string, guidance: string, category?: string | null, sections: Array<{ __typename?: 'TopicHubSection', heading: string, body: string }>, references: Array<{ __typename?: 'AdminTopicHubReference', kind: Types.ContentUrlKind, contentId: string, slug?: string | null, title?: string | null, isEligible: boolean }>, translations: Array<{ __typename?: 'AdminTopicHubTranslation', locale: Types.AppLanguage, title: string, introduction: string, guidance: string, isPublished: boolean, version: number, sections: Array<{ __typename?: 'TopicHubSection', heading: string, body: string }> }> } };

export type SetTopicHubStatusMutationVariables = Types.Exact<{
  input: Types.SetTopicHubStatusInput;
}>;


export type SetTopicHubStatusMutation = { __typename?: 'Mutation', setTopicHubStatus: { __typename?: 'AdminTopicHub', id: string, slug: string, title: string, status: Types.TopicHubStatus, version: number, linkCount: number, eligibleLinkCount: number, needsReview: boolean, excludeFromIndex: boolean, publishedAt?: string | null, updatedAt: string, introduction: string, guidance: string, category?: string | null, sections: Array<{ __typename?: 'TopicHubSection', heading: string, body: string }>, references: Array<{ __typename?: 'AdminTopicHubReference', kind: Types.ContentUrlKind, contentId: string, slug?: string | null, title?: string | null, isEligible: boolean }>, translations: Array<{ __typename?: 'AdminTopicHubTranslation', locale: Types.AppLanguage, title: string, introduction: string, guidance: string, isPublished: boolean, version: number, sections: Array<{ __typename?: 'TopicHubSection', heading: string, body: string }> }> } };

export type SetTopicHubTranslationPublicationMutationVariables = Types.Exact<{
  input: Types.SetTopicHubTranslationPublicationInput;
}>;


export type SetTopicHubTranslationPublicationMutation = { __typename?: 'Mutation', setTopicHubTranslationPublication: { __typename?: 'AdminTopicHub', id: string, slug: string, title: string, status: Types.TopicHubStatus, version: number, linkCount: number, eligibleLinkCount: number, needsReview: boolean, excludeFromIndex: boolean, publishedAt?: string | null, updatedAt: string, introduction: string, guidance: string, category?: string | null, sections: Array<{ __typename?: 'TopicHubSection', heading: string, body: string }>, references: Array<{ __typename?: 'AdminTopicHubReference', kind: Types.ContentUrlKind, contentId: string, slug?: string | null, title?: string | null, isEligible: boolean }>, translations: Array<{ __typename?: 'AdminTopicHubTranslation', locale: Types.AppLanguage, title: string, introduction: string, guidance: string, isPublished: boolean, version: number, sections: Array<{ __typename?: 'TopicHubSection', heading: string, body: string }> }> } };

export type SetTopicHubIndexExclusionMutationVariables = Types.Exact<{
  input: Types.SetTopicHubIndexExclusionInput;
}>;


export type SetTopicHubIndexExclusionMutation = { __typename?: 'Mutation', setTopicHubIndexExclusion: { __typename?: 'AdminTopicHub', id: string, excludeFromIndex: boolean } };

export const TopicHubItemFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment TopicHubItemFields on TopicHubItem {
  kind
  slug
  title
  summary
  imageUrl
  category
}
    `, {"fragmentName":"TopicHubItemFields"}) as unknown as TypedDocumentString<TopicHubItemFieldsFragment, unknown>;
export const AdminTopicHubSummaryFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment AdminTopicHubSummaryFields on AdminTopicHubSummary {
  id
  slug
  title
  status
  version
  linkCount
  eligibleLinkCount
  needsReview
  excludeFromIndex
  publishedAt
  updatedAt
}
    `, {"fragmentName":"AdminTopicHubSummaryFields"}) as unknown as TypedDocumentString<AdminTopicHubSummaryFieldsFragment, unknown>;
export const AdminTopicHubFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment AdminTopicHubFields on AdminTopicHub {
  id
  slug
  title
  status
  version
  linkCount
  eligibleLinkCount
  needsReview
  excludeFromIndex
  publishedAt
  updatedAt
  introduction
  guidance
  category
  sections {
    heading
    body
  }
  references {
    kind
    contentId
    slug
    title
    isEligible
  }
  translations {
    locale
    title
    introduction
    guidance
    isPublished
    version
    sections {
      heading
      body
    }
  }
}
    `, {"fragmentName":"AdminTopicHubFields"}) as unknown as TypedDocumentString<AdminTopicHubFieldsFragment, unknown>;
export const TopicHubBySlugDocument = /*#__PURE__*/ new TypedDocumentString(`
    query TopicHubBySlug($slug: String!, $locale: AppLanguage) {
  topicHubBySlug(slug: $slug, locale: $locale) {
    slug
    title
    introduction
    guidance
    category
    availableLocales
    contentLanguage
    excludeFromIndex
    publishedAt
    updatedAt
    sections {
      heading
      body
    }
    items {
      ...TopicHubItemFields
    }
  }
}
    fragment TopicHubItemFields on TopicHubItem {
  kind
  slug
  title
  summary
  imageUrl
  category
}`) as unknown as TypedDocumentString<TopicHubBySlugQuery, TopicHubBySlugQueryVariables>;
export const TopicHubsDocument = /*#__PURE__*/ new TypedDocumentString(`
    query TopicHubs($locale: AppLanguage, $take: Int) {
  topicHubs(locale: $locale, take: $take) {
    slug
    title
    introduction
  }
}
    `) as unknown as TypedDocumentString<TopicHubsQuery, TopicHubsQueryVariables>;
export const TopicHubsForContentDocument = /*#__PURE__*/ new TypedDocumentString(`
    query TopicHubsForContent($kind: ContentUrlKind!, $contentId: String!, $locale: AppLanguage) {
  topicHubsForContent(kind: $kind, contentId: $contentId, locale: $locale) {
    slug
    title
    introduction
  }
}
    `) as unknown as TypedDocumentString<TopicHubsForContentQuery, TopicHubsForContentQueryVariables>;
export const AdminTopicHubsDocument = /*#__PURE__*/ new TypedDocumentString(`
    query AdminTopicHubs {
  adminTopicHubs {
    ...AdminTopicHubSummaryFields
  }
}
    fragment AdminTopicHubSummaryFields on AdminTopicHubSummary {
  id
  slug
  title
  status
  version
  linkCount
  eligibleLinkCount
  needsReview
  excludeFromIndex
  publishedAt
  updatedAt
}`) as unknown as TypedDocumentString<AdminTopicHubsQuery, AdminTopicHubsQueryVariables>;
export const AdminTopicHubDocument = /*#__PURE__*/ new TypedDocumentString(`
    query AdminTopicHub($hubId: String!) {
  adminTopicHub(hubId: $hubId) {
    ...AdminTopicHubFields
  }
}
    fragment AdminTopicHubFields on AdminTopicHub {
  id
  slug
  title
  status
  version
  linkCount
  eligibleLinkCount
  needsReview
  excludeFromIndex
  publishedAt
  updatedAt
  introduction
  guidance
  category
  sections {
    heading
    body
  }
  references {
    kind
    contentId
    slug
    title
    isEligible
  }
  translations {
    locale
    title
    introduction
    guidance
    isPublished
    version
    sections {
      heading
      body
    }
  }
}`) as unknown as TypedDocumentString<AdminTopicHubQuery, AdminTopicHubQueryVariables>;
export const SaveTopicHubDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation SaveTopicHub($input: SaveTopicHubInput!) {
  saveTopicHub(input: $input) {
    ...AdminTopicHubFields
  }
}
    fragment AdminTopicHubFields on AdminTopicHub {
  id
  slug
  title
  status
  version
  linkCount
  eligibleLinkCount
  needsReview
  excludeFromIndex
  publishedAt
  updatedAt
  introduction
  guidance
  category
  sections {
    heading
    body
  }
  references {
    kind
    contentId
    slug
    title
    isEligible
  }
  translations {
    locale
    title
    introduction
    guidance
    isPublished
    version
    sections {
      heading
      body
    }
  }
}`) as unknown as TypedDocumentString<SaveTopicHubMutation, SaveTopicHubMutationVariables>;
export const SetTopicHubStatusDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation SetTopicHubStatus($input: SetTopicHubStatusInput!) {
  setTopicHubStatus(input: $input) {
    ...AdminTopicHubFields
  }
}
    fragment AdminTopicHubFields on AdminTopicHub {
  id
  slug
  title
  status
  version
  linkCount
  eligibleLinkCount
  needsReview
  excludeFromIndex
  publishedAt
  updatedAt
  introduction
  guidance
  category
  sections {
    heading
    body
  }
  references {
    kind
    contentId
    slug
    title
    isEligible
  }
  translations {
    locale
    title
    introduction
    guidance
    isPublished
    version
    sections {
      heading
      body
    }
  }
}`) as unknown as TypedDocumentString<SetTopicHubStatusMutation, SetTopicHubStatusMutationVariables>;
export const SetTopicHubTranslationPublicationDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation SetTopicHubTranslationPublication($input: SetTopicHubTranslationPublicationInput!) {
  setTopicHubTranslationPublication(input: $input) {
    ...AdminTopicHubFields
  }
}
    fragment AdminTopicHubFields on AdminTopicHub {
  id
  slug
  title
  status
  version
  linkCount
  eligibleLinkCount
  needsReview
  excludeFromIndex
  publishedAt
  updatedAt
  introduction
  guidance
  category
  sections {
    heading
    body
  }
  references {
    kind
    contentId
    slug
    title
    isEligible
  }
  translations {
    locale
    title
    introduction
    guidance
    isPublished
    version
    sections {
      heading
      body
    }
  }
}`) as unknown as TypedDocumentString<SetTopicHubTranslationPublicationMutation, SetTopicHubTranslationPublicationMutationVariables>;
export const SetTopicHubIndexExclusionDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation SetTopicHubIndexExclusion($input: SetTopicHubIndexExclusionInput!) {
  setTopicHubIndexExclusion(input: $input) {
    id
    excludeFromIndex
  }
}
    `) as unknown as TypedDocumentString<SetTopicHubIndexExclusionMutation, SetTopicHubIndexExclusionMutationVariables>;