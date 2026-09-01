import * as Types from "@/lib/graphql/base";
import { TypedDocumentString } from "@/lib/graphql/base";
export type AssociationSettingsFieldsFragment = { __typename?: 'AssociationSettings', id: string, associationId: string, defaultCreditType: Types.CreditType, onTrackThreshold: number, atRiskThreshold: number, renewalRequiresReviewedEvidence: boolean, complianceReminders: boolean, welcomeMessages: boolean, weeklyDigest: boolean, createdAt: string, updatedAt: string };

export type AssociationFieldsFragment = { __typename?: 'Association', id: string, name: string, logoUrl?: string | null, description?: string | null, country?: string | null, website?: string | null, contactEmail?: string | null, ownerEmail?: string | null, ownerFullName?: string | null, ownerStatus: Types.UserStatus, createdAt: string, updatedAt: string, settings?: { __typename?: 'AssociationSettings', id: string, associationId: string, defaultCreditType: Types.CreditType, onTrackThreshold: number, atRiskThreshold: number, renewalRequiresReviewedEvidence: boolean, complianceReminders: boolean, welcomeMessages: boolean, weeklyDigest: boolean, createdAt: string, updatedAt: string } | null };

export type AssociationProfileQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type AssociationProfileQuery = { __typename?: 'Query', associationProfile: { __typename?: 'Association', id: string, name: string, logoUrl?: string | null, description?: string | null, country?: string | null, website?: string | null, contactEmail?: string | null, ownerEmail?: string | null, ownerFullName?: string | null, ownerStatus: Types.UserStatus, createdAt: string, updatedAt: string, settings?: { __typename?: 'AssociationSettings', id: string, associationId: string, defaultCreditType: Types.CreditType, onTrackThreshold: number, atRiskThreshold: number, renewalRequiresReviewedEvidence: boolean, complianceReminders: boolean, welcomeMessages: boolean, weeklyDigest: boolean, createdAt: string, updatedAt: string } | null } };

export type UpdateAssociationProfileMutationVariables = Types.Exact<{
  input: Types.UpdateAssociationProfileInput;
}>;


export type UpdateAssociationProfileMutation = { __typename?: 'Mutation', updateAssociationProfile: { __typename?: 'Association', id: string, name: string, logoUrl?: string | null, description?: string | null, country?: string | null, website?: string | null, contactEmail?: string | null, ownerEmail?: string | null, ownerFullName?: string | null, ownerStatus: Types.UserStatus, createdAt: string, updatedAt: string, settings?: { __typename?: 'AssociationSettings', id: string, associationId: string, defaultCreditType: Types.CreditType, onTrackThreshold: number, atRiskThreshold: number, renewalRequiresReviewedEvidence: boolean, complianceReminders: boolean, welcomeMessages: boolean, weeklyDigest: boolean, createdAt: string, updatedAt: string } | null } };

export type CreateAssociationAccountMutationVariables = Types.Exact<{
  input: Types.CreateAssociationAccountInput;
}>;


export type CreateAssociationAccountMutation = { __typename?: 'Mutation', createAssociationAccount: { __typename?: 'AssociationActionResponse', code: string, success: boolean, message: string, association?: { __typename?: 'Association', id: string, name: string, logoUrl?: string | null, description?: string | null, country?: string | null, website?: string | null, contactEmail?: string | null, ownerEmail?: string | null, ownerFullName?: string | null, ownerStatus: Types.UserStatus, createdAt: string, updatedAt: string, settings?: { __typename?: 'AssociationSettings', id: string, associationId: string, defaultCreditType: Types.CreditType, onTrackThreshold: number, atRiskThreshold: number, renewalRequiresReviewedEvidence: boolean, complianceReminders: boolean, welcomeMessages: boolean, weeklyDigest: boolean, createdAt: string, updatedAt: string } | null } | null } };

export type ResendAssociationActivationMutationVariables = Types.Exact<{
  input: Types.ResendAssociationActivationInput;
}>;


export type ResendAssociationActivationMutation = { __typename?: 'Mutation', resendAssociationActivation: { __typename?: 'AssociationActionResponse', code: string, success: boolean, message: string } };

export type AssociationMemberGroupFieldsFragment = { __typename?: 'AssociationMemberGroup', id: string, title: string, isActive: boolean };

