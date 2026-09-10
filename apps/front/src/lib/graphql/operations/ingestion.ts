import * as Types from "@/lib/graphql/base";
import { TypedDocumentString } from "@/lib/graphql/base";
export type IngestionSourceFieldsFragment = { __typename?: 'IngestionSource', id: string, slug: string, name: string, kind: Types.IngestionContentKind, isActive: boolean, autoPublish: boolean, stalenessWindowDays?: number | null, fieldMap: any, createdAt: string, updatedAt: string };

export type IngestionPageInfoFieldsFragment = { __typename?: 'IngestionPageInfo', hasNextPage: boolean, nextCursor?: string | null };

export type PaginatedIngestionSourcesFieldsFragment = { __typename?: 'PaginatedIngestionSources', totalCount: number, pageInfo: { __typename?: 'IngestionPageInfo', hasNextPage: boolean, nextCursor?: string | null }, items: Array<{ __typename?: 'IngestionSource', id: string, slug: string, name: string, kind: Types.IngestionContentKind, isActive: boolean, autoPublish: boolean, stalenessWindowDays?: number | null, fieldMap: any, createdAt: string, updatedAt: string }> };

export type IngestionSourcesQueryVariables = Types.Exact<{
  filter?: Types.InputMaybe<Types.IngestionSourceFilter>;
  pagination?: Types.InputMaybe<Types.IngestionPagination>;
}>;


export type IngestionSourcesQuery = { __typename?: 'Query', ingestionSources: { __typename?: 'PaginatedIngestionSources', totalCount: number, pageInfo: { __typename?: 'IngestionPageInfo', hasNextPage: boolean, nextCursor?: string | null }, items: Array<{ __typename?: 'IngestionSource', id: string, slug: string, name: string, kind: Types.IngestionContentKind, isActive: boolean, autoPublish: boolean, stalenessWindowDays?: number | null, fieldMap: any, createdAt: string, updatedAt: string }> } };

export type IngestionSourceQueryVariables = Types.Exact<{
  sourceId: Types.Scalars['String']['input'];
}>;


export type IngestionSourceQuery = { __typename?: 'Query', ingestionSource: { __typename?: 'IngestionSource', id: string, slug: string, name: string, kind: Types.IngestionContentKind, isActive: boolean, autoPublish: boolean, stalenessWindowDays?: number | null, fieldMap: any, createdAt: string, updatedAt: string } };

export type CreateIngestionSourceMutationVariables = Types.Exact<{
  input: Types.CreateIngestionSource;
}>;


export type CreateIngestionSourceMutation = { __typename?: 'Mutation', createIngestionSource: { __typename?: 'IngestionSource', id: string, slug: string, name: string, kind: Types.IngestionContentKind, isActive: boolean, autoPublish: boolean, stalenessWindowDays?: number | null, fieldMap: any, createdAt: string, updatedAt: string } };

export type UpdateIngestionSourceMutationVariables = Types.Exact<{
  input: Types.UpdateIngestionSource;
}>;


export type UpdateIngestionSourceMutation = { __typename?: 'Mutation', updateIngestionSource: { __typename?: 'IngestionSource', id: string, slug: string, name: string, kind: Types.IngestionContentKind, isActive: boolean, autoPublish: boolean, stalenessWindowDays?: number | null, fieldMap: any, createdAt: string, updatedAt: string } };

export type ActivateIngestionSourceMutationVariables = Types.Exact<{
  sourceId: Types.Scalars['String']['input'];
}>;


export type ActivateIngestionSourceMutation = { __typename?: 'Mutation', activateIngestionSource: { __typename?: 'IngestionSource', id: string, slug: string, name: string, kind: Types.IngestionContentKind, isActive: boolean, autoPublish: boolean, stalenessWindowDays?: number | null, fieldMap: any, createdAt: string, updatedAt: string } };

export type DeactivateIngestionSourceMutationVariables = Types.Exact<{
  sourceId: Types.Scalars['String']['input'];
}>;


