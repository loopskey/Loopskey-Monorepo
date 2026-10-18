import * as Types from "@/lib/graphql/base";
import { TypedDocumentString } from "@/lib/graphql/document";
export type ContentSeoSettingsFieldsFragment = { __typename?: 'ContentSeoSettings', excludeFromIndex: boolean, locales: Array<{ __typename?: 'ContentSeoLocale', locale: Types.AppLanguage, version: number, seoTitle?: string | null, seoDescription?: string | null, socialImageId?: string | null, socialImagePath?: string | null, socialImageAlt?: string | null, defaultTitle: string, defaultDescription?: string | null, updatedAt?: string | null }> };

export type CourseSeoQueryVariables = Types.Exact<{
  courseId: Types.Scalars['String']['input'];
}>;


export type CourseSeoQuery = { __typename?: 'Query', courseSeo: { __typename?: 'ContentSeoSettings', excludeFromIndex: boolean, locales: Array<{ __typename?: 'ContentSeoLocale', locale: Types.AppLanguage, version: number, seoTitle?: string | null, seoDescription?: string | null, socialImageId?: string | null, socialImagePath?: string | null, socialImageAlt?: string | null, defaultTitle: string, defaultDescription?: string | null, updatedAt?: string | null }> } };

export type SaveCourseSeoMutationVariables = Types.Exact<{
  input: Types.SaveContentSeoInput;
}>;


export type SaveCourseSeoMutation = { __typename?: 'Mutation', saveCourseSeo: { __typename?: 'ContentSeoSettings', excludeFromIndex: boolean, locales: Array<{ __typename?: 'ContentSeoLocale', locale: Types.AppLanguage, version: number, seoTitle?: string | null, seoDescription?: string | null, socialImageId?: string | null, socialImagePath?: string | null, socialImageAlt?: string | null, defaultTitle: string, defaultDescription?: string | null, updatedAt?: string | null }> } };

export type SetCourseIndexExclusionMutationVariables = Types.Exact<{
  input: Types.SetContentIndexExclusionInput;
}>;


export type SetCourseIndexExclusionMutation = { __typename?: 'Mutation', setCourseIndexExclusion: { __typename?: 'ContentSeoSettings', excludeFromIndex: boolean, locales: Array<{ __typename?: 'ContentSeoLocale', locale: Types.AppLanguage, version: number, seoTitle?: string | null, seoDescription?: string | null, socialImageId?: string | null, socialImagePath?: string | null, socialImageAlt?: string | null, defaultTitle: string, defaultDescription?: string | null, updatedAt?: string | null }> } };

export type EventSeoQueryVariables = Types.Exact<{
  eventId: Types.Scalars['String']['input'];
}>;


export type EventSeoQuery = { __typename?: 'Query', eventSeo: { __typename?: 'ContentSeoSettings', excludeFromIndex: boolean, locales: Array<{ __typename?: 'ContentSeoLocale', locale: Types.AppLanguage, version: number, seoTitle?: string | null, seoDescription?: string | null, socialImageId?: string | null, socialImagePath?: string | null, socialImageAlt?: string | null, defaultTitle: string, defaultDescription?: string | null, updatedAt?: string | null }> } };

export type SaveEventSeoMutationVariables = Types.Exact<{
  input: Types.SaveContentSeoInput;
}>;


export type SaveEventSeoMutation = { __typename?: 'Mutation', saveEventSeo: { __typename?: 'ContentSeoSettings', excludeFromIndex: boolean, locales: Array<{ __typename?: 'ContentSeoLocale', locale: Types.AppLanguage, version: number, seoTitle?: string | null, seoDescription?: string | null, socialImageId?: string | null, socialImagePath?: string | null, socialImageAlt?: string | null, defaultTitle: string, defaultDescription?: string | null, updatedAt?: string | null }> } };

export type SetEventIndexExclusionMutationVariables = Types.Exact<{
  input: Types.SetContentIndexExclusionInput;
}>;