export type AssociationMemberFieldsFragment = { __typename?: 'AssociationMember', id: string, userId: string, fullName?: string | null, email?: string | null, avatarUrl?: string | null, memberNumber?: string | null, notes?: string | null, status: Types.AssociationMemberStatus, invitedAt: string, activatedAt?: string | null, deactivatedAt?: string | null, group?: { __typename?: 'AssociationMemberGroup', id: string, title: string, isActive: boolean } | null };

export type AssociationGroupFieldsFragment = { __typename?: 'AssociationGroup', id: string, title: string, description?: string | null, isActive: boolean, memberCount: number, createdAt: string, updatedAt: string };

export type AssociationMembersQueryVariables = Types.Exact<{
  filter?: Types.InputMaybe<Types.AssociationMemberFilterInput>;
  pagination?: Types.InputMaybe<Types.AssociationPaginationInput>;
}>;


export type AssociationMembersQuery = { __typename?: 'Query', associationMembers: { __typename?: 'PaginatedAssociationMembers', totalCount: number, pageInfo: { __typename?: 'AssociationPageInfo', hasNextPage: boolean, nextCursor?: string | null }, items: Array<{ __typename?: 'AssociationMember', id: string, userId: string, fullName?: string | null, email?: string | null, avatarUrl?: string | null, memberNumber?: string | null, notes?: string | null, status: Types.AssociationMemberStatus, invitedAt: string, activatedAt?: string | null, deactivatedAt?: string | null, group?: { __typename?: 'AssociationMemberGroup', id: string, title: string, isActive: boolean } | null }> } };

export type AssociationMemberStatsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type AssociationMemberStatsQuery = { __typename?: 'Query', associationMemberStats: { __typename?: 'AssociationMemberStats', totalMembers: number, activeMembers: number, pendingActivation: number } };

export type AssociationGroupsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type AssociationGroupsQuery = { __typename?: 'Query', associationGroups: Array<{ __typename?: 'AssociationGroup', id: string, title: string, description?: string | null, isActive: boolean, memberCount: number, createdAt: string, updatedAt: string }> };

export type InviteAssociationMemberMutationVariables = Types.Exact<{
  input: Types.InviteAssociationMemberInput;
}>;


export type InviteAssociationMemberMutation = { __typename?: 'Mutation', inviteAssociationMember: { __typename?: 'AssociationInviteResult', outcome: Types.AssociationInviteOutcome, member: { __typename?: 'AssociationMember', id: string, userId: string, fullName?: string | null, email?: string | null, avatarUrl?: string | null, memberNumber?: string | null, notes?: string | null, status: Types.AssociationMemberStatus, invitedAt: string, activatedAt?: string | null, deactivatedAt?: string | null, group?: { __typename?: 'AssociationMemberGroup', id: string, title: string, isActive: boolean } | null } } };

export type BulkInviteAssociationMembersMutationVariables = Types.Exact<{
  input: Types.BulkInviteAssociationMembersInput;
}>;


export type BulkInviteAssociationMembersMutation = { __typename?: 'Mutation', bulkInviteAssociationMembers: { __typename?: 'AssociationBulkInviteResult', totalRows: number, invited: number, linked: number, failed: number, failures: Array<{ __typename?: 'AssociationBulkInviteFailure', row: number, email: string, code: string, reason: string }> } };

export type UpdateAssociationMemberMutationVariables = Types.Exact<{
  input: Types.UpdateAssociationMemberInput;
}>;


export type UpdateAssociationMemberMutation = { __typename?: 'Mutation', updateAssociationMember: { __typename?: 'AssociationMember', id: string, userId: string, fullName?: string | null, email?: string | null, avatarUrl?: string | null, memberNumber?: string | null, notes?: string | null, status: Types.AssociationMemberStatus, invitedAt: string, activatedAt?: string | null, deactivatedAt?: string | null, group?: { __typename?: 'AssociationMemberGroup', id: string, title: string, isActive: boolean } | null } };

export type SetAssociationMemberStatusMutationVariables = Types.Exact<{
  input: Types.SetAssociationMemberStatusInput;
}>;


export type SetAssociationMemberStatusMutation = { __typename?: 'Mutation', setAssociationMemberStatus: { __typename?: 'AssociationMember', id: string, userId: string, fullName?: string | null, email?: string | null, avatarUrl?: string | null, memberNumber?: string | null, notes?: string | null, status: Types.AssociationMemberStatus, invitedAt: string, activatedAt?: string | null, deactivatedAt?: string | null, group?: { __typename?: 'AssociationMemberGroup', id: string, title: string, isActive: boolean } | null } };

