import * as Types from "@/lib/graphql/base";
import { TypedDocumentString } from "@/lib/graphql/base";
export type PublicUrlShardsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type PublicUrlShardsQuery = { __typename?: 'Query', publicUrlShards: Array<{ __typename?: 'PublicUrlShardSet', kind: Types.ContentType, shardSize: number, isComplete: boolean, shards: Array<{ __typename?: 'PublicUrlShard', index: number, urlCount: number, lastPublicChangeAt: string, startCursor: string, endCursor?: string | null }> }> };

export type PublicUrlPageQueryVariables = Types.Exact<{
  input: Types.PublicUrlPageInput;
}>;


export type PublicUrlPageQuery = { __typename?: 'Query', publicUrlPage: { __typename?: 'PublicUrlPage', hasNextPage: boolean, nextCursor?: string | null, items: Array<{ __typename?: 'PublicUrl', slug: string, publicChangeAt: string, availableLocales: Array<Types.AppLanguage> }> } };


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