export type DeactivateIngestionSourceMutation = { __typename?: 'Mutation', deactivateIngestionSource: { __typename?: 'IngestionSource', id: string, slug: string, name: string, kind: Types.IngestionContentKind, isActive: boolean, autoPublish: boolean, stalenessWindowDays?: number | null, fieldMap: any, createdAt: string, updatedAt: string } };

export type IngestionApiKeyFieldsFragment = { __typename?: 'IngestionApiKey', id: string, sourceId: string, name: string, prefix: string, createdAt: string, expiresAt?: string | null, revokedAt?: string | null, lastUsedAt?: string | null };

export type IngestionApiKeysQueryVariables = Types.Exact<{
  sourceId: Types.Scalars['String']['input'];
}>;


export type IngestionApiKeysQuery = { __typename?: 'Query', ingestionApiKeys: Array<{ __typename?: 'IngestionApiKey', id: string, sourceId: string, name: string, prefix: string, createdAt: string, expiresAt?: string | null, revokedAt?: string | null, lastUsedAt?: string | null }> };

export type IssueIngestionApiKeyMutationVariables = Types.Exact<{
  input: Types.IssueIngestionApiKey;
}>;


export type IssueIngestionApiKeyMutation = { __typename?: 'Mutation', issueIngestionApiKey: { __typename?: 'IssuedIngestionApiKey', id: string, sourceId: string, name: string, prefix: string, createdAt: string, expiresAt?: string | null, revokedAt?: string | null, lastUsedAt?: string | null, credential: string } };

export type RevokeIngestionApiKeyMutationVariables = Types.Exact<{
  keyId: Types.Scalars['String']['input'];
}>;


export type RevokeIngestionApiKeyMutation = { __typename?: 'Mutation', revokeIngestionApiKey: { __typename?: 'IngestionApiKey', id: string, sourceId: string, name: string, prefix: string, createdAt: string, expiresAt?: string | null, revokedAt?: string | null, lastUsedAt?: string | null } };

export type IngestionBatchFieldsFragment = { __typename?: 'IngestionBatch', id: string, sourceId: string, idempotencyKey: string, mode: Types.IngestionBatchMode, status: Types.IngestionBatchStatus, correlationId?: string | null, createdAt: string, receivedCount: number, acceptedCount: number, rejectedCount: number, createdCount: number, updatedCount: number, unchangedCount: number };

export type PaginatedIngestionBatchesFieldsFragment = { __typename?: 'PaginatedIngestionBatches', totalCount: number, pageInfo: { __typename?: 'IngestionPageInfo', hasNextPage: boolean, nextCursor?: string | null }, items: Array<{ __typename?: 'IngestionBatch', id: string, sourceId: string, idempotencyKey: string, mode: Types.IngestionBatchMode, status: Types.IngestionBatchStatus, correlationId?: string | null, createdAt: string, receivedCount: number, acceptedCount: number, rejectedCount: number, createdCount: number, updatedCount: number, unchangedCount: number }> };

export type IngestionBatchesQueryVariables = Types.Exact<{
  sourceId: Types.Scalars['String']['input'];
  pagination?: Types.InputMaybe<Types.IngestionPagination>;
}>;


export type IngestionBatchesQuery = { __typename?: 'Query', ingestionBatches: { __typename?: 'PaginatedIngestionBatches', totalCount: number, pageInfo: { __typename?: 'IngestionPageInfo', hasNextPage: boolean, nextCursor?: string | null }, items: Array<{ __typename?: 'IngestionBatch', id: string, sourceId: string, idempotencyKey: string, mode: Types.IngestionBatchMode, status: Types.IngestionBatchStatus, correlationId?: string | null, createdAt: string, receivedCount: number, acceptedCount: number, rejectedCount: number, createdCount: number, updatedCount: number, unchangedCount: number }> } };

export type IngestionBatchQueryVariables = Types.Exact<{
  batchId: Types.Scalars['String']['input'];
}>;


