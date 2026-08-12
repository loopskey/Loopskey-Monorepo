import * as Types from "@/lib/graphql/base";
import { TypedDocumentString } from "@/lib/graphql/base";
export type PodcastFieldsFragment = { __typename?: 'Podcast', id: string, host: string, slug: string, title: string, status: Types.PodcastStatus, rating: number, category: Types.PodcastCategory, imageUrl?: string | null, listeners: number, createdAt: string, updatedAt: string, deletedAt?: string | null, isFeatured: boolean, providerId?: string | null, description: string, ratingCount: number, episodeCount: number, durationMinutes?: number | null };

export type PodcastEpisodeFieldsFragment = { __typename?: 'PodcastEpisode', id: string, title: string, audioUrl?: string | null, podcastId: string, updatedAt: string, createdAt: string, publishedAt?: string | null, description?: string | null, episodeNumber: number, durationMinutes?: number | null };

export type PodcastPageInfoFieldsFragment = { __typename?: 'PodcastPageInfo', nextCursor?: string | null, hasNextPage: boolean };

export type PodcastsQueryVariables = Types.Exact<{
  filter?: Types.InputMaybe<Types.PodcastFilterInput>;
  pagination?: Types.InputMaybe<Types.PodcastPaginationInput>;
  sort?: Types.InputMaybe<Types.PodcastSortInput>;
}>;


export type PodcastsQuery = { __typename?: 'Query', podcasts: { __typename?: 'PaginatedPodcasts', totalCount: number, items: Array<{ __typename?: 'Podcast', id: string, host: string, slug: string, title: string, status: Types.PodcastStatus, rating: number, category: Types.PodcastCategory, imageUrl?: string | null, listeners: number, createdAt: string, updatedAt: string, deletedAt?: string | null, isFeatured: boolean, providerId?: string | null, description: string, ratingCount: number, episodeCount: number, durationMinutes?: number | null }>, pageInfo: { __typename?: 'PodcastPageInfo', nextCursor?: string | null, hasNextPage: boolean } } };

export type PodcastByIdQueryVariables = Types.Exact<{
  podcastId: Types.Scalars['String']['input'];
}>;


export type PodcastByIdQuery = { __typename?: 'Query', podcastById: { __typename?: 'Podcast', id: string, host: string, slug: string, title: string, status: Types.PodcastStatus, rating: number, category: Types.PodcastCategory, imageUrl?: string | null, listeners: number, createdAt: string, updatedAt: string, deletedAt?: string | null, isFeatured: boolean, providerId?: string | null, description: string, ratingCount: number, episodeCount: number, durationMinutes?: number | null } };

export type PodcastBySlugQueryVariables = Types.Exact<{
  slug: Types.Scalars['String']['input'];
}>;


export type PodcastBySlugQuery = { __typename?: 'Query', podcastBySlug: { __typename?: 'Podcast', id: string, host: string, slug: string, title: string, status: Types.PodcastStatus, rating: number, category: Types.PodcastCategory, imageUrl?: string | null, listeners: number, createdAt: string, updatedAt: string, deletedAt?: string | null, isFeatured: boolean, providerId?: string | null, description: string, ratingCount: number, episodeCount: number, durationMinutes?: number | null } };

