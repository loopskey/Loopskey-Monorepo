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

export type AssociationCategoryProgressFieldsFragment = { __typename?: 'AssociationCategoryProgress', id: string, name: string, percent: number, requiredCredits: number, completedCredits: number };

export type AssociationAssignmentProgressFieldsFragment = { __typename?: 'AssociationAssignmentProgress', id: string, requirementId: string, requirementName: string, creditType: Types.CreditType, evidencePolicy: Types.AssociationEvidencePolicy, requiredCredits: number, completedCredits: number, percent: number, band: Types.AssociationComplianceBand, cycleStart: string, cycleEnd?: string | null, dueDate?: string | null, daysRemaining?: number | null, awaitingReviewCount: number, isMissingEvidence: boolean, computedAt?: string | null, categories: Array<{ __typename?: 'AssociationCategoryProgress', id: string, name: string, percent: number, requiredCredits: number, completedCredits: number }> };

export type AssociationEvidenceFileFieldsFragment = { __typename?: 'AssociationEvidenceFile', id: string, fileName: string, mimeType: string, sizeBytes: number };

export type AssociationMemberActivityFieldsFragment = { __typename?: 'AssociationMemberActivity', id: string, memberId: string, title: string, source: Types.PduSource, category: Types.PduCategory, creditType: Types.CreditType, credits: number, date: string, state: Types.AssociationAttributionState, isLate: boolean, canReview: boolean, hasEvidence: boolean, evidenceNote?: string | null, evidenceUrl?: string | null, reviewNote?: string | null, files: Array<{ __typename?: 'AssociationEvidenceFile', id: string, fileName: string, mimeType: string, sizeBytes: number }>, requirements: Array<{ __typename?: 'AssociationActivityRequirement', id: string, name: string, canReview: boolean, creditedAmount: number }> };

export type AssociationMemberProfileQueryVariables = Types.Exact<{
  memberId: Types.Scalars['ID']['input'];
}>;


export type AssociationMemberProfileQuery = { __typename?: 'Query', associationMemberProfile: { __typename?: 'AssociationMemberProfile', isMissingEvidence: boolean, member: { __typename?: 'AssociationMember', id: string, userId: string, fullName?: string | null, email?: string | null, avatarUrl?: string | null, memberNumber?: string | null, notes?: string | null, status: Types.AssociationMemberStatus, invitedAt: string, activatedAt?: string | null, deactivatedAt?: string | null, group?: { __typename?: 'AssociationMemberGroup', id: string, title: string, isActive: boolean } | null }, summary: { __typename?: 'AssociationMemberSummary', percent: number, band: Types.AssociationComplianceBand, creditsRequired: number, creditsCompleted: number, creditsRemaining: number, awaitingReviewCount: number, nearestDueDate?: string | null, nearestDueDays?: number | null, nearestRequirementId?: string | null, nearestRequirementName?: string | null, pacePercent?: number | null }, assignments: Array<{ __typename?: 'AssociationAssignmentProgress', id: string, requirementId: string, requirementName: string, creditType: Types.CreditType, evidencePolicy: Types.AssociationEvidencePolicy, requiredCredits: number, completedCredits: number, percent: number, band: Types.AssociationComplianceBand, cycleStart: string, cycleEnd?: string | null, dueDate?: string | null, daysRemaining?: number | null, awaitingReviewCount: number, isMissingEvidence: boolean, computedAt?: string | null, categories: Array<{ __typename?: 'AssociationCategoryProgress', id: string, name: string, percent: number, requiredCredits: number, completedCredits: number }> }>, cumulative: Array<{ __typename?: 'AssociationCumulativePoint', date: string, credits: number, requiredCredits: number }>, certificates: Array<{ __typename?: 'AssociationMemberCertificate', id: string, memberId: string, title: string, issuer?: string | null, issuedAt: string, validUntil?: string | null, status: Types.CertificateStatus, creditsEarned: number, files: Array<{ __typename?: 'AssociationEvidenceFile', id: string, fileName: string, mimeType: string, sizeBytes: number }> }> } };

export type AssociationMemberActivitiesQueryVariables = Types.Exact<{
  memberId: Types.Scalars['ID']['input'];
  filter?: Types.InputMaybe<Types.AssociationMemberActivityFilterInput>;
  pagination?: Types.InputMaybe<Types.AssociationPaginationInput>;
}>;