export type IngestionBatchQuery = { __typename?: 'Query', ingestionBatch: { __typename?: 'IngestionBatchDetail', id: string, sourceId: string, idempotencyKey: string, mode: Types.IngestionBatchMode, status: Types.IngestionBatchStatus, correlationId?: string | null, createdAt: string, receivedCount: number, acceptedCount: number, rejectedCount: number, createdCount: number, updatedCount: number, unchangedCount: number, items: Array<{ __typename?: 'IngestionItemReport', externalId?: string | null, state: string, catalogId?: string | null, reason?: string | null, unmappedFields: Array<string> }> } };

export type IngestionItemCatalogFieldsFragment = { __typename?: 'IngestionItemCatalog', id: string, title: string, slug?: string | null, status: Types.CourseStatus, imageUrl?: string | null };

export type IngestionItemFieldsFragment = { __typename?: 'IngestionItem', id: string, sourceId: string, sourceSlug?: string | null, batchId?: string | null, externalId: string, canonicalUrl?: string | null, imageCandidateUrl?: string | null, unmappedFields: Array<string>, state: Types.IngestionItemState, rejectionReason?: string | null, reviewedById?: string | null, reviewedByName?: string | null, reviewedAt?: string | null, catalogId?: string | null, firstSeenAt: string, lastSeenAt: string, catalog?: { __typename?: 'IngestionItemCatalog', id: string, title: string, slug?: string | null, status: Types.CourseStatus, imageUrl?: string | null } | null };

export type PaginatedIngestionItemsFieldsFragment = { __typename?: 'PaginatedIngestionItems', totalCount: number, pageInfo: { __typename?: 'IngestionPageInfo', hasNextPage: boolean, nextCursor?: string | null }, items: Array<{ __typename?: 'IngestionItem', id: string, sourceId: string, sourceSlug?: string | null, batchId?: string | null, externalId: string, canonicalUrl?: string | null, imageCandidateUrl?: string | null, unmappedFields: Array<string>, state: Types.IngestionItemState, rejectionReason?: string | null, reviewedById?: string | null, reviewedByName?: string | null, reviewedAt?: string | null, catalogId?: string | null, firstSeenAt: string, lastSeenAt: string, catalog?: { __typename?: 'IngestionItemCatalog', id: string, title: string, slug?: string | null, status: Types.CourseStatus, imageUrl?: string | null } | null }> };

export type IngestionItemsQueryVariables = Types.Exact<{
  filter?: Types.InputMaybe<Types.IngestionItemFilter>;
  pagination?: Types.InputMaybe<Types.IngestionPagination>;
}>;


export type IngestionItemsQuery = { __typename?: 'Query', ingestionItems: { __typename?: 'PaginatedIngestionItems', totalCount: number, pageInfo: { __typename?: 'IngestionPageInfo', hasNextPage: boolean, nextCursor?: string | null }, items: Array<{ __typename?: 'IngestionItem', id: string, sourceId: string, sourceSlug?: string | null, batchId?: string | null, externalId: string, canonicalUrl?: string | null, imageCandidateUrl?: string | null, unmappedFields: Array<string>, state: Types.IngestionItemState, rejectionReason?: string | null, reviewedById?: string | null, reviewedByName?: string | null, reviewedAt?: string | null, catalogId?: string | null, firstSeenAt: string, lastSeenAt: string, catalog?: { __typename?: 'IngestionItemCatalog', id: string, title: string, slug?: string | null, status: Types.CourseStatus, imageUrl?: string | null } | null }> } };

export type ApproveIngestionItemMutationVariables = Types.Exact<{
  itemId: Types.Scalars['String']['input'];
}>;