export type SetEventIndexExclusionMutation = { __typename?: 'Mutation', setEventIndexExclusion: { __typename?: 'ContentSeoSettings', excludeFromIndex: boolean, locales: Array<{ __typename?: 'ContentSeoLocale', locale: Types.AppLanguage, version: number, seoTitle?: string | null, seoDescription?: string | null, socialImageId?: string | null, socialImagePath?: string | null, socialImageAlt?: string | null, defaultTitle: string, defaultDescription?: string | null, updatedAt?: string | null }> } };

export type PodcastSeoQueryVariables = Types.Exact<{
  podcastId: Types.Scalars['String']['input'];
}>;


export type PodcastSeoQuery = { __typename?: 'Query', podcastSeo: { __typename?: 'ContentSeoSettings', excludeFromIndex: boolean, locales: Array<{ __typename?: 'ContentSeoLocale', locale: Types.AppLanguage, version: number, seoTitle?: string | null, seoDescription?: string | null, socialImageId?: string | null, socialImagePath?: string | null, socialImageAlt?: string | null, defaultTitle: string, defaultDescription?: string | null, updatedAt?: string | null }> } };

export type SavePodcastSeoMutationVariables = Types.Exact<{
  input: Types.SaveContentSeoInput;
}>;


export type SavePodcastSeoMutation = { __typename?: 'Mutation', savePodcastSeo: { __typename?: 'ContentSeoSettings', excludeFromIndex: boolean, locales: Array<{ __typename?: 'ContentSeoLocale', locale: Types.AppLanguage, version: number, seoTitle?: string | null, seoDescription?: string | null, socialImageId?: string | null, socialImagePath?: string | null, socialImageAlt?: string | null, defaultTitle: string, defaultDescription?: string | null, updatedAt?: string | null }> } };

export type SetPodcastIndexExclusionMutationVariables = Types.Exact<{
  input: Types.SetContentIndexExclusionInput;
}>;


export type SetPodcastIndexExclusionMutation = { __typename?: 'Mutation', setPodcastIndexExclusion: { __typename?: 'ContentSeoSettings', excludeFromIndex: boolean, locales: Array<{ __typename?: 'ContentSeoLocale', locale: Types.AppLanguage, version: number, seoTitle?: string | null, seoDescription?: string | null, socialImageId?: string | null, socialImagePath?: string | null, socialImageAlt?: string | null, defaultTitle: string, defaultDescription?: string | null, updatedAt?: string | null }> } };

export type YouTubeChannelSeoQueryVariables = Types.Exact<{
  channelId: Types.Scalars['String']['input'];
}>;


export type YouTubeChannelSeoQuery = { __typename?: 'Query', youtubeChannelSeo: { __typename?: 'ContentSeoSettings', excludeFromIndex: boolean, locales: Array<{ __typename?: 'ContentSeoLocale', locale: Types.AppLanguage, version: number, seoTitle?: string | null, seoDescription?: string | null, socialImageId?: string | null, socialImagePath?: string | null, socialImageAlt?: string | null, defaultTitle: string, defaultDescription?: string | null, updatedAt?: string | null }> } };

export type SaveYouTubeChannelSeoMutationVariables = Types.Exact<{
  input: Types.SaveContentSeoInput;
}>;


export type SaveYouTubeChannelSeoMutation = { __typename?: 'Mutation', saveYouTubeChannelSeo: { __typename?: 'ContentSeoSettings', excludeFromIndex: boolean, locales: Array<{ __typename?: 'ContentSeoLocale', locale: Types.AppLanguage, version: number, seoTitle?: string | null, seoDescription?: string | null, socialImageId?: string | null, socialImagePath?: string | null, socialImageAlt?: string | null, defaultTitle: string, defaultDescription?: string | null, updatedAt?: string | null }> } };

export type SetYouTubeChannelIndexExclusionMutationVariables = Types.Exact<{
  input: Types.SetContentIndexExclusionInput;
}>;


export type SetYouTubeChannelIndexExclusionMutation = { __typename?: 'Mutation', setYouTubeChannelIndexExclusion: { __typename?: 'ContentSeoSettings', excludeFromIndex: boolean, locales: Array<{ __typename?: 'ContentSeoLocale', locale: Types.AppLanguage, version: number, seoTitle?: string | null, seoDescription?: string | null, socialImageId?: string | null, socialImagePath?: string | null, socialImageAlt?: string | null, defaultTitle: string, defaultDescription?: string | null, updatedAt?: string | null }> } };