export type FeaturedPodcastsQueryVariables = Types.Exact<{
  take?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type FeaturedPodcastsQuery = { __typename?: 'Query', featuredPodcasts: Array<{ __typename?: 'Podcast', id: string, host: string, slug: string, title: string, status: Types.PodcastStatus, rating: number, category: Types.PodcastCategory, imageUrl?: string | null, listeners: number, createdAt: string, updatedAt: string, deletedAt?: string | null, isFeatured: boolean, providerId?: string | null, description: string, ratingCount: number, episodeCount: number, durationMinutes?: number | null }> };

export type PodcastEpisodesQueryVariables = Types.Exact<{
  podcastId: Types.Scalars['String']['input'];
}>;


export type PodcastEpisodesQuery = { __typename?: 'Query', podcastEpisodes: Array<{ __typename?: 'PodcastEpisode', id: string, title: string, audioUrl?: string | null, podcastId: string, updatedAt: string, createdAt: string, publishedAt?: string | null, description?: string | null, episodeNumber: number, durationMinutes?: number | null }> };

export type MyProviderPodcastsQueryVariables = Types.Exact<{
  filter?: Types.InputMaybe<Types.PodcastFilterInput>;
  pagination?: Types.InputMaybe<Types.PodcastPaginationInput>;
  sort?: Types.InputMaybe<Types.PodcastSortInput>;
}>;


export type MyProviderPodcastsQuery = { __typename?: 'Query', myProviderPodcasts: { __typename?: 'PaginatedPodcasts', totalCount: number, items: Array<{ __typename?: 'Podcast', id: string, host: string, slug: string, title: string, status: Types.PodcastStatus, rating: number, category: Types.PodcastCategory, imageUrl?: string | null, listeners: number, createdAt: string, updatedAt: string, deletedAt?: string | null, isFeatured: boolean, providerId?: string | null, description: string, ratingCount: number, episodeCount: number, durationMinutes?: number | null }>, pageInfo: { __typename?: 'PodcastPageInfo', nextCursor?: string | null, hasNextPage: boolean } } };

export type CreatePodcastMutationVariables = Types.Exact<{
  input: Types.CreatePodcastInput;
}>;


export type CreatePodcastMutation = { __typename?: 'Mutation', createPodcast: { __typename?: 'Podcast', id: string, host: string, slug: string, title: string, status: Types.PodcastStatus, rating: number, category: Types.PodcastCategory, imageUrl?: string | null, listeners: number, createdAt: string, updatedAt: string, deletedAt?: string | null, isFeatured: boolean, providerId?: string | null, description: string, ratingCount: number, episodeCount: number, durationMinutes?: number | null } };

export type UpdatePodcastMutationVariables = Types.Exact<{
  input: Types.UpdatePodcastInput;
}>;


export type UpdatePodcastMutation = { __typename?: 'Mutation', updatePodcast: { __typename?: 'Podcast', id: string, host: string, slug: string, title: string, status: Types.PodcastStatus, rating: number, category: Types.PodcastCategory, imageUrl?: string | null, listeners: number, createdAt: string, updatedAt: string, deletedAt?: string | null, isFeatured: boolean, providerId?: string | null, description: string, ratingCount: number, episodeCount: number, durationMinutes?: number | null } };

export type PublishPodcastMutationVariables = Types.Exact<{
  podcastId: Types.Scalars['String']['input'];
}>;


export type PublishPodcastMutation = { __typename?: 'Mutation', publishPodcast: { __typename?: 'Podcast', id: string, host: string, slug: string, title: string, status: Types.PodcastStatus, rating: number, category: Types.PodcastCategory, imageUrl?: string | null, listeners: number, createdAt: string, updatedAt: string, deletedAt?: string | null, isFeatured: boolean, providerId?: string | null, description: string, ratingCount: number, episodeCount: number, durationMinutes?: number | null } };

export type ArchivePodcastMutationVariables = Types.Exact<{
  podcastId: Types.Scalars['String']['input'];
}>;


export type ArchivePodcastMutation = { __typename?: 'Mutation', archivePodcast: { __typename?: 'Podcast', id: string, host: string, slug: string, title: string, status: Types.PodcastStatus, rating: number, category: Types.PodcastCategory, imageUrl?: string | null, listeners: number, createdAt: string, updatedAt: string, deletedAt?: string | null, isFeatured: boolean, providerId?: string | null, description: string, ratingCount: number, episodeCount: number, durationMinutes?: number | null } };

export type DeletePodcastMutationVariables = Types.Exact<{
  podcastId: Types.Scalars['String']['input'];
}>;


export type DeletePodcastMutation = { __typename?: 'Mutation', deletePodcast: { __typename?: 'Podcast', id: string, host: string, slug: string, title: string, status: Types.PodcastStatus, rating: number, category: Types.PodcastCategory, imageUrl?: string | null, listeners: number, createdAt: string, updatedAt: string, deletedAt?: string | null, isFeatured: boolean, providerId?: string | null, description: string, ratingCount: number, episodeCount: number, durationMinutes?: number | null } };

export type RestorePodcastMutationVariables = Types.Exact<{
  podcastId: Types.Scalars['String']['input'];
}>;


export type RestorePodcastMutation = { __typename?: 'Mutation', restorePodcast: { __typename?: 'Podcast', id: string, host: string, slug: string, title: string, status: Types.PodcastStatus, rating: number, category: Types.PodcastCategory, imageUrl?: string | null, listeners: number, createdAt: string, updatedAt: string, deletedAt?: string | null, isFeatured: boolean, providerId?: string | null, description: string, ratingCount: number, episodeCount: number, durationMinutes?: number | null } };

export type CreatePodcastEpisodeMutationVariables = Types.Exact<{
  input: Types.CreatePodcastEpisodeInput;
}>;


export type CreatePodcastEpisodeMutation = { __typename?: 'Mutation', createPodcastEpisode: { __typename?: 'PodcastEpisode', id: string, title: string, audioUrl?: string | null, podcastId: string, updatedAt: string, createdAt: string, publishedAt?: string | null, description?: string | null, episodeNumber: number, durationMinutes?: number | null } };

export type UpdatePodcastEpisodeMutationVariables = Types.Exact<{
  input: Types.UpdatePodcastEpisodeInput;
}>;


export type UpdatePodcastEpisodeMutation = { __typename?: 'Mutation', updatePodcastEpisode: { __typename?: 'PodcastEpisode', id: string, title: string, audioUrl?: string | null, podcastId: string, updatedAt: string, createdAt: string, publishedAt?: string | null, description?: string | null, episodeNumber: number, durationMinutes?: number | null } };

export type DeletePodcastEpisodeMutationVariables = Types.Exact<{
  episodeId: Types.Scalars['String']['input'];
}>;


export type DeletePodcastEpisodeMutation = { __typename?: 'Mutation', deletePodcastEpisode: { __typename?: 'PodcastEpisode', id: string, title: string, audioUrl?: string | null, podcastId: string, updatedAt: string, createdAt: string, publishedAt?: string | null, description?: string | null, episodeNumber: number, durationMinutes?: number | null } };

export const PodcastFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment PodcastFields on Podcast {
  id
  host
  slug
  title
  status
  rating
  category
  imageUrl
  listeners
  createdAt
  updatedAt
  deletedAt
  isFeatured
  providerId
  description
  ratingCount
  episodeCount
  durationMinutes
}
    `, {"fragmentName":"PodcastFields"}) as unknown as TypedDocumentString<PodcastFieldsFragment, unknown>;
export const PodcastEpisodeFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment PodcastEpisodeFields on PodcastEpisode {
  id
  title
  audioUrl
  podcastId
  updatedAt
  createdAt
  publishedAt
  description
  episodeNumber
  durationMinutes
}
    `, {"fragmentName":"PodcastEpisodeFields"}) as unknown as TypedDocumentString<PodcastEpisodeFieldsFragment, unknown>;