export type AssociationMemberActivitiesQuery = { __typename?: 'Query', associationMemberActivities: { __typename?: 'PaginatedAssociationMemberActivities', totalCount: number, counts: { __typename?: 'AssociationActivityCounts', counted: number, rejected: number, awaitingReview: number }, pageInfo: { __typename?: 'AssociationPageInfo', hasNextPage: boolean, nextCursor?: string | null }, items: Array<{ __typename?: 'AssociationMemberActivity', id: string, memberId: string, title: string, source: Types.PduSource, category: Types.PduCategory, creditType: Types.CreditType, credits: number, date: string, state: Types.AssociationAttributionState, isLate: boolean, canReview: boolean, hasEvidence: boolean, evidenceNote?: string | null, evidenceUrl?: string | null, reviewNote?: string | null, files: Array<{ __typename?: 'AssociationEvidenceFile', id: string, fileName: string, mimeType: string, sizeBytes: number }>, requirements: Array<{ __typename?: 'AssociationActivityRequirement', id: string, name: string, canReview: boolean, creditedAmount: number }> }> } };

export type AssociationMemberRequirementOptionsQueryVariables = Types.Exact<{
  memberId: Types.Scalars['ID']['input'];
}>;


export type AssociationMemberRequirementOptionsQuery = { __typename?: 'Query', associationMemberRequirementOptions: Array<{ __typename?: 'AssociationMemberRequirementOption', id: string, name: string, deadline?: string | null, creditType: Types.CreditType, audienceKind: Types.AssociationAudienceKind, isAssigned: boolean, isMemberManaged: boolean, totalRequiredCredits: number }> };

export type ReviewAssociationLearningActivityMutationVariables = Types.Exact<{
  input: Types.ReviewAssociationLearningActivityInput;
}>;


export type ReviewAssociationLearningActivityMutation = { __typename?: 'Mutation', reviewAssociationLearningActivity: { __typename?: 'AssociationReviewResult', approved: boolean, memberId: string, activityId: string, requirementId: string } };

export type SetAssociationMemberRequirementsMutationVariables = Types.Exact<{
  input: Types.SetAssociationMemberRequirementsInput;
}>;


export type SetAssociationMemberRequirementsMutation = { __typename?: 'Mutation', setAssociationMemberRequirements: { __typename?: 'AssociationMemberRequirementsResult', memberId: string, added: number, removed: number } };

export type AssociationLearningContentFieldsFragment = { __typename?: 'AssociationLearningContent', id: string, title: string, isExternal: boolean, isAvailable: boolean, contentType?: Types.ContentType | null, contentId?: string | null, provider?: string | null, imageUrl?: string | null, externalUrl?: string | null, description?: string | null, category: Types.PduCategory, indicativeCredits?: number | null, requirementId?: string | null, requirementName?: string | null, groupId?: string | null, groupTitle?: string | null, status: Types.AssociationLearningContentStatus, audienceKind: Types.AssociationAudienceKind, publishedAt?: string | null, withdrawnAt?: string | null, createdAt: string, updatedAt: string };

export type AssociationLearningContentsQueryVariables = Types.Exact<{
  filter?: Types.InputMaybe<Types.AssociationLearningContentFilterInput>;
  pagination?: Types.InputMaybe<Types.AssociationPaginationInput>;
}>;


export type AssociationLearningContentsQuery = { __typename?: 'Query', associationLearningContents: { __typename?: 'PaginatedAssociationLearningContents', totalCount: number, pageInfo: { __typename?: 'AssociationPageInfo', hasNextPage: boolean, nextCursor?: string | null }, items: Array<{ __typename?: 'AssociationLearningContent', id: string, title: string, isExternal: boolean, isAvailable: boolean, contentType?: Types.ContentType | null, contentId?: string | null, provider?: string | null, imageUrl?: string | null, externalUrl?: string | null, description?: string | null, category: Types.PduCategory, indicativeCredits?: number | null, requirementId?: string | null, requirementName?: string | null, groupId?: string | null, groupTitle?: string | null, status: Types.AssociationLearningContentStatus, audienceKind: Types.AssociationAudienceKind, publishedAt?: string | null, withdrawnAt?: string | null, createdAt: string, updatedAt: string }> } };

export type AssociationLearningContentQueryVariables = Types.Exact<{
  learningContentId: Types.Scalars['ID']['input'];
}>;


