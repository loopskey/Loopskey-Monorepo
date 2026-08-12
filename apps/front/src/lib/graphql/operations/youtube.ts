import * as Types from "@/lib/graphql/base";
import { TypedDocumentString } from "@/lib/graphql/base";
export type YouTubeChannelFieldsFragment = { __typename?: 'YouTubeChannel', id: string, slug: string, views: number, title: string, status: Types.YouTubeChannelStatus, rating: number, provider?: string | null, category: Types.YouTubeCategory, imageUrl?: string | null, updatedAt: string, createdAt: string, deletedAt?: string | null, channelUrl?: string | null, isFeatured: boolean, providerId?: string | null, videoCount: number, ratingCount: number, subscribers: number, description?: string | null };

export type YouTubeVideoFieldsFragment = { __typename?: 'YouTubeVideo', id: string, title: string, views: number, likes: number, status: Types.YouTubeVideoStatus, videoUrl?: string | null, channelId: string, createdAt: string, updatedAt: string, description?: string | null, publishedAt?: string | null, thumbnailUrl?: string | null, durationMinutes?: number | null };

export type YouTubeChannelPageInfoFieldsFragment = { __typename?: 'YouTubeChannelPageInfo', nextCursor?: string | null, hasNextPage: boolean };

export type YouTubeChannelsQueryVariables = Types.Exact<{
  filter?: Types.InputMaybe<Types.YouTubeChannelFilterInput>;
  pagination?: Types.InputMaybe<Types.YouTubeChannelPaginationInput>;
  sort?: Types.InputMaybe<Types.YouTubeChannelSortInput>;
}>;


export type YouTubeChannelsQuery = { __typename?: 'Query', youtubeChannels: { __typename?: 'PaginatedYouTubeChannels', totalCount: number, items: Array<{ __typename?: 'YouTubeChannel', id: string, slug: string, views: number, title: string, status: Types.YouTubeChannelStatus, rating: number, provider?: string | null, category: Types.YouTubeCategory, imageUrl?: string | null, updatedAt: string, createdAt: string, deletedAt?: string | null, channelUrl?: string | null, isFeatured: boolean, providerId?: string | null, videoCount: number, ratingCount: number, subscribers: number, description?: string | null }>, pageInfo: { __typename?: 'YouTubeChannelPageInfo', nextCursor?: string | null, hasNextPage: boolean } } };

export type YouTubeChannelByIdQueryVariables = Types.Exact<{
  channelId: Types.Scalars['String']['input'];
}>;


export type YouTubeChannelByIdQuery = { __typename?: 'Query', youtubeChannelById: { __typename?: 'YouTubeChannel', id: string, slug: string, views: number, title: string, status: Types.YouTubeChannelStatus, rating: number, provider?: string | null, category: Types.YouTubeCategory, imageUrl?: string | null, updatedAt: string, createdAt: string, deletedAt?: string | null, channelUrl?: string | null, isFeatured: boolean, providerId?: string | null, videoCount: number, ratingCount: number, subscribers: number, description?: string | null } };

export type YouTubeChannelBySlugQueryVariables = Types.Exact<{
  slug: Types.Scalars['String']['input'];
}>;


export type YouTubeChannelBySlugQuery = { __typename?: 'Query', youtubeChannelBySlug: { __typename?: 'YouTubeChannel', id: string, slug: string, views: number, title: string, status: Types.YouTubeChannelStatus, rating: number, provider?: string | null, category: Types.YouTubeCategory, imageUrl?: string | null, updatedAt: string, createdAt: string, deletedAt?: string | null, channelUrl?: string | null, isFeatured: boolean, providerId?: string | null, videoCount: number, ratingCount: number, subscribers: number, description?: string | null } };