export const PodcastPageInfoFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment PodcastPageInfoFields on PodcastPageInfo {
  nextCursor
  hasNextPage
}
    `, {"fragmentName":"PodcastPageInfoFields"}) as unknown as TypedDocumentString<PodcastPageInfoFieldsFragment, unknown>;
export const PodcastsDocument = /*#__PURE__*/ new TypedDocumentString(`
    query Podcasts($filter: PodcastFilterInput, $pagination: PodcastPaginationInput, $sort: PodcastSortInput) {
  podcasts(filter: $filter, pagination: $pagination, sort: $sort) {
    items {
      ...PodcastFields
    }
    totalCount
    pageInfo {
      ...PodcastPageInfoFields
    }
  }
}
    fragment PodcastFields on Podcast {
  id
  host
  slug
  title
  status
  rating
  category
  imageUrl
  listeners
  createdAt
  updatedAt
  deletedAt
  isFeatured
  providerId
  description
  ratingCount
  episodeCount
  durationMinutes
}
fragment PodcastPageInfoFields on PodcastPageInfo {
  nextCursor
  hasNextPage
}`) as unknown as TypedDocumentString<PodcastsQuery, PodcastsQueryVariables>;
export const PodcastByIdDocument = /*#__PURE__*/ new TypedDocumentString(`
    query PodcastById($podcastId: String!) {
  podcastById(podcastId: $podcastId) {
    ...PodcastFields
  }
}
    fragment PodcastFields on Podcast {
  id
  host
  slug
  title
  status
  rating
  category
  imageUrl
  listeners
  createdAt
  updatedAt
  deletedAt
  isFeatured
  providerId
  description
  ratingCount
  episodeCount
  durationMinutes
}`) as unknown as TypedDocumentString<PodcastByIdQuery, PodcastByIdQueryVariables>;
export const PodcastBySlugDocument = /*#__PURE__*/ new TypedDocumentString(`
    query PodcastBySlug($slug: String!) {
  podcastBySlug(slug: $slug) {
    ...PodcastFields
  }
}
    fragment PodcastFields on Podcast {
  id
  host
  slug
  title
  status
  rating
  category
  imageUrl
  listeners
  createdAt
  updatedAt
  deletedAt
  isFeatured
  providerId
  description
  ratingCount
  episodeCount
  durationMinutes
}`) as unknown as TypedDocumentString<PodcastBySlugQuery, PodcastBySlugQueryVariables>;
export const FeaturedPodcastsDocument = /*#__PURE__*/ new TypedDocumentString(`
    query FeaturedPodcasts($take: Int) {
  featuredPodcasts(take: $take) {
    ...PodcastFields
  }
}
    fragment PodcastFields on Podcast {
  id
  host
  slug
  title
  status
  rating
  category
  imageUrl
  listeners
  createdAt
  updatedAt
  deletedAt
  isFeatured
  providerId
  description
  ratingCount
  episodeCount
  durationMinutes
}`) as unknown as TypedDocumentString<FeaturedPodcastsQuery, FeaturedPodcastsQueryVariables>;
export const PodcastEpisodesDocument = /*#__PURE__*/ new TypedDocumentString(`
    query PodcastEpisodes($podcastId: String!) {
  podcastEpisodes(podcastId: $podcastId) {
    ...PodcastEpisodeFields
  }
}
    fragment PodcastEpisodeFields on PodcastEpisode {
  id
  title
  audioUrl
  podcastId
  updatedAt
  createdAt
  publishedAt
  description
  episodeNumber
  durationMinutes
}`) as unknown as TypedDocumentString<PodcastEpisodesQuery, PodcastEpisodesQueryVariables>;
export const MyProviderPodcastsDocument = /*#__PURE__*/ new TypedDocumentString(`
    query MyProviderPodcasts($filter: PodcastFilterInput, $pagination: PodcastPaginationInput, $sort: PodcastSortInput) {
  myProviderPodcasts(filter: $filter, pagination: $pagination, sort: $sort) {
    items {
      ...PodcastFields
    }
    totalCount
    pageInfo {
      ...PodcastPageInfoFields
    }
  }
}
    fragment PodcastFields on Podcast {
  id
  host
  slug
  title
  status
  rating
  category
  imageUrl
  listeners
  createdAt
  updatedAt
  deletedAt
  isFeatured
  providerId
  description
  ratingCount
  episodeCount
  durationMinutes
}
fragment PodcastPageInfoFields on PodcastPageInfo {
  nextCursor
  hasNextPage
}`) as unknown as TypedDocumentString<MyProviderPodcastsQuery, MyProviderPodcastsQueryVariables>;
export const CreatePodcastDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation CreatePodcast($input: CreatePodcastInput!) {
  createPodcast(input: $input) {
    ...PodcastFields
  }
}
    fragment PodcastFields on Podcast {
  id
  host
  slug
  title
  status
  rating
  category
  imageUrl
  listeners
  createdAt
  updatedAt
  deletedAt
  isFeatured
  providerId
  description
  ratingCount
  episodeCount
  durationMinutes
}`) as unknown as TypedDocumentString<CreatePodcastMutation, CreatePodcastMutationVariables>;
export const UpdatePodcastDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation UpdatePodcast($input: UpdatePodcastInput!) {
  updatePodcast(input: $input) {
    ...PodcastFields
  }
}
    fragment PodcastFields on Podcast {
  id
  host
  slug
  title
  status
  rating
  category
  imageUrl
  listeners
  createdAt
  updatedAt
  deletedAt
  isFeatured
  providerId
  description
  ratingCount
  episodeCount
  durationMinutes
}`) as unknown as TypedDocumentString<UpdatePodcastMutation, UpdatePodcastMutationVariables>;
export const PublishPodcastDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation PublishPodcast($podcastId: String!) {
  publishPodcast(podcastId: $podcastId) {
    ...PodcastFields
  }
}
    fragment PodcastFields on Podcast {
  id
  host
  slug
  title
  status
  rating
  category
  imageUrl
  listeners
  createdAt
  updatedAt
  deletedAt
  isFeatured
  providerId
  description
  ratingCount
  episodeCount
  durationMinutes
}`) as unknown as TypedDocumentString<PublishPodcastMutation, PublishPodcastMutationVariables>;
export const ArchivePodcastDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation ArchivePodcast($podcastId: String!) {
  archivePodcast(podcastId: $podcastId) {
    ...PodcastFields
  }
}
    fragment PodcastFields on Podcast {
  id
  host
  slug
  title
  status
  rating
  category
  imageUrl
  listeners
  createdAt
  updatedAt
  deletedAt
  isFeatured
  providerId
  description
  ratingCount
  episodeCount
  durationMinutes
}`) as unknown as TypedDocumentString<ArchivePodcastMutation, ArchivePodcastMutationVariables>;
export const DeletePodcastDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation DeletePodcast($podcastId: String!) {
  deletePodcast(podcastId: $podcastId) {
    ...PodcastFields
  }
}
    fragment PodcastFields on Podcast {
  id
  host
  slug
  title
  status
  rating
  category
  imageUrl
  listeners
  createdAt
  updatedAt
  deletedAt
  isFeatured
  providerId
  description
  ratingCount
  episodeCount
  durationMinutes
}`) as unknown as TypedDocumentString<DeletePodcastMutation, DeletePodcastMutationVariables>;
export const RestorePodcastDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation RestorePodcast($podcastId: String!) {
  restorePodcast(podcastId: $podcastId) {
    ...PodcastFields
  }
}
    fragment PodcastFields on Podcast {
  id
  host
  slug
  title
  status
  rating
  category
  imageUrl
  listeners
  createdAt
  updatedAt
  deletedAt
  isFeatured
  providerId
  description
  ratingCount
  episodeCount
  durationMinutes
}`) as unknown as TypedDocumentString<RestorePodcastMutation, RestorePodcastMutationVariables>;
export const CreatePodcastEpisodeDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation CreatePodcastEpisode($input: CreatePodcastEpisodeInput!) {
  createPodcastEpisode(input: $input) {
    ...PodcastEpisodeFields
  }
}
    fragment PodcastEpisodeFields on PodcastEpisode {
  id
  title
  audioUrl
  podcastId
  updatedAt
  createdAt
  publishedAt
  description
  episodeNumber
  durationMinutes
}`) as unknown as TypedDocumentString<CreatePodcastEpisodeMutation, CreatePodcastEpisodeMutationVariables>;
export const UpdatePodcastEpisodeDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation UpdatePodcastEpisode($input: UpdatePodcastEpisodeInput!) {
  updatePodcastEpisode(input: $input) {
    ...PodcastEpisodeFields
  }
}
    fragment PodcastEpisodeFields on PodcastEpisode {
  id
  title
  audioUrl
  podcastId
  updatedAt
  createdAt
  publishedAt
  description
  episodeNumber
  durationMinutes
}`) as unknown as TypedDocumentString<UpdatePodcastEpisodeMutation, UpdatePodcastEpisodeMutationVariables>;
export const DeletePodcastEpisodeDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation DeletePodcastEpisode($episodeId: String!) {
  deletePodcastEpisode(episodeId: $episodeId) {
    ...PodcastEpisodeFields
  }
}
    fragment PodcastEpisodeFields on PodcastEpisode {
  id
  title
  audioUrl
  podcastId
  updatedAt
  createdAt
  publishedAt
  description
  episodeNumber
  durationMinutes
}`) as unknown as TypedDocumentString<DeletePodcastEpisodeMutation, DeletePodcastEpisodeMutationVariables>;