export type AssociationLearningContentQuery = { __typename?: 'Query', associationLearningContent: { __typename?: 'AssociationLearningContent', id: string, title: string, isExternal: boolean, isAvailable: boolean, contentType?: Types.ContentType | null, contentId?: string | null, provider?: string | null, imageUrl?: string | null, externalUrl?: string | null, description?: string | null, category: Types.PduCategory, indicativeCredits?: number | null, requirementId?: string | null, requirementName?: string | null, groupId?: string | null, groupTitle?: string | null, status: Types.AssociationLearningContentStatus, audienceKind: Types.AssociationAudienceKind, publishedAt?: string | null, withdrawnAt?: string | null, createdAt: string, updatedAt: string, engagement?: { __typename?: 'AssociationLearningEngagement', memberCount: number, credits: number } | null } };

export type AssociationCatalogSearchQueryVariables = Types.Exact<{
  input: Types.AssociationCatalogSearchInput;
}>;


export type AssociationCatalogSearchQuery = { __typename?: 'Query', associationCatalogSearch: Array<{ __typename?: 'AssociationCatalogItem', contentType: Types.ContentType, contentId: string, title: string, provider?: string | null, imageUrl?: string | null, isAvailable: boolean }> };

export type CreateAssociationLearningContentMutationVariables = Types.Exact<{
  input: Types.CreateAssociationLearningContentInput;
}>;


export type CreateAssociationLearningContentMutation = { __typename?: 'Mutation', createAssociationLearningContent: { __typename?: 'AssociationLearningContent', id: string, title: string, isExternal: boolean, isAvailable: boolean, contentType?: Types.ContentType | null, contentId?: string | null, provider?: string | null, imageUrl?: string | null, externalUrl?: string | null, description?: string | null, category: Types.PduCategory, indicativeCredits?: number | null, requirementId?: string | null, requirementName?: string | null, groupId?: string | null, groupTitle?: string | null, status: Types.AssociationLearningContentStatus, audienceKind: Types.AssociationAudienceKind, publishedAt?: string | null, withdrawnAt?: string | null, createdAt: string, updatedAt: string } };

export type UpdateAssociationLearningContentMutationVariables = Types.Exact<{
  input: Types.UpdateAssociationLearningContentInput;
}>;


export type UpdateAssociationLearningContentMutation = { __typename?: 'Mutation', updateAssociationLearningContent: { __typename?: 'AssociationLearningContent', id: string, title: string, isExternal: boolean, isAvailable: boolean, contentType?: Types.ContentType | null, contentId?: string | null, provider?: string | null, imageUrl?: string | null, externalUrl?: string | null, description?: string | null, category: Types.PduCategory, indicativeCredits?: number | null, requirementId?: string | null, requirementName?: string | null, groupId?: string | null, groupTitle?: string | null, status: Types.AssociationLearningContentStatus, audienceKind: Types.AssociationAudienceKind, publishedAt?: string | null, withdrawnAt?: string | null, createdAt: string, updatedAt: string } };

export type PublishAssociationLearningContentMutationVariables = Types.Exact<{
  input: Types.PublishAssociationLearningContentInput;
}>;


export type PublishAssociationLearningContentMutation = { __typename?: 'Mutation', publishAssociationLearningContent: { __typename?: 'AssociationLearningContent', id: string, title: string, isExternal: boolean, isAvailable: boolean, contentType?: Types.ContentType | null, contentId?: string | null, provider?: string | null, imageUrl?: string | null, externalUrl?: string | null, description?: string | null, category: Types.PduCategory, indicativeCredits?: number | null, requirementId?: string | null, requirementName?: string | null, groupId?: string | null, groupTitle?: string | null, status: Types.AssociationLearningContentStatus, audienceKind: Types.AssociationAudienceKind, publishedAt?: string | null, withdrawnAt?: string | null, createdAt: string, updatedAt: string } };

export type WithdrawAssociationLearningContentMutationVariables = Types.Exact<{
  input: Types.AssociationLearningContentIdInput;
}>;


export type WithdrawAssociationLearningContentMutation = { __typename?: 'Mutation', withdrawAssociationLearningContent: { __typename?: 'AssociationLearningContent', id: string, title: string, isExternal: boolean, isAvailable: boolean, contentType?: Types.ContentType | null, contentId?: string | null, provider?: string | null, imageUrl?: string | null, externalUrl?: string | null, description?: string | null, category: Types.PduCategory, indicativeCredits?: number | null, requirementId?: string | null, requirementName?: string | null, groupId?: string | null, groupTitle?: string | null, status: Types.AssociationLearningContentStatus, audienceKind: Types.AssociationAudienceKind, publishedAt?: string | null, withdrawnAt?: string | null, createdAt: string, updatedAt: string } };