export type ResendAssociationMemberInvitationMutationVariables = Types.Exact<{
  input: Types.ResendAssociationMemberInvitationInput;
}>;


export type ResendAssociationMemberInvitationMutation = { __typename?: 'Mutation', resendAssociationMemberInvitation: { __typename?: 'AssociationMember', id: string, userId: string, fullName?: string | null, email?: string | null, avatarUrl?: string | null, memberNumber?: string | null, notes?: string | null, status: Types.AssociationMemberStatus, invitedAt: string, activatedAt?: string | null, deactivatedAt?: string | null, group?: { __typename?: 'AssociationMemberGroup', id: string, title: string, isActive: boolean } | null } };

export type CreateAssociationGroupMutationVariables = Types.Exact<{
  input: Types.CreateAssociationGroupInput;
}>;


export type CreateAssociationGroupMutation = { __typename?: 'Mutation', createAssociationGroup: { __typename?: 'AssociationGroup', id: string, title: string, description?: string | null, isActive: boolean, memberCount: number, createdAt: string, updatedAt: string } };

export type UpdateAssociationGroupMutationVariables = Types.Exact<{
  input: Types.UpdateAssociationGroupInput;
}>;


export type UpdateAssociationGroupMutation = { __typename?: 'Mutation', updateAssociationGroup: { __typename?: 'AssociationGroup', id: string, title: string, description?: string | null, isActive: boolean, memberCount: number, createdAt: string, updatedAt: string } };

export type SetAssociationGroupActiveMutationVariables = Types.Exact<{
  input: Types.SetAssociationGroupActiveInput;
}>;


export type SetAssociationGroupActiveMutation = { __typename?: 'Mutation', setAssociationGroupActive: { __typename?: 'AssociationGroup', id: string, title: string, description?: string | null, isActive: boolean, memberCount: number, createdAt: string, updatedAt: string } };