export type ApproveIngestionItemMutation = { __typename?: 'Mutation', approveIngestionItem: { __typename?: 'IngestionItem', id: string, sourceId: string, sourceSlug?: string | null, batchId?: string | null, externalId: string, canonicalUrl?: string | null, imageCandidateUrl?: string | null, unmappedFields: Array<string>, state: Types.IngestionItemState, rejectionReason?: string | null, reviewedById?: string | null, reviewedByName?: string | null, reviewedAt?: string | null, catalogId?: string | null, firstSeenAt: string, lastSeenAt: string, catalog?: { __typename?: 'IngestionItemCatalog', id: string, title: string, slug?: string | null, status: Types.CourseStatus, imageUrl?: string | null } | null } };

export type RejectIngestionItemMutationVariables = Types.Exact<{
  input: Types.RejectIngestionItem;
}>;


export type RejectIngestionItemMutation = { __typename?: 'Mutation', rejectIngestionItem: { __typename?: 'IngestionItem', id: string, sourceId: string, sourceSlug?: string | null, batchId?: string | null, externalId: string, canonicalUrl?: string | null, imageCandidateUrl?: string | null, unmappedFields: Array<string>, state: Types.IngestionItemState, rejectionReason?: string | null, reviewedById?: string | null, reviewedByName?: string | null, reviewedAt?: string | null, catalogId?: string | null, firstSeenAt: string, lastSeenAt: string, catalog?: { __typename?: 'IngestionItemCatalog', id: string, title: string, slug?: string | null, status: Types.CourseStatus, imageUrl?: string | null } | null } };

export const IngestionPageInfoFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment IngestionPageInfoFields on IngestionPageInfo {
  hasNextPage
  nextCursor
}
    `, {"fragmentName":"IngestionPageInfoFields"}) as unknown as TypedDocumentString<IngestionPageInfoFieldsFragment, unknown>;
export const IngestionSourceFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment IngestionSourceFields on IngestionSource {
  id
  slug
  name
  kind
  isActive
  autoPublish
  stalenessWindowDays
  fieldMap
  createdAt
  updatedAt
}
    `, {"fragmentName":"IngestionSourceFields"}) as unknown as TypedDocumentString<IngestionSourceFieldsFragment, unknown>;
export const PaginatedIngestionSourcesFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment PaginatedIngestionSourcesFields on PaginatedIngestionSources {
  totalCount
  pageInfo {
    ...IngestionPageInfoFields
  }
  items {
    ...IngestionSourceFields
  }
}
    fragment IngestionSourceFields on IngestionSource {
  id
  slug
  name
  kind
  isActive
  autoPublish
  stalenessWindowDays
  fieldMap
  createdAt
  updatedAt
}
fragment IngestionPageInfoFields on IngestionPageInfo {
  hasNextPage
  nextCursor
}`, {"fragmentName":"PaginatedIngestionSourcesFields"}) as unknown as TypedDocumentString<PaginatedIngestionSourcesFieldsFragment, unknown>;
export const IngestionApiKeyFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment IngestionApiKeyFields on IngestionApiKey {
  id
  sourceId
  name
  prefix
  createdAt
  expiresAt
  revokedAt
  lastUsedAt
}
    `, {"fragmentName":"IngestionApiKeyFields"}) as unknown as TypedDocumentString<IngestionApiKeyFieldsFragment, unknown>;