export const ContentSeoSettingsFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment ContentSeoSettingsFields on ContentSeoSettings {
  excludeFromIndex
  locales {
    locale
    version
    seoTitle
    seoDescription
    socialImageId
    socialImagePath
    socialImageAlt
    defaultTitle
    defaultDescription
    updatedAt
  }
}
    `, {"fragmentName":"ContentSeoSettingsFields"}) as unknown as TypedDocumentString<ContentSeoSettingsFieldsFragment, unknown>;
export const CourseSeoDocument = /*#__PURE__*/ new TypedDocumentString(`
    query CourseSeo($courseId: String!) {
  courseSeo(courseId: $courseId) {
    ...ContentSeoSettingsFields
  }
}
    fragment ContentSeoSettingsFields on ContentSeoSettings {
  excludeFromIndex
  locales {
    locale
    version
    seoTitle
    seoDescription
    socialImageId
    socialImagePath
    socialImageAlt
    defaultTitle
    defaultDescription
    updatedAt
  }
}`) as unknown as TypedDocumentString<CourseSeoQuery, CourseSeoQueryVariables>;
export const SaveCourseSeoDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation SaveCourseSeo($input: SaveContentSeoInput!) {
  saveCourseSeo(input: $input) {
    ...ContentSeoSettingsFields
  }
}
    fragment ContentSeoSettingsFields on ContentSeoSettings {
  excludeFromIndex
  locales {
    locale
    version
    seoTitle
    seoDescription
    socialImageId
    socialImagePath
    socialImageAlt
    defaultTitle
    defaultDescription
    updatedAt
  }
}`) as unknown as TypedDocumentString<SaveCourseSeoMutation, SaveCourseSeoMutationVariables>;
export const SetCourseIndexExclusionDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation SetCourseIndexExclusion($input: SetContentIndexExclusionInput!) {
  setCourseIndexExclusion(input: $input) {
    ...ContentSeoSettingsFields
  }
}
    fragment ContentSeoSettingsFields on ContentSeoSettings {
  excludeFromIndex
  locales {
    locale
    version
    seoTitle
    seoDescription
    socialImageId
    socialImagePath
    socialImageAlt
    defaultTitle
    defaultDescription
    updatedAt
  }
}`) as unknown as TypedDocumentString<SetCourseIndexExclusionMutation, SetCourseIndexExclusionMutationVariables>;
export const EventSeoDocument = /*#__PURE__*/ new TypedDocumentString(`
    query EventSeo($eventId: String!) {
  eventSeo(eventId: $eventId) {
    ...ContentSeoSettingsFields
  }
}
    fragment ContentSeoSettingsFields on ContentSeoSettings {
  excludeFromIndex
  locales {
    locale
    version
    seoTitle
    seoDescription
    socialImageId
    socialImagePath
    socialImageAlt
    defaultTitle
    defaultDescription
    updatedAt
  }
}`) as unknown as TypedDocumentString<EventSeoQuery, EventSeoQueryVariables>;
export const SaveEventSeoDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation SaveEventSeo($input: SaveContentSeoInput!) {
  saveEventSeo(input: $input) {
    ...ContentSeoSettingsFields
  }
}
    fragment ContentSeoSettingsFields on ContentSeoSettings {
  excludeFromIndex
  locales {
    locale
    version
    seoTitle
    seoDescription
    socialImageId
    socialImagePath
    socialImageAlt
    defaultTitle
    defaultDescription
    updatedAt
  }
}`) as unknown as TypedDocumentString<SaveEventSeoMutation, SaveEventSeoMutationVariables>;
export const SetEventIndexExclusionDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation SetEventIndexExclusion($input: SetContentIndexExclusionInput!) {
  setEventIndexExclusion(input: $input) {
    ...ContentSeoSettingsFields
  }
}
    fragment ContentSeoSettingsFields on ContentSeoSettings {
  excludeFromIndex
  locales {
    locale
    version
    seoTitle
    seoDescription
    socialImageId
    socialImagePath
    socialImageAlt
    defaultTitle
    defaultDescription
    updatedAt
  }
}`) as unknown as TypedDocumentString<SetEventIndexExclusionMutation, SetEventIndexExclusionMutationVariables>;
export const PodcastSeoDocument = /*#__PURE__*/ new TypedDocumentString(`
    query PodcastSeo($podcastId: String!) {
  podcastSeo(podcastId: $podcastId) {
    ...ContentSeoSettingsFields
  }
}
    fragment ContentSeoSettingsFields on ContentSeoSettings {
  excludeFromIndex
  locales {
    locale
    version
    seoTitle
    seoDescription
    socialImageId
    socialImagePath
    socialImageAlt
    defaultTitle
    defaultDescription
    updatedAt
  }
}`) as unknown as TypedDocumentString<PodcastSeoQuery, PodcastSeoQueryVariables>;
export const SavePodcastSeoDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation SavePodcastSeo($input: SaveContentSeoInput!) {
  savePodcastSeo(input: $input) {
    ...ContentSeoSettingsFields
  }
}
    fragment ContentSeoSettingsFields on ContentSeoSettings {
  excludeFromIndex
  locales {
    locale
    version
    seoTitle
    seoDescription
    socialImageId
    socialImagePath
    socialImageAlt
    defaultTitle
    defaultDescription
    updatedAt
  }
}`) as unknown as TypedDocumentString<SavePodcastSeoMutation, SavePodcastSeoMutationVariables>;
export const SetPodcastIndexExclusionDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation SetPodcastIndexExclusion($input: SetContentIndexExclusionInput!) {
  setPodcastIndexExclusion(input: $input) {
    ...ContentSeoSettingsFields
  }
}
    fragment ContentSeoSettingsFields on ContentSeoSettings {
  excludeFromIndex
  locales {
    locale
    version
    seoTitle
    seoDescription
    socialImageId
    socialImagePath
    socialImageAlt
    defaultTitle
    defaultDescription
    updatedAt
  }
}`) as unknown as TypedDocumentString<SetPodcastIndexExclusionMutation, SetPodcastIndexExclusionMutationVariables>;
export const YouTubeChannelSeoDocument = /*#__PURE__*/ new TypedDocumentString(`
    query YouTubeChannelSeo($channelId: String!) {
  youtubeChannelSeo(channelId: $channelId) {
    ...ContentSeoSettingsFields
  }
}
    fragment ContentSeoSettingsFields on ContentSeoSettings {
  excludeFromIndex
  locales {
    locale
    version
    seoTitle
    seoDescription
    socialImageId
    socialImagePath
    socialImageAlt
    defaultTitle
    defaultDescription
    updatedAt
  }
}`) as unknown as TypedDocumentString<YouTubeChannelSeoQuery, YouTubeChannelSeoQueryVariables>;
export const SaveYouTubeChannelSeoDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation SaveYouTubeChannelSeo($input: SaveContentSeoInput!) {
  saveYouTubeChannelSeo(input: $input) {
    ...ContentSeoSettingsFields
  }
}
    fragment ContentSeoSettingsFields on ContentSeoSettings {
  excludeFromIndex
  locales {
    locale
    version
    seoTitle
    seoDescription
    socialImageId
    socialImagePath
    socialImageAlt
    defaultTitle
    defaultDescription
    updatedAt
  }
}`) as unknown as TypedDocumentString<SaveYouTubeChannelSeoMutation, SaveYouTubeChannelSeoMutationVariables>;
export const SetYouTubeChannelIndexExclusionDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation SetYouTubeChannelIndexExclusion($input: SetContentIndexExclusionInput!) {
  setYouTubeChannelIndexExclusion(input: $input) {
    ...ContentSeoSettingsFields
  }
}
    fragment ContentSeoSettingsFields on ContentSeoSettings {
  excludeFromIndex
  locales {
    locale
    version
    seoTitle
    seoDescription
    socialImageId
    socialImagePath
    socialImageAlt
    defaultTitle
    defaultDescription
    updatedAt
  }
}`) as unknown as TypedDocumentString<SetYouTubeChannelIndexExclusionMutation, SetYouTubeChannelIndexExclusionMutationVariables>;