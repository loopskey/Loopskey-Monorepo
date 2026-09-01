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