export type DeleteAssociationLearningContentMutationVariables = Types.Exact<{
  input: Types.AssociationLearningContentIdInput;
}>;


export type DeleteAssociationLearningContentMutation = { __typename?: 'Mutation', deleteAssociationLearningContent: { __typename?: 'AssociationActionResponse', code: string, success: boolean, message: string } };

export type AssociationRequirementOptionsQueryVariables = Types.Exact<{
  pagination?: Types.InputMaybe<Types.AssociationPaginationInput>;
}>;


export type AssociationRequirementOptionsQuery = { __typename?: 'Query', associationRequirements: { __typename?: 'PaginatedAssociationRequirements', items: Array<{ __typename?: 'AssociationRequirement', id: string, name: string, status: Types.AssociationRequirementStatus }> } };

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
export const AssociationCategoryProgressFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment AssociationCategoryProgressFields on AssociationCategoryProgress {
  id
  name
  percent
  requiredCredits
  completedCredits
}
    `, {"fragmentName":"AssociationCategoryProgressFields"}) as unknown as TypedDocumentString<AssociationCategoryProgressFieldsFragment, unknown>;
export const AssociationAssignmentProgressFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment AssociationAssignmentProgressFields on AssociationAssignmentProgress {
  id
  requirementId
  requirementName
  creditType
  evidencePolicy
  requiredCredits
  completedCredits
  percent
  band
  cycleStart
  cycleEnd
  dueDate
  daysRemaining
  awaitingReviewCount
  isMissingEvidence
  computedAt
  categories {
    ...AssociationCategoryProgressFields
  }
}
    fragment AssociationCategoryProgressFields on AssociationCategoryProgress {
  id
  name
  percent
  requiredCredits
  completedCredits
}`, {"fragmentName":"AssociationAssignmentProgressFields"}) as unknown as TypedDocumentString<AssociationAssignmentProgressFieldsFragment, unknown>;
export const AssociationEvidenceFileFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment AssociationEvidenceFileFields on AssociationEvidenceFile {
  id
  fileName
  mimeType
  sizeBytes
}
    `, {"fragmentName":"AssociationEvidenceFileFields"}) as unknown as TypedDocumentString<AssociationEvidenceFileFieldsFragment, unknown>;
export const AssociationMemberActivityFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment AssociationMemberActivityFields on AssociationMemberActivity {
  id
  memberId
  title
  source
  category
  creditType
  credits
  date
  state
  isLate
  canReview
  hasEvidence
  evidenceNote
  evidenceUrl
  reviewNote
  files {
    ...AssociationEvidenceFileFields
  }
  requirements {
    id
    name
    canReview
    creditedAmount
  }
}
    fragment AssociationEvidenceFileFields on AssociationEvidenceFile {
  id
  fileName
  mimeType
  sizeBytes
}`, {"fragmentName":"AssociationMemberActivityFields"}) as unknown as TypedDocumentString<AssociationMemberActivityFieldsFragment, unknown>;
export const AssociationLearningContentFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment AssociationLearningContentFields on AssociationLearningContent {
  id
  title
  isExternal
  isAvailable
  contentType
  contentId
  provider
  imageUrl
  externalUrl
  description
  category
  indicativeCredits
  requirementId
  requirementName
  groupId
  groupTitle
  status
  audienceKind
  publishedAt
  withdrawnAt
  createdAt
  updatedAt
}
    `, {"fragmentName":"AssociationLearningContentFields"}) as unknown as TypedDocumentString<AssociationLearningContentFieldsFragment, unknown>;
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
export const AssociationMemberProfileDocument = /*#__PURE__*/ new TypedDocumentString(`
    query AssociationMemberProfile($memberId: ID!) {
  associationMemberProfile(memberId: $memberId) {
    isMissingEvidence
    member {
      ...AssociationMemberFields
    }
    summary {
      percent
      band
      creditsRequired
      creditsCompleted
      creditsRemaining
      awaitingReviewCount
      nearestDueDate
      nearestDueDays
      nearestRequirementId
      nearestRequirementName
      pacePercent
    }
    assignments {
      ...AssociationAssignmentProgressFields
    }
    cumulative {
      date
      credits
      requiredCredits
    }
    certificates {
      id
      memberId
      title
      issuer
      issuedAt
      validUntil
      status
      creditsEarned
      files {
        ...AssociationEvidenceFileFields
      }
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
}
fragment AssociationCategoryProgressFields on AssociationCategoryProgress {
  id
  name
  percent
  requiredCredits
  completedCredits
}
fragment AssociationAssignmentProgressFields on AssociationAssignmentProgress {
  id
  requirementId
  requirementName
  creditType
  evidencePolicy
  requiredCredits
  completedCredits
  percent
  band
  cycleStart
  cycleEnd
  dueDate
  daysRemaining
  awaitingReviewCount
  isMissingEvidence
  computedAt
  categories {
    ...AssociationCategoryProgressFields
  }
}
fragment AssociationEvidenceFileFields on AssociationEvidenceFile {
  id
  fileName
  mimeType
  sizeBytes
}`) as unknown as TypedDocumentString<AssociationMemberProfileQuery, AssociationMemberProfileQueryVariables>;
export const AssociationMemberActivitiesDocument = /*#__PURE__*/ new TypedDocumentString(`
    query AssociationMemberActivities($memberId: ID!, $filter: AssociationMemberActivityFilterInput, $pagination: AssociationPaginationInput) {
  associationMemberActivities(
    memberId: $memberId
    filter: $filter
    pagination: $pagination
  ) {
    totalCount
    counts {
      counted
      rejected
      awaitingReview
    }
    pageInfo {
      hasNextPage
      nextCursor
    }
    items {
      ...AssociationMemberActivityFields
    }
  }
}
    fragment AssociationEvidenceFileFields on AssociationEvidenceFile {
  id
  fileName
  mimeType
  sizeBytes
}
fragment AssociationMemberActivityFields on AssociationMemberActivity {
  id
  memberId
  title
  source
  category
  creditType
  credits
  date
  state
  isLate
  canReview
  hasEvidence
  evidenceNote
  evidenceUrl
  reviewNote
  files {
    ...AssociationEvidenceFileFields
  }
  requirements {
    id
    name
    canReview
    creditedAmount
  }
}`) as unknown as TypedDocumentString<AssociationMemberActivitiesQuery, AssociationMemberActivitiesQueryVariables>;
export const AssociationMemberRequirementOptionsDocument = /*#__PURE__*/ new TypedDocumentString(`
    query AssociationMemberRequirementOptions($memberId: ID!) {
  associationMemberRequirementOptions(memberId: $memberId) {
    id
    name
    deadline
    creditType
    audienceKind
    isAssigned
    isMemberManaged
    totalRequiredCredits
  }
}
    `) as unknown as TypedDocumentString<AssociationMemberRequirementOptionsQuery, AssociationMemberRequirementOptionsQueryVariables>;
export const ReviewAssociationLearningActivityDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation ReviewAssociationLearningActivity($input: ReviewAssociationLearningActivityInput!) {
  reviewAssociationLearningActivity(input: $input) {
    approved
    memberId
    activityId
    requirementId
  }
}
    `) as unknown as TypedDocumentString<ReviewAssociationLearningActivityMutation, ReviewAssociationLearningActivityMutationVariables>;
export const SetAssociationMemberRequirementsDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation SetAssociationMemberRequirements($input: SetAssociationMemberRequirementsInput!) {
  setAssociationMemberRequirements(input: $input) {
    memberId
    added
    removed
  }
}
    `) as unknown as TypedDocumentString<SetAssociationMemberRequirementsMutation, SetAssociationMemberRequirementsMutationVariables>;
export const AssociationLearningContentsDocument = /*#__PURE__*/ new TypedDocumentString(`
    query AssociationLearningContents($filter: AssociationLearningContentFilterInput, $pagination: AssociationPaginationInput) {
  associationLearningContents(filter: $filter, pagination: $pagination) {
    totalCount
    pageInfo {
      hasNextPage
      nextCursor
    }
    items {
      ...AssociationLearningContentFields
    }
  }
}
    fragment AssociationLearningContentFields on AssociationLearningContent {
  id
  title
  isExternal
  isAvailable
  contentType
  contentId
  provider
  imageUrl
  externalUrl
  description
  category
  indicativeCredits
  requirementId
  requirementName
  groupId
  groupTitle
  status
  audienceKind
  publishedAt
  withdrawnAt
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<AssociationLearningContentsQuery, AssociationLearningContentsQueryVariables>;
export const AssociationLearningContentDocument = /*#__PURE__*/ new TypedDocumentString(`
    query AssociationLearningContent($learningContentId: ID!) {
  associationLearningContent(learningContentId: $learningContentId) {
    ...AssociationLearningContentFields
    engagement {
      memberCount
      credits
    }
  }
}
    fragment AssociationLearningContentFields on AssociationLearningContent {
  id
  title
  isExternal
  isAvailable
  contentType
  contentId
  provider
  imageUrl
  externalUrl
  description
  category
  indicativeCredits
  requirementId
  requirementName
  groupId
  groupTitle
  status
  audienceKind
  publishedAt
  withdrawnAt
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<AssociationLearningContentQuery, AssociationLearningContentQueryVariables>;
export const AssociationCatalogSearchDocument = /*#__PURE__*/ new TypedDocumentString(`
    query AssociationCatalogSearch($input: AssociationCatalogSearchInput!) {
  associationCatalogSearch(input: $input) {
    contentType
    contentId
    title
    provider
    imageUrl
    isAvailable
  }
}
    `) as unknown as TypedDocumentString<AssociationCatalogSearchQuery, AssociationCatalogSearchQueryVariables>;
export const CreateAssociationLearningContentDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation CreateAssociationLearningContent($input: CreateAssociationLearningContentInput!) {
  createAssociationLearningContent(input: $input) {
    ...AssociationLearningContentFields
  }
}
    fragment AssociationLearningContentFields on AssociationLearningContent {
  id
  title
  isExternal
  isAvailable
  contentType
  contentId
  provider
  imageUrl
  externalUrl
  description
  category
  indicativeCredits
  requirementId
  requirementName
  groupId
  groupTitle
  status
  audienceKind
  publishedAt
  withdrawnAt
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<CreateAssociationLearningContentMutation, CreateAssociationLearningContentMutationVariables>;
export const UpdateAssociationLearningContentDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation UpdateAssociationLearningContent($input: UpdateAssociationLearningContentInput!) {
  updateAssociationLearningContent(input: $input) {
    ...AssociationLearningContentFields
  }
}
    fragment AssociationLearningContentFields on AssociationLearningContent {
  id
  title
  isExternal
  isAvailable
  contentType
  contentId
  provider
  imageUrl
  externalUrl
  description
  category
  indicativeCredits
  requirementId
  requirementName
  groupId
  groupTitle
  status
  audienceKind
  publishedAt
  withdrawnAt
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<UpdateAssociationLearningContentMutation, UpdateAssociationLearningContentMutationVariables>;
export const PublishAssociationLearningContentDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation PublishAssociationLearningContent($input: PublishAssociationLearningContentInput!) {
  publishAssociationLearningContent(input: $input) {
    ...AssociationLearningContentFields
  }
}
    fragment AssociationLearningContentFields on AssociationLearningContent {
  id
  title
  isExternal
  isAvailable
  contentType
  contentId
  provider
  imageUrl
  externalUrl
  description
  category
  indicativeCredits
  requirementId
  requirementName
  groupId
  groupTitle
  status
  audienceKind
  publishedAt
  withdrawnAt
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<PublishAssociationLearningContentMutation, PublishAssociationLearningContentMutationVariables>;
export const WithdrawAssociationLearningContentDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation WithdrawAssociationLearningContent($input: AssociationLearningContentIdInput!) {
  withdrawAssociationLearningContent(input: $input) {
    ...AssociationLearningContentFields
  }
}
    fragment AssociationLearningContentFields on AssociationLearningContent {
  id
  title
  isExternal
  isAvailable
  contentType
  contentId
  provider
  imageUrl
  externalUrl
  description
  category
  indicativeCredits
  requirementId
  requirementName
  groupId
  groupTitle
  status
  audienceKind
  publishedAt
  withdrawnAt
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<WithdrawAssociationLearningContentMutation, WithdrawAssociationLearningContentMutationVariables>;
export const DeleteAssociationLearningContentDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation DeleteAssociationLearningContent($input: AssociationLearningContentIdInput!) {
  deleteAssociationLearningContent(input: $input) {
    code
    success
    message
  }
}
    `) as unknown as TypedDocumentString<DeleteAssociationLearningContentMutation, DeleteAssociationLearningContentMutationVariables>;
export const AssociationRequirementOptionsDocument = /*#__PURE__*/ new TypedDocumentString(`
    query AssociationRequirementOptions($pagination: AssociationPaginationInput) {
  associationRequirements(pagination: $pagination) {
    items {
      id
      name
      status
    }
  }
}
    `) as unknown as TypedDocumentString<AssociationRequirementOptionsQuery, AssociationRequirementOptionsQueryVariables>;