export type FeaturedYouTubeChannelsQueryVariables = Types.Exact<{
  take?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type FeaturedYouTubeChannelsQuery = { __typename?: 'Query', featuredYouTubeChannels: Array<{ __typename?: 'YouTubeChannel', id: string, slug: string, views: number, title: string, status: Types.YouTubeChannelStatus, rating: number, provider?: string | null, category: Types.YouTubeCategory, imageUrl?: string | null, updatedAt: string, createdAt: string, deletedAt?: string | null, channelUrl?: string | null, isFeatured: boolean, providerId?: string | null, videoCount: number, ratingCount: number, subscribers: number, description?: string | null }> };

export type YouTubeVideosQueryVariables = Types.Exact<{
  channelId: Types.Scalars['String']['input'];
}>;


export type YouTubeVideosQuery = { __typename?: 'Query', youtubeVideos: Array<{ __typename?: 'YouTubeVideo', id: string, title: string, views: number, likes: number, status: Types.YouTubeVideoStatus, videoUrl?: string | null, channelId: string, createdAt: string, updatedAt: string, description?: string | null, publishedAt?: string | null, thumbnailUrl?: string | null, durationMinutes?: number | null }> };

export type MyProviderYouTubeChannelsQueryVariables = Types.Exact<{
  filter?: Types.InputMaybe<Types.YouTubeChannelFilterInput>;
  pagination?: Types.InputMaybe<Types.YouTubeChannelPaginationInput>;
  sort?: Types.InputMaybe<Types.YouTubeChannelSortInput>;
}>;


export type MyProviderYouTubeChannelsQuery = { __typename?: 'Query', myProviderYouTubeChannels: { __typename?: 'PaginatedYouTubeChannels', totalCount: number, items: Array<{ __typename?: 'YouTubeChannel', id: string, slug: string, views: number, title: string, status: Types.YouTubeChannelStatus, rating: number, provider?: string | null, category: Types.YouTubeCategory, imageUrl?: string | null, updatedAt: string, createdAt: string, deletedAt?: string | null, channelUrl?: string | null, isFeatured: boolean, providerId?: string | null, videoCount: number, ratingCount: number, subscribers: number, description?: string | null }>, pageInfo: { __typename?: 'YouTubeChannelPageInfo', nextCursor?: string | null, hasNextPage: boolean } } };

export type CreateYouTubeChannelMutationVariables = Types.Exact<{
  input: Types.CreateYouTubeChannelInput;
}>;


export type CreateYouTubeChannelMutation = { __typename?: 'Mutation', createYouTubeChannel: { __typename?: 'YouTubeChannel', id: string, slug: string, views: number, title: string, status: Types.YouTubeChannelStatus, rating: number, provider?: string | null, category: Types.YouTubeCategory, imageUrl?: string | null, updatedAt: string, createdAt: string, deletedAt?: string | null, channelUrl?: string | null, isFeatured: boolean, providerId?: string | null, videoCount: number, ratingCount: number, subscribers: number, description?: string | null } };

export type UpdateYouTubeChannelMutationVariables = Types.Exact<{
  input: Types.UpdateYouTubeChannelInput;
}>;


export type UpdateYouTubeChannelMutation = { __typename?: 'Mutation', updateYouTubeChannel: { __typename?: 'YouTubeChannel', id: string, slug: string, views: number, title: string, status: Types.YouTubeChannelStatus, rating: number, provider?: string | null, category: Types.YouTubeCategory, imageUrl?: string | null, updatedAt: string, createdAt: string, deletedAt?: string | null, channelUrl?: string | null, isFeatured: boolean, providerId?: string | null, videoCount: number, ratingCount: number, subscribers: number, description?: string | null } };

export type PublishYouTubeChannelMutationVariables = Types.Exact<{
  channelId: Types.Scalars['String']['input'];
}>;


export type PublishYouTubeChannelMutation = { __typename?: 'Mutation', publishYouTubeChannel: { __typename?: 'YouTubeChannel', id: string, slug: string, views: number, title: string, status: Types.YouTubeChannelStatus, rating: number, provider?: string | null, category: Types.YouTubeCategory, imageUrl?: string | null, updatedAt: string, createdAt: string, deletedAt?: string | null, channelUrl?: string | null, isFeatured: boolean, providerId?: string | null, videoCount: number, ratingCount: number, subscribers: number, description?: string | null } };

export type ArchiveYouTubeChannelMutationVariables = Types.Exact<{
  channelId: Types.Scalars['String']['input'];
}>;


export type ArchiveYouTubeChannelMutation = { __typename?: 'Mutation', archiveYouTubeChannel: { __typename?: 'YouTubeChannel', id: string, slug: string, views: number, title: string, status: Types.YouTubeChannelStatus, rating: number, provider?: string | null, category: Types.YouTubeCategory, imageUrl?: string | null, updatedAt: string, createdAt: string, deletedAt?: string | null, channelUrl?: string | null, isFeatured: boolean, providerId?: string | null, videoCount: number, ratingCount: number, subscribers: number, description?: string | null } };

export type DeleteYouTubeChannelMutationVariables = Types.Exact<{
  channelId: Types.Scalars['String']['input'];
}>;


export type DeleteYouTubeChannelMutation = { __typename?: 'Mutation', deleteYouTubeChannel: { __typename?: 'YouTubeChannel', id: string, slug: string, views: number, title: string, status: Types.YouTubeChannelStatus, rating: number, provider?: string | null, category: Types.YouTubeCategory, imageUrl?: string | null, updatedAt: string, createdAt: string, deletedAt?: string | null, channelUrl?: string | null, isFeatured: boolean, providerId?: string | null, videoCount: number, ratingCount: number, subscribers: number, description?: string | null } };

export type RestoreYouTubeChannelMutationVariables = Types.Exact<{
  channelId: Types.Scalars['String']['input'];
}>;


export type RestoreYouTubeChannelMutation = { __typename?: 'Mutation', restoreYouTubeChannel: { __typename?: 'YouTubeChannel', id: string, slug: string, views: number, title: string, status: Types.YouTubeChannelStatus, rating: number, provider?: string | null, category: Types.YouTubeCategory, imageUrl?: string | null, updatedAt: string, createdAt: string, deletedAt?: string | null, channelUrl?: string | null, isFeatured: boolean, providerId?: string | null, videoCount: number, ratingCount: number, subscribers: number, description?: string | null } };

export type CreateYouTubeVideoMutationVariables = Types.Exact<{
  input: Types.CreateYouTubeVideoInput;
}>;


export type CreateYouTubeVideoMutation = { __typename?: 'Mutation', createYouTubeVideo: { __typename?: 'YouTubeVideo', id: string, title: string, views: number, likes: number, status: Types.YouTubeVideoStatus, videoUrl?: string | null, channelId: string, createdAt: string, updatedAt: string, description?: string | null, publishedAt?: string | null, thumbnailUrl?: string | null, durationMinutes?: number | null } };

export type UpdateYouTubeVideoMutationVariables = Types.Exact<{
  input: Types.UpdateYouTubeVideoInput;
}>;


export type UpdateYouTubeVideoMutation = { __typename?: 'Mutation', updateYouTubeVideo: { __typename?: 'YouTubeVideo', id: string, title: string, views: number, likes: number, status: Types.YouTubeVideoStatus, videoUrl?: string | null, channelId: string, createdAt: string, updatedAt: string, description?: string | null, publishedAt?: string | null, thumbnailUrl?: string | null, durationMinutes?: number | null } };

export type DeleteYouTubeVideoMutationVariables = Types.Exact<{
  videoId: Types.Scalars['String']['input'];
}>;


export type DeleteYouTubeVideoMutation = { __typename?: 'Mutation', deleteYouTubeVideo: { __typename?: 'YouTubeVideo', id: string, title: string, views: number, likes: number, status: Types.YouTubeVideoStatus, videoUrl?: string | null, channelId: string, createdAt: string, updatedAt: string, description?: string | null, publishedAt?: string | null, thumbnailUrl?: string | null, durationMinutes?: number | null } };

export const YouTubeChannelFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment YouTubeChannelFields on YouTubeChannel {
  id
  slug
  views
  title
  status
  rating
  provider
  category
  imageUrl
  updatedAt
  createdAt
  deletedAt
  channelUrl
  isFeatured
  providerId
  videoCount
  ratingCount
  subscribers
  description
}
    `, {"fragmentName":"YouTubeChannelFields"}) as unknown as TypedDocumentString<YouTubeChannelFieldsFragment, unknown>;
export const YouTubeVideoFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment YouTubeVideoFields on YouTubeVideo {
  id
  title
  views
  likes
  status
  videoUrl
  channelId
  createdAt
  updatedAt
  description
  publishedAt
  thumbnailUrl
  durationMinutes
}
    `, {"fragmentName":"YouTubeVideoFields"}) as unknown as TypedDocumentString<YouTubeVideoFieldsFragment, unknown>;
export const YouTubeChannelPageInfoFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment YouTubeChannelPageInfoFields on YouTubeChannelPageInfo {
  nextCursor
  hasNextPage
}
    `, {"fragmentName":"YouTubeChannelPageInfoFields"}) as unknown as TypedDocumentString<YouTubeChannelPageInfoFieldsFragment, unknown>;
export const YouTubeChannelsDocument = /*#__PURE__*/ new TypedDocumentString(`
    query YouTubeChannels($filter: YouTubeChannelFilterInput, $pagination: YouTubeChannelPaginationInput, $sort: YouTubeChannelSortInput) {
  youtubeChannels(filter: $filter, pagination: $pagination, sort: $sort) {
    items {
      ...YouTubeChannelFields
    }
    totalCount
    pageInfo {
      ...YouTubeChannelPageInfoFields
    }
  }
}
    fragment YouTubeChannelFields on YouTubeChannel {
  id
  slug
  views
  title
  status
  rating
  provider
  category
  imageUrl
  updatedAt
  createdAt
  deletedAt
  channelUrl
  isFeatured
  providerId
  videoCount
  ratingCount
  subscribers
  description
}
fragment YouTubeChannelPageInfoFields on YouTubeChannelPageInfo {
  nextCursor
  hasNextPage
}`) as unknown as TypedDocumentString<YouTubeChannelsQuery, YouTubeChannelsQueryVariables>;
export const YouTubeChannelByIdDocument = /*#__PURE__*/ new TypedDocumentString(`
    query YouTubeChannelById($channelId: String!) {
  youtubeChannelById(channelId: $channelId) {
    ...YouTubeChannelFields
  }
}
    fragment YouTubeChannelFields on YouTubeChannel {
  id
  slug
  views
  title
  status
  rating
  provider
  category
  imageUrl
  updatedAt
  createdAt
  deletedAt
  channelUrl
  isFeatured
  providerId
  videoCount
  ratingCount
  subscribers
  description
}`) as unknown as TypedDocumentString<YouTubeChannelByIdQuery, YouTubeChannelByIdQueryVariables>;
export const YouTubeChannelBySlugDocument = /*#__PURE__*/ new TypedDocumentString(`
    query YouTubeChannelBySlug($slug: String!) {
  youtubeChannelBySlug(slug: $slug) {
    ...YouTubeChannelFields
  }
}
    fragment YouTubeChannelFields on YouTubeChannel {
  id
  slug
  views
  title
  status
  rating
  provider
  category
  imageUrl
  updatedAt
  createdAt
  deletedAt
  channelUrl
  isFeatured
  providerId
  videoCount
  ratingCount
  subscribers
  description
}`) as unknown as TypedDocumentString<YouTubeChannelBySlugQuery, YouTubeChannelBySlugQueryVariables>;
export const FeaturedYouTubeChannelsDocument = /*#__PURE__*/ new TypedDocumentString(`
    query FeaturedYouTubeChannels($take: Int) {
  featuredYouTubeChannels(take: $take) {
    ...YouTubeChannelFields
  }
}
    fragment YouTubeChannelFields on YouTubeChannel {
  id
  slug
  views
  title
  status
  rating
  provider
  category
  imageUrl
  updatedAt
  createdAt
  deletedAt
  channelUrl
  isFeatured
  providerId
  videoCount
  ratingCount
  subscribers
  description
}`) as unknown as TypedDocumentString<FeaturedYouTubeChannelsQuery, FeaturedYouTubeChannelsQueryVariables>;
export const YouTubeVideosDocument = /*#__PURE__*/ new TypedDocumentString(`
    query YouTubeVideos($channelId: String!) {
  youtubeVideos(channelId: $channelId) {
    ...YouTubeVideoFields
  }
}
    fragment YouTubeVideoFields on YouTubeVideo {
  id
  title
  views
  likes
  status
  videoUrl
  channelId
  createdAt
  updatedAt
  description
  publishedAt
  thumbnailUrl
  durationMinutes
}`) as unknown as TypedDocumentString<YouTubeVideosQuery, YouTubeVideosQueryVariables>;
export const MyProviderYouTubeChannelsDocument = /*#__PURE__*/ new TypedDocumentString(`
    query MyProviderYouTubeChannels($filter: YouTubeChannelFilterInput, $pagination: YouTubeChannelPaginationInput, $sort: YouTubeChannelSortInput) {
  myProviderYouTubeChannels(filter: $filter, pagination: $pagination, sort: $sort) {
    items {
      ...YouTubeChannelFields
    }
    totalCount
    pageInfo {
      ...YouTubeChannelPageInfoFields
    }
  }
}
    fragment YouTubeChannelFields on YouTubeChannel {
  id
  slug
  views
  title
  status
  rating
  provider
  category
  imageUrl
  updatedAt
  createdAt
  deletedAt
  channelUrl
  isFeatured
  providerId
  videoCount
  ratingCount
  subscribers
  description
}
fragment YouTubeChannelPageInfoFields on YouTubeChannelPageInfo {
  nextCursor
  hasNextPage
}`) as unknown as TypedDocumentString<MyProviderYouTubeChannelsQuery, MyProviderYouTubeChannelsQueryVariables>;
export const CreateYouTubeChannelDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation CreateYouTubeChannel($input: CreateYouTubeChannelInput!) {
  createYouTubeChannel(input: $input) {
    ...YouTubeChannelFields
  }
}
    fragment YouTubeChannelFields on YouTubeChannel {
  id
  slug
  views
  title
  status
  rating
  provider
  category
  imageUrl
  updatedAt
  createdAt
  deletedAt
  channelUrl
  isFeatured
  providerId
  videoCount
  ratingCount
  subscribers
  description
}`) as unknown as TypedDocumentString<CreateYouTubeChannelMutation, CreateYouTubeChannelMutationVariables>;
export const UpdateYouTubeChannelDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation UpdateYouTubeChannel($input: UpdateYouTubeChannelInput!) {
  updateYouTubeChannel(input: $input) {
    ...YouTubeChannelFields
  }
}
    fragment YouTubeChannelFields on YouTubeChannel {
  id
  slug
  views
  title
  status
  rating
  provider
  category
  imageUrl
  updatedAt
  createdAt
  deletedAt
  channelUrl
  isFeatured
  providerId
  videoCount
  ratingCount
  subscribers
  description
}`) as unknown as TypedDocumentString<UpdateYouTubeChannelMutation, UpdateYouTubeChannelMutationVariables>;
export const PublishYouTubeChannelDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation PublishYouTubeChannel($channelId: String!) {
  publishYouTubeChannel(channelId: $channelId) {
    ...YouTubeChannelFields
  }
}
    fragment YouTubeChannelFields on YouTubeChannel {
  id
  slug
  views
  title
  status
  rating
  provider
  category
  imageUrl
  updatedAt
  createdAt
  deletedAt
  channelUrl
  isFeatured
  providerId
  videoCount
  ratingCount
  subscribers
  description
}`) as unknown as TypedDocumentString<PublishYouTubeChannelMutation, PublishYouTubeChannelMutationVariables>;
export const ArchiveYouTubeChannelDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation ArchiveYouTubeChannel($channelId: String!) {
  archiveYouTubeChannel(channelId: $channelId) {
    ...YouTubeChannelFields
  }
}
    fragment YouTubeChannelFields on YouTubeChannel {
  id
  slug
  views
  title
  status
  rating
  provider
  category
  imageUrl
  updatedAt
  createdAt
  deletedAt
  channelUrl
  isFeatured
  providerId
  videoCount
  ratingCount
  subscribers
  description
}`) as unknown as TypedDocumentString<ArchiveYouTubeChannelMutation, ArchiveYouTubeChannelMutationVariables>;
export const DeleteYouTubeChannelDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation DeleteYouTubeChannel($channelId: String!) {
  deleteYouTubeChannel(channelId: $channelId) {
    ...YouTubeChannelFields
  }
}
    fragment YouTubeChannelFields on YouTubeChannel {
  id
  slug
  views
  title
  status
  rating
  provider
  category
  imageUrl
  updatedAt
  createdAt
  deletedAt
  channelUrl
  isFeatured
  providerId
  videoCount
  ratingCount
  subscribers
  description
}`) as unknown as TypedDocumentString<DeleteYouTubeChannelMutation, DeleteYouTubeChannelMutationVariables>;
export const RestoreYouTubeChannelDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation RestoreYouTubeChannel($channelId: String!) {
  restoreYouTubeChannel(channelId: $channelId) {
    ...YouTubeChannelFields
  }
}
    fragment YouTubeChannelFields on YouTubeChannel {
  id
  slug
  views
  title
  status
  rating
  provider
  category
  imageUrl
  updatedAt
  createdAt
  deletedAt
  channelUrl
  isFeatured
  providerId
  videoCount
  ratingCount
  subscribers
  description
}`) as unknown as TypedDocumentString<RestoreYouTubeChannelMutation, RestoreYouTubeChannelMutationVariables>;
export const CreateYouTubeVideoDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation CreateYouTubeVideo($input: CreateYouTubeVideoInput!) {
  createYouTubeVideo(input: $input) {
    ...YouTubeVideoFields
  }
}
    fragment YouTubeVideoFields on YouTubeVideo {
  id
  title
  views
  likes
  status
  videoUrl
  channelId
  createdAt
  updatedAt
  description
  publishedAt
  thumbnailUrl
  durationMinutes
}`) as unknown as TypedDocumentString<CreateYouTubeVideoMutation, CreateYouTubeVideoMutationVariables>;
export const UpdateYouTubeVideoDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation UpdateYouTubeVideo($input: UpdateYouTubeVideoInput!) {
  updateYouTubeVideo(input: $input) {
    ...YouTubeVideoFields
  }
}
    fragment YouTubeVideoFields on YouTubeVideo {
  id
  title
  views
  likes
  status
  videoUrl
  channelId
  createdAt
  updatedAt
  description
  publishedAt
  thumbnailUrl
  durationMinutes
}`) as unknown as TypedDocumentString<UpdateYouTubeVideoMutation, UpdateYouTubeVideoMutationVariables>;
export const DeleteYouTubeVideoDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation DeleteYouTubeVideo($videoId: String!) {
  deleteYouTubeVideo(videoId: $videoId) {
    ...YouTubeVideoFields
  }
}
    fragment YouTubeVideoFields on YouTubeVideo {
  id
  title
  views
  likes
  status
  videoUrl
  channelId
  createdAt
  updatedAt
  description
  publishedAt
  thumbnailUrl
  durationMinutes
}`) as unknown as TypedDocumentString<DeleteYouTubeVideoMutation, DeleteYouTubeVideoMutationVariables>;