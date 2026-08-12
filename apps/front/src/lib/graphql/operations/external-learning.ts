import * as Types from "@/lib/graphql/base";
import { TypedDocumentString } from "@/lib/graphql/base";
export type ExternalLearningActivityFieldsFragment = { __typename?: 'ExternalLearningActivity', id: string, title: string, status: Types.ExternalLearningStatus, userId: string, eventId?: string | null, courseId?: string | null, provider: Types.ExternalLearningProvider, pduHours?: number | null, clickedAt: string, createdAt: string, startedAt?: string | null, updatedAt: string, remindedAt?: string | null, rejectedAt?: string | null, verifiedAt?: string | null, externalUrl: string, confirmedAt?: string | null, completedAt?: string | null, rejectReason?: string | null, evidenceNote?: string | null, licenseNumber?: string | null, certificateUrl?: string | null };

export type PaginatedExternalLearningFieldsFragment = { __typename?: 'PaginatedExternalLearning', totalCount: number, pageInfo: { __typename?: 'OrganizationPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'ExternalLearningActivity', id: string, title: string, status: Types.ExternalLearningStatus, userId: string, eventId?: string | null, courseId?: string | null, provider: Types.ExternalLearningProvider, pduHours?: number | null, clickedAt: string, createdAt: string, startedAt?: string | null, updatedAt: string, remindedAt?: string | null, rejectedAt?: string | null, verifiedAt?: string | null, externalUrl: string, confirmedAt?: string | null, completedAt?: string | null, rejectReason?: string | null, evidenceNote?: string | null, licenseNumber?: string | null, certificateUrl?: string | null }> };

export type TrackExternalLearningClickMutationVariables = Types.Exact<{
  input: Types.CreateExternalLearningClickInput;
}>;


export type TrackExternalLearningClickMutation = { __typename?: 'Mutation', trackExternalLearningClick: { __typename?: 'ExternalLearningActivity', id: string, title: string, status: Types.ExternalLearningStatus, userId: string, eventId?: string | null, courseId?: string | null, provider: Types.ExternalLearningProvider, pduHours?: number | null, clickedAt: string, createdAt: string, startedAt?: string | null, updatedAt: string, remindedAt?: string | null, rejectedAt?: string | null, verifiedAt?: string | null, externalUrl: string, confirmedAt?: string | null, completedAt?: string | null, rejectReason?: string | null, evidenceNote?: string | null, licenseNumber?: string | null, certificateUrl?: string | null } };

export type MyExternalLearningActivitiesQueryVariables = Types.Exact<{
  filter?: Types.InputMaybe<Types.ExternalLearningFilterInput>;
  pagination?: Types.InputMaybe<Types.OrganizationPaginationInput>;
}>;


export type MyExternalLearningActivitiesQuery = { __typename?: 'Query', myExternalLearningActivities: { __typename?: 'PaginatedExternalLearning', totalCount: number, pageInfo: { __typename?: 'OrganizationPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'ExternalLearningActivity', id: string, title: string, status: Types.ExternalLearningStatus, userId: string, eventId?: string | null, courseId?: string | null, provider: Types.ExternalLearningProvider, pduHours?: number | null, clickedAt: string, createdAt: string, startedAt?: string | null, updatedAt: string, remindedAt?: string | null, rejectedAt?: string | null, verifiedAt?: string | null, externalUrl: string, confirmedAt?: string | null, completedAt?: string | null, rejectReason?: string | null, evidenceNote?: string | null, licenseNumber?: string | null, certificateUrl?: string | null }> } };

export type ConfirmExternalLearningMutationVariables = Types.Exact<{
  input: Types.ConfirmExternalLearningInput;
}>;


export type ConfirmExternalLearningMutation = { __typename?: 'Mutation', confirmExternalLearning: { __typename?: 'ExternalLearningActivity', id: string, title: string, status: Types.ExternalLearningStatus, userId: string, eventId?: string | null, courseId?: string | null, provider: Types.ExternalLearningProvider, pduHours?: number | null, clickedAt: string, createdAt: string, startedAt?: string | null, updatedAt: string, remindedAt?: string | null, rejectedAt?: string | null, verifiedAt?: string | null, externalUrl: string, confirmedAt?: string | null, completedAt?: string | null, rejectReason?: string | null, evidenceNote?: string | null, licenseNumber?: string | null, certificateUrl?: string | null } };

export type IgnoreExternalLearningMutationVariables = Types.Exact<{
  activityId: Types.Scalars['String']['input'];
}>;


export type IgnoreExternalLearningMutation = { __typename?: 'Mutation', ignoreExternalLearning: { __typename?: 'ExternalLearningActionResponse', code: string, success: boolean, message: string } };

export const ExternalLearningActivityFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment ExternalLearningActivityFields on ExternalLearningActivity {
  id
  title
  status
  userId
  eventId
  courseId
  provider
  pduHours
  clickedAt
  createdAt
  startedAt
  updatedAt
  remindedAt
  rejectedAt
  verifiedAt
  externalUrl
  confirmedAt
  completedAt
  rejectReason
  evidenceNote
  licenseNumber
  certificateUrl
}
    `, {"fragmentName":"ExternalLearningActivityFields"}) as unknown as TypedDocumentString<ExternalLearningActivityFieldsFragment, unknown>;
export const PaginatedExternalLearningFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment PaginatedExternalLearningFields on PaginatedExternalLearning {
  totalCount
  pageInfo {
    nextCursor
    hasNextPage
  }
  items {
    ...ExternalLearningActivityFields
  }
}
    fragment ExternalLearningActivityFields on ExternalLearningActivity {
  id
  title
  status
  userId
  eventId
  courseId
  provider
  pduHours
  clickedAt
  createdAt
  startedAt
  updatedAt
  remindedAt
  rejectedAt
  verifiedAt
  externalUrl
  confirmedAt
  completedAt
  rejectReason
  evidenceNote
  licenseNumber
  certificateUrl
}`, {"fragmentName":"PaginatedExternalLearningFields"}) as unknown as TypedDocumentString<PaginatedExternalLearningFieldsFragment, unknown>;
export const TrackExternalLearningClickDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation TrackExternalLearningClick($input: CreateExternalLearningClickInput!) {
  trackExternalLearningClick(input: $input) {
    ...ExternalLearningActivityFields
  }
}
    fragment ExternalLearningActivityFields on ExternalLearningActivity {
  id
  title
  status
  userId
  eventId
  courseId
  provider
  pduHours
  clickedAt
  createdAt
  startedAt
  updatedAt
  remindedAt
  rejectedAt
  verifiedAt
  externalUrl
  confirmedAt
  completedAt
  rejectReason
  evidenceNote
  licenseNumber
  certificateUrl
}`) as unknown as TypedDocumentString<TrackExternalLearningClickMutation, TrackExternalLearningClickMutationVariables>;
export const MyExternalLearningActivitiesDocument = /*#__PURE__*/ new TypedDocumentString(`
    query MyExternalLearningActivities($filter: ExternalLearningFilterInput, $pagination: OrganizationPaginationInput) {
  myExternalLearningActivities(filter: $filter, pagination: $pagination) {
    ...PaginatedExternalLearningFields
  }
}
    fragment ExternalLearningActivityFields on ExternalLearningActivity {
  id
  title
  status
  userId
  eventId
  courseId
  provider
  pduHours
  clickedAt
  createdAt
  startedAt
  updatedAt
  remindedAt
  rejectedAt
  verifiedAt
  externalUrl
  confirmedAt
  completedAt
  rejectReason
  evidenceNote
  licenseNumber
  certificateUrl
}
fragment PaginatedExternalLearningFields on PaginatedExternalLearning {
  totalCount
  pageInfo {
    nextCursor
    hasNextPage
  }
  items {
    ...ExternalLearningActivityFields
  }
}`) as unknown as TypedDocumentString<MyExternalLearningActivitiesQuery, MyExternalLearningActivitiesQueryVariables>;
export const ConfirmExternalLearningDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation ConfirmExternalLearning($input: ConfirmExternalLearningInput!) {
  confirmExternalLearning(input: $input) {
    ...ExternalLearningActivityFields
  }
}
    fragment ExternalLearningActivityFields on ExternalLearningActivity {
  id
  title
  status
  userId
  eventId
  courseId
  provider
  pduHours
  clickedAt
  createdAt
  startedAt
  updatedAt
  remindedAt
  rejectedAt
  verifiedAt
  externalUrl
  confirmedAt
  completedAt
  rejectReason
  evidenceNote
  licenseNumber
  certificateUrl
}`) as unknown as TypedDocumentString<ConfirmExternalLearningMutation, ConfirmExternalLearningMutationVariables>;
export const IgnoreExternalLearningDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation IgnoreExternalLearning($activityId: String!) {
  ignoreExternalLearning(activityId: $activityId) {
    code
    success
    message
  }
}
    `) as unknown as TypedDocumentString<IgnoreExternalLearningMutation, IgnoreExternalLearningMutationVariables>;