export const AssociationSettingsFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment AssociationSettingsFields on AssociationSettings {
  id
  associationId
  defaultCreditType
  onTrackThreshold
  atRiskThreshold
  renewalRequiresReviewedEvidence
  complianceReminders
  welcomeMessages
  weeklyDigest
  createdAt
  updatedAt
}
    `, {"fragmentName":"AssociationSettingsFields"}) as unknown as TypedDocumentString<AssociationSettingsFieldsFragment, unknown>;
export const AssociationFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment AssociationFields on Association {
  id
  name
  logoUrl
  description
  country
  website
  contactEmail
  ownerEmail
  ownerFullName
  ownerStatus
  createdAt
  updatedAt
  settings {
    ...AssociationSettingsFields
  }
}
    fragment AssociationSettingsFields on AssociationSettings {
  id
  associationId
  defaultCreditType
  onTrackThreshold
  atRiskThreshold
  renewalRequiresReviewedEvidence
  complianceReminders
  welcomeMessages
  weeklyDigest
  createdAt
  updatedAt
}`, {"fragmentName":"AssociationFields"}) as unknown as TypedDocumentString<AssociationFieldsFragment, unknown>;
export const AssociationMemberGroupFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment AssociationMemberGroupFields on AssociationMemberGroup {
  id
  title
  isActive
}
    `, {"fragmentName":"AssociationMemberGroupFields"}) as unknown as TypedDocumentString<AssociationMemberGroupFieldsFragment, unknown>;
export const AssociationMemberFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment AssociationMemberFields on AssociationMember {
  id
  userId
  fullName
  email
  avatarUrl
  memberNumber
  notes
  status
  invitedAt
  activatedAt
  deactivatedAt
  group {
    ...AssociationMemberGroupFields
  }
}
    fragment AssociationMemberGroupFields on AssociationMemberGroup {
  id
  title
  isActive
}`, {"fragmentName":"AssociationMemberFields"}) as unknown as TypedDocumentString<AssociationMemberFieldsFragment, unknown>;
export const AssociationGroupFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment AssociationGroupFields on AssociationGroup {
  id
  title
  description
  isActive
  memberCount
  createdAt
  updatedAt
}
    `, {"fragmentName":"AssociationGroupFields"}) as unknown as TypedDocumentString<AssociationGroupFieldsFragment, unknown>;
export const AssociationProfileDocument = /*#__PURE__*/ new TypedDocumentString(`
    query AssociationProfile {
  associationProfile {
    ...AssociationFields
  }
}
    fragment AssociationSettingsFields on AssociationSettings {
  id
  associationId
  defaultCreditType
  onTrackThreshold
  atRiskThreshold
  renewalRequiresReviewedEvidence
  complianceReminders
  welcomeMessages
  weeklyDigest
  createdAt
  updatedAt
}
fragment AssociationFields on Association {
  id
  name
  logoUrl
  description
  country
  website
  contactEmail
  ownerEmail
  ownerFullName
  ownerStatus
  createdAt
  updatedAt
  settings {
    ...AssociationSettingsFields
  }
}`) as unknown as TypedDocumentString<AssociationProfileQuery, AssociationProfileQueryVariables>;
export const UpdateAssociationProfileDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation UpdateAssociationProfile($input: UpdateAssociationProfileInput!) {
  updateAssociationProfile(input: $input) {
    ...AssociationFields
  }
}
    fragment AssociationSettingsFields on AssociationSettings {
  id
  associationId
  defaultCreditType
  onTrackThreshold
  atRiskThreshold
  renewalRequiresReviewedEvidence
  complianceReminders
  welcomeMessages
  weeklyDigest
  createdAt
  updatedAt
}
fragment AssociationFields on Association {
  id
  name
  logoUrl
  description
  country
  website
  contactEmail
  ownerEmail
  ownerFullName
  ownerStatus
  createdAt
  updatedAt
  settings {
    ...AssociationSettingsFields
  }
}`) as unknown as TypedDocumentString<UpdateAssociationProfileMutation, UpdateAssociationProfileMutationVariables>;
export const CreateAssociationAccountDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation CreateAssociationAccount($input: CreateAssociationAccountInput!) {
  createAssociationAccount(input: $input) {
    code
    success
    message
    association {
      ...AssociationFields
    }
  }
}
    fragment AssociationSettingsFields on AssociationSettings {
  id
  associationId
  defaultCreditType
  onTrackThreshold
  atRiskThreshold
  renewalRequiresReviewedEvidence
  complianceReminders
  welcomeMessages
  weeklyDigest
  createdAt
  updatedAt
}
fragment AssociationFields on Association {
  id
  name
  logoUrl
  description
  country
  website
  contactEmail
  ownerEmail
  ownerFullName
  ownerStatus
  createdAt
  updatedAt
  settings {
    ...AssociationSettingsFields
  }
}`) as unknown as TypedDocumentString<CreateAssociationAccountMutation, CreateAssociationAccountMutationVariables>;
export const ResendAssociationActivationDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation ResendAssociationActivation($input: ResendAssociationActivationInput!) {
  resendAssociationActivation(input: $input) {
    code
    success
    message
  }
}
    `) as unknown as TypedDocumentString<ResendAssociationActivationMutation, ResendAssociationActivationMutationVariables>;
export const AssociationMembersDocument = /*#__PURE__*/ new TypedDocumentString(`
    query AssociationMembers($filter: AssociationMemberFilterInput, $pagination: AssociationPaginationInput) {
  associationMembers(filter: $filter, pagination: $pagination) {
    totalCount
    pageInfo {
      hasNextPage
      nextCursor
    }
    items {
      ...AssociationMemberFields
    }
  }
}
    fragment AssociationMemberGroupFields on AssociationMemberGroup {
  id
  title
  isActive
}
fragment AssociationMemberFields on AssociationMember {
  id
  userId
  fullName
  email
  avatarUrl
  memberNumber
  notes
  status
  invitedAt
  activatedAt
  deactivatedAt
  group {
    ...AssociationMemberGroupFields
  }
}`) as unknown as TypedDocumentString<AssociationMembersQuery, AssociationMembersQueryVariables>;
export const AssociationMemberStatsDocument = /*#__PURE__*/ new TypedDocumentString(`
    query AssociationMemberStats {
  associationMemberStats {
    totalMembers
    activeMembers
    pendingActivation
  }
}
    `) as unknown as TypedDocumentString<AssociationMemberStatsQuery, AssociationMemberStatsQueryVariables>;