export const IngestionBatchFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment IngestionBatchFields on IngestionBatch {
  id
  sourceId
  idempotencyKey
  mode
  status
  correlationId
  createdAt
  receivedCount
  acceptedCount
  rejectedCount
  createdCount
  updatedCount
  unchangedCount
}
    `, {"fragmentName":"IngestionBatchFields"}) as unknown as TypedDocumentString<IngestionBatchFieldsFragment, unknown>;
export const PaginatedIngestionBatchesFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment PaginatedIngestionBatchesFields on PaginatedIngestionBatches {
  totalCount
  pageInfo {
    ...IngestionPageInfoFields
  }
  items {
    ...IngestionBatchFields
  }
}
    fragment IngestionPageInfoFields on IngestionPageInfo {
  hasNextPage
  nextCursor
}
fragment IngestionBatchFields on IngestionBatch {
  id
  sourceId
  idempotencyKey
  mode
  status
  correlationId
  createdAt
  receivedCount
  acceptedCount
  rejectedCount
  createdCount
  updatedCount
  unchangedCount
}`, {"fragmentName":"PaginatedIngestionBatchesFields"}) as unknown as TypedDocumentString<PaginatedIngestionBatchesFieldsFragment, unknown>;
export const IngestionItemCatalogFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment IngestionItemCatalogFields on IngestionItemCatalog {
  id
  title
  slug
  status
  imageUrl
}
    `, {"fragmentName":"IngestionItemCatalogFields"}) as unknown as TypedDocumentString<IngestionItemCatalogFieldsFragment, unknown>;
export const IngestionItemFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment IngestionItemFields on IngestionItem {
  id
  sourceId
  sourceSlug
  batchId
  externalId
  canonicalUrl
  imageCandidateUrl
  unmappedFields
  state
  rejectionReason
  reviewedById
  reviewedByName
  reviewedAt
  catalogId
  firstSeenAt
  lastSeenAt
  catalog {
    ...IngestionItemCatalogFields
  }
}
    fragment IngestionItemCatalogFields on IngestionItemCatalog {
  id
  title
  slug
  status
  imageUrl
}`, {"fragmentName":"IngestionItemFields"}) as unknown as TypedDocumentString<IngestionItemFieldsFragment, unknown>;
export const PaginatedIngestionItemsFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment PaginatedIngestionItemsFields on PaginatedIngestionItems {
  totalCount
  pageInfo {
    ...IngestionPageInfoFields
  }
  items {
    ...IngestionItemFields
  }
}
    fragment IngestionPageInfoFields on IngestionPageInfo {
  hasNextPage
  nextCursor
}
fragment IngestionItemCatalogFields on IngestionItemCatalog {
  id
  title
  slug
  status
  imageUrl
}
fragment IngestionItemFields on IngestionItem {
  id
  sourceId
  sourceSlug
  batchId
  externalId
  canonicalUrl
  imageCandidateUrl
  unmappedFields
  state
  rejectionReason
  reviewedById
  reviewedByName
  reviewedAt
  catalogId
  firstSeenAt
  lastSeenAt
  catalog {
    ...IngestionItemCatalogFields
  }
}`, {"fragmentName":"PaginatedIngestionItemsFields"}) as unknown as TypedDocumentString<PaginatedIngestionItemsFieldsFragment, unknown>;
export const IngestionSourcesDocument = /*#__PURE__*/ new TypedDocumentString(`
    query IngestionSources($filter: IngestionSourceFilter, $pagination: IngestionPagination) {
  ingestionSources(filter: $filter, pagination: $pagination) {
    ...PaginatedIngestionSourcesFields
  }
}
    fragment IngestionSourceFields on IngestionSource {
  id
  slug
  name
  kind
  isActive
  autoPublish
  stalenessWindowDays
  fieldMap
  createdAt
  updatedAt
}
fragment IngestionPageInfoFields on IngestionPageInfo {
  hasNextPage
  nextCursor
}
fragment PaginatedIngestionSourcesFields on PaginatedIngestionSources {
  totalCount
  pageInfo {
    ...IngestionPageInfoFields
  }
  items {
    ...IngestionSourceFields
  }
}`) as unknown as TypedDocumentString<IngestionSourcesQuery, IngestionSourcesQueryVariables>;
export const IngestionSourceDocument = /*#__PURE__*/ new TypedDocumentString(`
    query IngestionSource($sourceId: String!) {
  ingestionSource(sourceId: $sourceId) {
    ...IngestionSourceFields
  }
}
    fragment IngestionSourceFields on IngestionSource {
  id
  slug
  name
  kind
  isActive
  autoPublish
  stalenessWindowDays
  fieldMap
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<IngestionSourceQuery, IngestionSourceQueryVariables>;
export const CreateIngestionSourceDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation CreateIngestionSource($input: CreateIngestionSource!) {
  createIngestionSource(input: $input) {
    ...IngestionSourceFields
  }
}
    fragment IngestionSourceFields on IngestionSource {
  id
  slug
  name
  kind
  isActive
  autoPublish
  stalenessWindowDays
  fieldMap
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<CreateIngestionSourceMutation, CreateIngestionSourceMutationVariables>;
export const UpdateIngestionSourceDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation UpdateIngestionSource($input: UpdateIngestionSource!) {
  updateIngestionSource(input: $input) {
    ...IngestionSourceFields
  }
}
    fragment IngestionSourceFields on IngestionSource {
  id
  slug
  name
  kind
  isActive
  autoPublish
  stalenessWindowDays
  fieldMap
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<UpdateIngestionSourceMutation, UpdateIngestionSourceMutationVariables>;
export const ActivateIngestionSourceDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation ActivateIngestionSource($sourceId: String!) {
  activateIngestionSource(sourceId: $sourceId) {
    ...IngestionSourceFields
  }
}
    fragment IngestionSourceFields on IngestionSource {
  id
  slug
  name
  kind
  isActive
  autoPublish
  stalenessWindowDays
  fieldMap
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<ActivateIngestionSourceMutation, ActivateIngestionSourceMutationVariables>;
export const DeactivateIngestionSourceDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation DeactivateIngestionSource($sourceId: String!) {
  deactivateIngestionSource(sourceId: $sourceId) {
    ...IngestionSourceFields
  }
}
    fragment IngestionSourceFields on IngestionSource {
  id
  slug
  name
  kind
  isActive
  autoPublish
  stalenessWindowDays
  fieldMap
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<DeactivateIngestionSourceMutation, DeactivateIngestionSourceMutationVariables>;
export const IngestionApiKeysDocument = /*#__PURE__*/ new TypedDocumentString(`
    query IngestionApiKeys($sourceId: String!) {
  ingestionApiKeys(sourceId: $sourceId) {
    ...IngestionApiKeyFields
  }
}
    fragment IngestionApiKeyFields on IngestionApiKey {
  id
  sourceId
  name
  prefix
  createdAt
  expiresAt
  revokedAt
  lastUsedAt
}`) as unknown as TypedDocumentString<IngestionApiKeysQuery, IngestionApiKeysQueryVariables>;
export const IssueIngestionApiKeyDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation IssueIngestionApiKey($input: IssueIngestionApiKey!) {
  issueIngestionApiKey(input: $input) {
    id
    sourceId
    name
    prefix
    createdAt
    expiresAt
    revokedAt
    lastUsedAt
    credential
  }
}
    `) as unknown as TypedDocumentString<IssueIngestionApiKeyMutation, IssueIngestionApiKeyMutationVariables>;
export const RevokeIngestionApiKeyDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation RevokeIngestionApiKey($keyId: String!) {
  revokeIngestionApiKey(keyId: $keyId) {
    ...IngestionApiKeyFields
  }
}
    fragment IngestionApiKeyFields on IngestionApiKey {
  id
  sourceId
  name
  prefix
  createdAt
  expiresAt
  revokedAt
  lastUsedAt
}`) as unknown as TypedDocumentString<RevokeIngestionApiKeyMutation, RevokeIngestionApiKeyMutationVariables>;
export const IngestionBatchesDocument = /*#__PURE__*/ new TypedDocumentString(`
    query IngestionBatches($sourceId: String!, $pagination: IngestionPagination) {
  ingestionBatches(sourceId: $sourceId, pagination: $pagination) {
    ...PaginatedIngestionBatchesFields
  }
}
    fragment IngestionPageInfoFields on IngestionPageInfo {
  hasNextPage
  nextCursor
}
fragment IngestionBatchFields on IngestionBatch {
  id
  sourceId
  idempotencyKey
  mode
  status
  correlationId
  createdAt
  receivedCount
  acceptedCount
  rejectedCount
  createdCount
  updatedCount
  unchangedCount
}
fragment PaginatedIngestionBatchesFields on PaginatedIngestionBatches {
  totalCount
  pageInfo {
    ...IngestionPageInfoFields
  }
  items {
    ...IngestionBatchFields
  }
}`) as unknown as TypedDocumentString<IngestionBatchesQuery, IngestionBatchesQueryVariables>;
export const IngestionBatchDocument = /*#__PURE__*/ new TypedDocumentString(`
    query IngestionBatch($batchId: String!) {
  ingestionBatch(batchId: $batchId) {
    id
    sourceId
    idempotencyKey
    mode
    status
    correlationId
    createdAt
    receivedCount
    acceptedCount
    rejectedCount
    createdCount
    updatedCount
    unchangedCount
    items {
      externalId
      state
      catalogId
      reason
      unmappedFields
    }
  }
}
    `) as unknown as TypedDocumentString<IngestionBatchQuery, IngestionBatchQueryVariables>;
export const IngestionItemsDocument = /*#__PURE__*/ new TypedDocumentString(`
    query IngestionItems($filter: IngestionItemFilter, $pagination: IngestionPagination) {
  ingestionItems(filter: $filter, pagination: $pagination) {
    ...PaginatedIngestionItemsFields
  }
}
    fragment IngestionPageInfoFields on IngestionPageInfo {
  hasNextPage
  nextCursor
}
fragment IngestionItemCatalogFields on IngestionItemCatalog {
  id
  title
  slug
  status
  imageUrl
}
fragment IngestionItemFields on IngestionItem {
  id
  sourceId
  sourceSlug
  batchId
  externalId
  canonicalUrl
  imageCandidateUrl
  unmappedFields
  state
  rejectionReason
  reviewedById
  reviewedByName
  reviewedAt
  catalogId
  firstSeenAt
  lastSeenAt
  catalog {
    ...IngestionItemCatalogFields
  }
}
fragment PaginatedIngestionItemsFields on PaginatedIngestionItems {
  totalCount
  pageInfo {
    ...IngestionPageInfoFields
  }
  items {
    ...IngestionItemFields
  }
}`) as unknown as TypedDocumentString<IngestionItemsQuery, IngestionItemsQueryVariables>;
export const ApproveIngestionItemDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation ApproveIngestionItem($itemId: String!) {
  approveIngestionItem(itemId: $itemId) {
    ...IngestionItemFields
  }
}
    fragment IngestionItemCatalogFields on IngestionItemCatalog {
  id
  title
  slug
  status
  imageUrl
}
fragment IngestionItemFields on IngestionItem {
  id
  sourceId
  sourceSlug
  batchId
  externalId
  canonicalUrl
  imageCandidateUrl
  unmappedFields
  state
  rejectionReason
  reviewedById
  reviewedByName
  reviewedAt
  catalogId
  firstSeenAt
  lastSeenAt
  catalog {
    ...IngestionItemCatalogFields
  }
}`) as unknown as TypedDocumentString<ApproveIngestionItemMutation, ApproveIngestionItemMutationVariables>;
export const RejectIngestionItemDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation RejectIngestionItem($input: RejectIngestionItem!) {
  rejectIngestionItem(input: $input) {
    ...IngestionItemFields
  }
}
    fragment IngestionItemCatalogFields on IngestionItemCatalog {
  id
  title
  slug
  status
  imageUrl
}
fragment IngestionItemFields on IngestionItem {
  id
  sourceId
  sourceSlug
  batchId
  externalId
  canonicalUrl
  imageCandidateUrl
  unmappedFields
  state
  rejectionReason
  reviewedById
  reviewedByName
  reviewedAt
  catalogId
  firstSeenAt
  lastSeenAt
  catalog {
    ...IngestionItemCatalogFields
  }
}`) as unknown as TypedDocumentString<RejectIngestionItemMutation, RejectIngestionItemMutationVariables>;