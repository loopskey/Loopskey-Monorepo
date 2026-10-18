import * as Types from "@/lib/graphql/base";
import { TypedDocumentString } from "@/lib/graphql/document";
export type PublicUrlShardsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type PublicUrlShardsQuery = { __typename?: 'Query', publicUrlShards: Array<{ __typename?: 'PublicUrlShardSet', kind: Types.ContentType, shardSize: number, isComplete: boolean, shards: Array<{ __typename?: 'PublicUrlShard', index: number, urlCount: number, lastPublicChangeAt: string, startCursor: string, endCursor?: string | null }> }> };

export type PublicUrlPageQueryVariables = Types.Exact<{
  input: Types.PublicUrlPageInput;
}>;


export type PublicUrlPageQuery = { __typename?: 'Query', publicUrlPage: { __typename?: 'PublicUrlPage', hasNextPage: boolean, nextCursor?: string | null, items: Array<{ __typename?: 'PublicUrl', slug: string, publicChangeAt: string, availableLocales: Array<Types.AppLanguage> }> } };

export type TopicHubUrlShardsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type TopicHubUrlShardsQuery = { __typename?: 'Query', topicHubUrlShards: { __typename?: 'EditorialUrlShardSet', isComplete: boolean, shardSize: number, shards: Array<{ __typename?: 'EditorialUrlShard', index: number, urlCount: number, lastPublicChangeAt: string, startCursor: string, endCursor?: string | null }> } };

export type TopicHubUrlPageQueryVariables = Types.Exact<{
  input: Types.EditorialUrlPageInput;
}>;


export type TopicHubUrlPageQuery = { __typename?: 'Query', topicHubUrlPage: { __typename?: 'EditorialUrlPage', hasNextPage: boolean, nextCursor?: string | null, items: Array<{ __typename?: 'EditorialUrl', slug: string, publicChangeAt: string, availableLocales: Array<Types.AppLanguage> }> } };

export type ProviderProfileUrlShardsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type ProviderProfileUrlShardsQuery = { __typename?: 'Query', providerProfileUrlShards: { __typename?: 'EditorialUrlShardSet', isComplete: boolean, shardSize: number, shards: Array<{ __typename?: 'EditorialUrlShard', index: number, urlCount: number, lastPublicChangeAt: string, startCursor: string, endCursor?: string | null }> } };

export type ProviderProfileUrlPageQueryVariables = Types.Exact<{
  input: Types.EditorialUrlPageInput;
}>;


export type ProviderProfileUrlPageQuery = { __typename?: 'Query', providerProfileUrlPage: { __typename?: 'EditorialUrlPage', hasNextPage: boolean, nextCursor?: string | null, items: Array<{ __typename?: 'EditorialUrl', slug: string, publicChangeAt: string, availableLocales: Array<Types.AppLanguage> }> } };


export const PublicUrlShardsDocument = /*#__PURE__*/ new TypedDocumentString(`
    query PublicUrlShards {
  publicUrlShards {
    kind
    shardSize
    isComplete
    shards {
      index
      urlCount
      lastPublicChangeAt
      startCursor
      endCursor
    }
  }
}
    `) as unknown as TypedDocumentString<PublicUrlShardsQuery, PublicUrlShardsQueryVariables>;
export const PublicUrlPageDocument = /*#__PURE__*/ new TypedDocumentString(`
    query PublicUrlPage($input: PublicUrlPageInput!) {
  publicUrlPage(input: $input) {
    hasNextPage
    nextCursor
    items {
      slug
      publicChangeAt
      availableLocales
    }
  }
}
    `) as unknown as TypedDocumentString<PublicUrlPageQuery, PublicUrlPageQueryVariables>;
export const TopicHubUrlShardsDocument = /*#__PURE__*/ new TypedDocumentString(`
    query TopicHubUrlShards {
  topicHubUrlShards {
    isComplete
    shardSize
    shards {
      index
      urlCount
      lastPublicChangeAt
      startCursor
      endCursor
    }
  }
}
    `) as unknown as TypedDocumentString<TopicHubUrlShardsQuery, TopicHubUrlShardsQueryVariables>;
export const TopicHubUrlPageDocument = /*#__PURE__*/ new TypedDocumentString(`
    query TopicHubUrlPage($input: EditorialUrlPageInput!) {
  topicHubUrlPage(input: $input) {
    hasNextPage
    nextCursor
    items {
      slug
      publicChangeAt
      availableLocales
    }
  }
}
    `) as unknown as TypedDocumentString<TopicHubUrlPageQuery, TopicHubUrlPageQueryVariables>;
export const ProviderProfileUrlShardsDocument = /*#__PURE__*/ new TypedDocumentString(`
    query ProviderProfileUrlShards {
  providerProfileUrlShards {
    isComplete
    shardSize
    shards {
      index
      urlCount
      lastPublicChangeAt
      startCursor
      endCursor
    }
  }
}
    `) as unknown as TypedDocumentString<ProviderProfileUrlShardsQuery, ProviderProfileUrlShardsQueryVariables>;
export const ProviderProfileUrlPageDocument = /*#__PURE__*/ new TypedDocumentString(`
    query ProviderProfileUrlPage($input: EditorialUrlPageInput!) {
  providerProfileUrlPage(input: $input) {
    hasNextPage
    nextCursor
    items {
      slug
      publicChangeAt
      availableLocales
    }
  }
}
    `) as unknown as TypedDocumentString<ProviderProfileUrlPageQuery, ProviderProfileUrlPageQueryVariables>;