export const AssociationGroupsDocument = /*#__PURE__*/ new TypedDocumentString(`
    query AssociationGroups {
  associationGroups {
    ...AssociationGroupFields
  }
}
    fragment AssociationGroupFields on AssociationGroup {
  id
  title
  description
  isActive
  memberCount
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<AssociationGroupsQuery, AssociationGroupsQueryVariables>;
export const InviteAssociationMemberDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation InviteAssociationMember($input: InviteAssociationMemberInput!) {
  inviteAssociationMember(input: $input) {
    outcome
    member {
      ...AssociationMemberFields
    }
  }
}
    fragment AssociationMemberGroupFields on AssociationMemberGroup {
  id
  title
  isActive
}
fragment AssociationMemberFields on AssociationMember {
  id
  userId
  fullName
  email
  avatarUrl
  memberNumber
  notes
  status
  invitedAt
  activatedAt
  deactivatedAt
  group {
    ...AssociationMemberGroupFields
  }
}`) as unknown as TypedDocumentString<InviteAssociationMemberMutation, InviteAssociationMemberMutationVariables>;
export const BulkInviteAssociationMembersDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation BulkInviteAssociationMembers($input: BulkInviteAssociationMembersInput!) {
  bulkInviteAssociationMembers(input: $input) {
    totalRows
    invited
    linked
    failed
    failures {
      row
      email
      code
      reason
    }
  }
}
    `) as unknown as TypedDocumentString<BulkInviteAssociationMembersMutation, BulkInviteAssociationMembersMutationVariables>;
export const UpdateAssociationMemberDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation UpdateAssociationMember($input: UpdateAssociationMemberInput!) {
  updateAssociationMember(input: $input) {
    ...AssociationMemberFields
  }
}
    fragment AssociationMemberGroupFields on AssociationMemberGroup {
  id
  title
  isActive
}
fragment AssociationMemberFields on AssociationMember {
  id
  userId
  fullName
  email
  avatarUrl
  memberNumber
  notes
  status
  invitedAt
  activatedAt
  deactivatedAt
  group {
    ...AssociationMemberGroupFields
  }
}`) as unknown as TypedDocumentString<UpdateAssociationMemberMutation, UpdateAssociationMemberMutationVariables>;
export const SetAssociationMemberStatusDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation SetAssociationMemberStatus($input: SetAssociationMemberStatusInput!) {
  setAssociationMemberStatus(input: $input) {
    ...AssociationMemberFields
  }
}
    fragment AssociationMemberGroupFields on AssociationMemberGroup {
  id
  title
  isActive
}
fragment AssociationMemberFields on AssociationMember {
  id
  userId
  fullName
  email
  avatarUrl
  memberNumber
  notes
  status
  invitedAt
  activatedAt
  deactivatedAt
  group {
    ...AssociationMemberGroupFields
  }
}`) as unknown as TypedDocumentString<SetAssociationMemberStatusMutation, SetAssociationMemberStatusMutationVariables>;
export const ResendAssociationMemberInvitationDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation ResendAssociationMemberInvitation($input: ResendAssociationMemberInvitationInput!) {
  resendAssociationMemberInvitation(input: $input) {
    ...AssociationMemberFields
  }
}
    fragment AssociationMemberGroupFields on AssociationMemberGroup {
  id
  title
  isActive
}
fragment AssociationMemberFields on AssociationMember {
  id
  userId
  fullName
  email
  avatarUrl
  memberNumber
  notes
  status
  invitedAt
  activatedAt
  deactivatedAt
  group {
    ...AssociationMemberGroupFields
  }
}`) as unknown as TypedDocumentString<ResendAssociationMemberInvitationMutation, ResendAssociationMemberInvitationMutationVariables>;
export const CreateAssociationGroupDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation CreateAssociationGroup($input: CreateAssociationGroupInput!) {
  createAssociationGroup(input: $input) {
    ...AssociationGroupFields
  }
}
    fragment AssociationGroupFields on AssociationGroup {
  id
  title
  description
  isActive
  memberCount
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<CreateAssociationGroupMutation, CreateAssociationGroupMutationVariables>;
export const UpdateAssociationGroupDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation UpdateAssociationGroup($input: UpdateAssociationGroupInput!) {
  updateAssociationGroup(input: $input) {
    ...AssociationGroupFields
  }
}
    fragment AssociationGroupFields on AssociationGroup {
  id
  title
  description
  isActive
  memberCount
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<UpdateAssociationGroupMutation, UpdateAssociationGroupMutationVariables>;
export const SetAssociationGroupActiveDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation SetAssociationGroupActive($input: SetAssociationGroupActiveInput!) {
  setAssociationGroupActive(input: $input) {
    ...AssociationGroupFields
  }
}
    fragment AssociationGroupFields on AssociationGroup {
  id
  title
  description
  isActive
  memberCount
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<SetAssociationGroupActiveMutation, SetAssociationGroupActiveMutationVariables>;