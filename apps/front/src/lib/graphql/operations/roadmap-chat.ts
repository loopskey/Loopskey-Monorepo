import * as Types from "@/lib/graphql/base";
import { TypedDocumentString } from "@/lib/graphql/base";
export type RoadmapWidgetFieldsFragment = { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string }> };

export type RoadmapChatMessageFieldsFragment = { __typename?: 'RoadmapChatMessage', id: string, role: Types.RoadmapChatRole, content: string, stepKey: Types.RoadmapDraftStep, createdAt: string, widget?: { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string }> } | null };

export type RoadmapCpdPlanCategoryFieldsFragment = { __typename?: 'CpdPlanCategory', id: string, name: string, targetCredits: number, completedCredits: number, order: number };

export type RoadmapCpdPlanFieldsFragment = { __typename?: 'CpdPlan', id: string, certificationId?: string | null, certificationName: string, organization: string, reportingStart: string, reportingEnd: string, totalRequiredCredits: number, evidenceTypes: Array<Types.CpdEvidenceType>, evidenceOtherNote?: string | null, reportRecipientType: Types.CpdReportRecipientType, reportRecipientLabel?: string | null, categories: Array<{ __typename?: 'CpdPlanCategory', id: string, name: string, targetCredits: number, completedCredits: number, order: number }> };

export type ProfessionalRoadmapDraftFieldsFragment = { __typename?: 'ProfessionalRoadmapDraft', id: string, status: Types.RoadmapDraftStatus, currentStep: Types.RoadmapDraftStep, isComplete: boolean, needsClarification: boolean, wasRefused: boolean, failureReason?: string | null, completedFieldCount: number, requiredFieldCount: number, remainingFields: Array<Types.RoadmapDraftStep>, updatedAt: string, goal?: string | null, targetRole?: string | null, goalReason?: string | null, context?: string | null, targetDate?: string | null, skillLevel?: Types.SkillLevel | null, timeCommitment?: Types.LearningTimeCommitment | null, budgetPreference?: Types.LearningBudgetPreference | null, subjects: Array<string>, preferredFormats: Array<Types.LearningFormat>, preferredContentTypes: Array<Types.ContentType>, preferredDeliveryFormats: Array<Types.DeliveryFormat>, cpdEnabled: boolean, certificationId?: string | null, certificationName?: string | null, requiredCredits?: number | null, completedCredits?: number | null, cpdPlan?: { __typename?: 'CpdPlan', id: string, certificationId?: string | null, certificationName: string, organization: string, reportingStart: string, reportingEnd: string, totalRequiredCredits: number, evidenceTypes: Array<Types.CpdEvidenceType>, evidenceOtherNote?: string | null, reportRecipientType: Types.CpdReportRecipientType, reportRecipientLabel?: string | null, categories: Array<{ __typename?: 'CpdPlanCategory', id: string, name: string, targetCredits: number, completedCredits: number, order: number }> } | null, subjectOptions: Array<{ __typename?: 'RoadmapSubjectOption', id: string, label: string }>, widget?: { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string }> } | null, transcript: { __typename?: 'PaginatedRoadmapChatMessages', totalCount: number, pageInfo: { __typename?: 'ProfessionalPageInfo', hasNextPage: boolean, nextCursor?: string | null }, items: Array<{ __typename?: 'RoadmapChatMessage', id: string, role: Types.RoadmapChatRole, content: string, stepKey: Types.RoadmapDraftStep, createdAt: string, widget?: { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string }> } | null }> } };

export type ProfessionalRoadmapDraftQueryVariables = Types.Exact<{
  draftId?: Types.InputMaybe<Types.Scalars['ID']['input']>;
  transcript?: Types.InputMaybe<Types.ProfessionalPaginationInput>;
}>;


export type ProfessionalRoadmapDraftQuery = { __typename?: 'Query', professionalRoadmapDraft?: { __typename?: 'ProfessionalRoadmapDraft', id: string, status: Types.RoadmapDraftStatus, currentStep: Types.RoadmapDraftStep, isComplete: boolean, needsClarification: boolean, wasRefused: boolean, failureReason?: string | null, completedFieldCount: number, requiredFieldCount: number, remainingFields: Array<Types.RoadmapDraftStep>, updatedAt: string, goal?: string | null, targetRole?: string | null, goalReason?: string | null, context?: string | null, targetDate?: string | null, skillLevel?: Types.SkillLevel | null, timeCommitment?: Types.LearningTimeCommitment | null, budgetPreference?: Types.LearningBudgetPreference | null, subjects: Array<string>, preferredFormats: Array<Types.LearningFormat>, preferredContentTypes: Array<Types.ContentType>, preferredDeliveryFormats: Array<Types.DeliveryFormat>, cpdEnabled: boolean, certificationId?: string | null, certificationName?: string | null, requiredCredits?: number | null, completedCredits?: number | null, cpdPlan?: { __typename?: 'CpdPlan', id: string, certificationId?: string | null, certificationName: string, organization: string, reportingStart: string, reportingEnd: string, totalRequiredCredits: number, evidenceTypes: Array<Types.CpdEvidenceType>, evidenceOtherNote?: string | null, reportRecipientType: Types.CpdReportRecipientType, reportRecipientLabel?: string | null, categories: Array<{ __typename?: 'CpdPlanCategory', id: string, name: string, targetCredits: number, completedCredits: number, order: number }> } | null, subjectOptions: Array<{ __typename?: 'RoadmapSubjectOption', id: string, label: string }>, widget?: { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string }> } | null, transcript: { __typename?: 'PaginatedRoadmapChatMessages', totalCount: number, pageInfo: { __typename?: 'ProfessionalPageInfo', hasNextPage: boolean, nextCursor?: string | null }, items: Array<{ __typename?: 'RoadmapChatMessage', id: string, role: Types.RoadmapChatRole, content: string, stepKey: Types.RoadmapDraftStep, createdAt: string, widget?: { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string }> } | null }> } } | null };

export type StartRoadmapDraftMutationVariables = Types.Exact<{ [key: string]: never; }>;


export type StartRoadmapDraftMutation = { __typename?: 'Mutation', startRoadmapDraft: { __typename?: 'ProfessionalRoadmapDraft', id: string, status: Types.RoadmapDraftStatus, currentStep: Types.RoadmapDraftStep, isComplete: boolean, needsClarification: boolean, wasRefused: boolean, failureReason?: string | null, completedFieldCount: number, requiredFieldCount: number, remainingFields: Array<Types.RoadmapDraftStep>, updatedAt: string, goal?: string | null, targetRole?: string | null, goalReason?: string | null, context?: string | null, targetDate?: string | null, skillLevel?: Types.SkillLevel | null, timeCommitment?: Types.LearningTimeCommitment | null, budgetPreference?: Types.LearningBudgetPreference | null, subjects: Array<string>, preferredFormats: Array<Types.LearningFormat>, preferredContentTypes: Array<Types.ContentType>, preferredDeliveryFormats: Array<Types.DeliveryFormat>, cpdEnabled: boolean, certificationId?: string | null, certificationName?: string | null, requiredCredits?: number | null, completedCredits?: number | null, cpdPlan?: { __typename?: 'CpdPlan', id: string, certificationId?: string | null, certificationName: string, organization: string, reportingStart: string, reportingEnd: string, totalRequiredCredits: number, evidenceTypes: Array<Types.CpdEvidenceType>, evidenceOtherNote?: string | null, reportRecipientType: Types.CpdReportRecipientType, reportRecipientLabel?: string | null, categories: Array<{ __typename?: 'CpdPlanCategory', id: string, name: string, targetCredits: number, completedCredits: number, order: number }> } | null, subjectOptions: Array<{ __typename?: 'RoadmapSubjectOption', id: string, label: string }>, widget?: { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string }> } | null, transcript: { __typename?: 'PaginatedRoadmapChatMessages', totalCount: number, pageInfo: { __typename?: 'ProfessionalPageInfo', hasNextPage: boolean, nextCursor?: string | null }, items: Array<{ __typename?: 'RoadmapChatMessage', id: string, role: Types.RoadmapChatRole, content: string, stepKey: Types.RoadmapDraftStep, createdAt: string, widget?: { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string }> } | null }> } } };

export type ResetRoadmapDraftMutationVariables = Types.Exact<{ [key: string]: never; }>;


export type ResetRoadmapDraftMutation = { __typename?: 'Mutation', resetRoadmapDraft: { __typename?: 'ProfessionalRoadmapDraft', id: string, status: Types.RoadmapDraftStatus, currentStep: Types.RoadmapDraftStep, isComplete: boolean, needsClarification: boolean, wasRefused: boolean, failureReason?: string | null, completedFieldCount: number, requiredFieldCount: number, remainingFields: Array<Types.RoadmapDraftStep>, updatedAt: string, goal?: string | null, targetRole?: string | null, goalReason?: string | null, context?: string | null, targetDate?: string | null, skillLevel?: Types.SkillLevel | null, timeCommitment?: Types.LearningTimeCommitment | null, budgetPreference?: Types.LearningBudgetPreference | null, subjects: Array<string>, preferredFormats: Array<Types.LearningFormat>, preferredContentTypes: Array<Types.ContentType>, preferredDeliveryFormats: Array<Types.DeliveryFormat>, cpdEnabled: boolean, certificationId?: string | null, certificationName?: string | null, requiredCredits?: number | null, completedCredits?: number | null, cpdPlan?: { __typename?: 'CpdPlan', id: string, certificationId?: string | null, certificationName: string, organization: string, reportingStart: string, reportingEnd: string, totalRequiredCredits: number, evidenceTypes: Array<Types.CpdEvidenceType>, evidenceOtherNote?: string | null, reportRecipientType: Types.CpdReportRecipientType, reportRecipientLabel?: string | null, categories: Array<{ __typename?: 'CpdPlanCategory', id: string, name: string, targetCredits: number, completedCredits: number, order: number }> } | null, subjectOptions: Array<{ __typename?: 'RoadmapSubjectOption', id: string, label: string }>, widget?: { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string }> } | null, transcript: { __typename?: 'PaginatedRoadmapChatMessages', totalCount: number, pageInfo: { __typename?: 'ProfessionalPageInfo', hasNextPage: boolean, nextCursor?: string | null }, items: Array<{ __typename?: 'RoadmapChatMessage', id: string, role: Types.RoadmapChatRole, content: string, stepKey: Types.RoadmapDraftStep, createdAt: string, widget?: { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string }> } | null }> } } };

export type SendRoadmapChatTurnMutationVariables = Types.Exact<{
  input: Types.RoadmapChatTurnInput;
}>;


export type SendRoadmapChatTurnMutation = { __typename?: 'Mutation', sendRoadmapChatTurn: { __typename?: 'ProfessionalRoadmapDraft', id: string, status: Types.RoadmapDraftStatus, currentStep: Types.RoadmapDraftStep, isComplete: boolean, needsClarification: boolean, wasRefused: boolean, failureReason?: string | null, completedFieldCount: number, requiredFieldCount: number, remainingFields: Array<Types.RoadmapDraftStep>, updatedAt: string, goal?: string | null, targetRole?: string | null, goalReason?: string | null, context?: string | null, targetDate?: string | null, skillLevel?: Types.SkillLevel | null, timeCommitment?: Types.LearningTimeCommitment | null, budgetPreference?: Types.LearningBudgetPreference | null, subjects: Array<string>, preferredFormats: Array<Types.LearningFormat>, preferredContentTypes: Array<Types.ContentType>, preferredDeliveryFormats: Array<Types.DeliveryFormat>, cpdEnabled: boolean, certificationId?: string | null, certificationName?: string | null, requiredCredits?: number | null, completedCredits?: number | null, cpdPlan?: { __typename?: 'CpdPlan', id: string, certificationId?: string | null, certificationName: string, organization: string, reportingStart: string, reportingEnd: string, totalRequiredCredits: number, evidenceTypes: Array<Types.CpdEvidenceType>, evidenceOtherNote?: string | null, reportRecipientType: Types.CpdReportRecipientType, reportRecipientLabel?: string | null, categories: Array<{ __typename?: 'CpdPlanCategory', id: string, name: string, targetCredits: number, completedCredits: number, order: number }> } | null, subjectOptions: Array<{ __typename?: 'RoadmapSubjectOption', id: string, label: string }>, widget?: { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string }> } | null, transcript: { __typename?: 'PaginatedRoadmapChatMessages', totalCount: number, pageInfo: { __typename?: 'ProfessionalPageInfo', hasNextPage: boolean, nextCursor?: string | null }, items: Array<{ __typename?: 'RoadmapChatMessage', id: string, role: Types.RoadmapChatRole, content: string, stepKey: Types.RoadmapDraftStep, createdAt: string, widget?: { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string }> } | null }> } } };

export type PatchRoadmapDraftMutationVariables = Types.Exact<{
  input: Types.PatchRoadmapDraftInput;
}>;


export type PatchRoadmapDraftMutation = { __typename?: 'Mutation', patchRoadmapDraft: { __typename?: 'ProfessionalRoadmapDraft', id: string, status: Types.RoadmapDraftStatus, currentStep: Types.RoadmapDraftStep, isComplete: boolean, needsClarification: boolean, wasRefused: boolean, failureReason?: string | null, completedFieldCount: number, requiredFieldCount: number, remainingFields: Array<Types.RoadmapDraftStep>, updatedAt: string, goal?: string | null, targetRole?: string | null, goalReason?: string | null, context?: string | null, targetDate?: string | null, skillLevel?: Types.SkillLevel | null, timeCommitment?: Types.LearningTimeCommitment | null, budgetPreference?: Types.LearningBudgetPreference | null, subjects: Array<string>, preferredFormats: Array<Types.LearningFormat>, preferredContentTypes: Array<Types.ContentType>, preferredDeliveryFormats: Array<Types.DeliveryFormat>, cpdEnabled: boolean, certificationId?: string | null, certificationName?: string | null, requiredCredits?: number | null, completedCredits?: number | null, cpdPlan?: { __typename?: 'CpdPlan', id: string, certificationId?: string | null, certificationName: string, organization: string, reportingStart: string, reportingEnd: string, totalRequiredCredits: number, evidenceTypes: Array<Types.CpdEvidenceType>, evidenceOtherNote?: string | null, reportRecipientType: Types.CpdReportRecipientType, reportRecipientLabel?: string | null, categories: Array<{ __typename?: 'CpdPlanCategory', id: string, name: string, targetCredits: number, completedCredits: number, order: number }> } | null, subjectOptions: Array<{ __typename?: 'RoadmapSubjectOption', id: string, label: string }>, widget?: { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string }> } | null, transcript: { __typename?: 'PaginatedRoadmapChatMessages', totalCount: number, pageInfo: { __typename?: 'ProfessionalPageInfo', hasNextPage: boolean, nextCursor?: string | null }, items: Array<{ __typename?: 'RoadmapChatMessage', id: string, role: Types.RoadmapChatRole, content: string, stepKey: Types.RoadmapDraftStep, createdAt: string, widget?: { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string }> } | null }> } } };

export type PatchRoadmapCpdSetupMutationVariables = Types.Exact<{
  input: Types.PatchRoadmapCpdSetupInput;
}>;


export type PatchRoadmapCpdSetupMutation = { __typename?: 'Mutation', patchRoadmapCpdSetup: { __typename?: 'ProfessionalRoadmapDraft', id: string, status: Types.RoadmapDraftStatus, currentStep: Types.RoadmapDraftStep, isComplete: boolean, needsClarification: boolean, wasRefused: boolean, failureReason?: string | null, completedFieldCount: number, requiredFieldCount: number, remainingFields: Array<Types.RoadmapDraftStep>, updatedAt: string, goal?: string | null, targetRole?: string | null, goalReason?: string | null, context?: string | null, targetDate?: string | null, skillLevel?: Types.SkillLevel | null, timeCommitment?: Types.LearningTimeCommitment | null, budgetPreference?: Types.LearningBudgetPreference | null, subjects: Array<string>, preferredFormats: Array<Types.LearningFormat>, preferredContentTypes: Array<Types.ContentType>, preferredDeliveryFormats: Array<Types.DeliveryFormat>, cpdEnabled: boolean, certificationId?: string | null, certificationName?: string | null, requiredCredits?: number | null, completedCredits?: number | null, cpdPlan?: { __typename?: 'CpdPlan', id: string, certificationId?: string | null, certificationName: string, organization: string, reportingStart: string, reportingEnd: string, totalRequiredCredits: number, evidenceTypes: Array<Types.CpdEvidenceType>, evidenceOtherNote?: string | null, reportRecipientType: Types.CpdReportRecipientType, reportRecipientLabel?: string | null, categories: Array<{ __typename?: 'CpdPlanCategory', id: string, name: string, targetCredits: number, completedCredits: number, order: number }> } | null, subjectOptions: Array<{ __typename?: 'RoadmapSubjectOption', id: string, label: string }>, widget?: { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string }> } | null, transcript: { __typename?: 'PaginatedRoadmapChatMessages', totalCount: number, pageInfo: { __typename?: 'ProfessionalPageInfo', hasNextPage: boolean, nextCursor?: string | null }, items: Array<{ __typename?: 'RoadmapChatMessage', id: string, role: Types.RoadmapChatRole, content: string, stepKey: Types.RoadmapDraftStep, createdAt: string, widget?: { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string }> } | null }> } } };

export type RequestRoadmapGenerationMutationVariables = Types.Exact<{
  draftId: Types.Scalars['ID']['input'];
}>;


export type RequestRoadmapGenerationMutation = { __typename?: 'Mutation', requestRoadmapGeneration: { __typename?: 'ProfessionalRoadmapDraft', id: string, status: Types.RoadmapDraftStatus, currentStep: Types.RoadmapDraftStep, isComplete: boolean, needsClarification: boolean, wasRefused: boolean, failureReason?: string | null, completedFieldCount: number, requiredFieldCount: number, remainingFields: Array<Types.RoadmapDraftStep>, updatedAt: string, goal?: string | null, targetRole?: string | null, goalReason?: string | null, context?: string | null, targetDate?: string | null, skillLevel?: Types.SkillLevel | null, timeCommitment?: Types.LearningTimeCommitment | null, budgetPreference?: Types.LearningBudgetPreference | null, subjects: Array<string>, preferredFormats: Array<Types.LearningFormat>, preferredContentTypes: Array<Types.ContentType>, preferredDeliveryFormats: Array<Types.DeliveryFormat>, cpdEnabled: boolean, certificationId?: string | null, certificationName?: string | null, requiredCredits?: number | null, completedCredits?: number | null, cpdPlan?: { __typename?: 'CpdPlan', id: string, certificationId?: string | null, certificationName: string, organization: string, reportingStart: string, reportingEnd: string, totalRequiredCredits: number, evidenceTypes: Array<Types.CpdEvidenceType>, evidenceOtherNote?: string | null, reportRecipientType: Types.CpdReportRecipientType, reportRecipientLabel?: string | null, categories: Array<{ __typename?: 'CpdPlanCategory', id: string, name: string, targetCredits: number, completedCredits: number, order: number }> } | null, subjectOptions: Array<{ __typename?: 'RoadmapSubjectOption', id: string, label: string }>, widget?: { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string }> } | null, transcript: { __typename?: 'PaginatedRoadmapChatMessages', totalCount: number, pageInfo: { __typename?: 'ProfessionalPageInfo', hasNextPage: boolean, nextCursor?: string | null }, items: Array<{ __typename?: 'RoadmapChatMessage', id: string, role: Types.RoadmapChatRole, content: string, stepKey: Types.RoadmapDraftStep, createdAt: string, widget?: { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string }> } | null }> } } };

export const RoadmapCpdPlanCategoryFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment RoadmapCpdPlanCategoryFields on CpdPlanCategory {
  id
  name
  targetCredits
  completedCredits
  order
}
    `, {"fragmentName":"RoadmapCpdPlanCategoryFields"}) as unknown as TypedDocumentString<RoadmapCpdPlanCategoryFieldsFragment, unknown>;
export const RoadmapCpdPlanFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment RoadmapCpdPlanFields on CpdPlan {
  id
  certificationId
  certificationName
  organization
  reportingStart
  reportingEnd
  totalRequiredCredits
  evidenceTypes
  evidenceOtherNote
  reportRecipientType
  reportRecipientLabel
  categories {
    ...RoadmapCpdPlanCategoryFields
  }
}
    fragment RoadmapCpdPlanCategoryFields on CpdPlanCategory {
  id
  name
  targetCredits
  completedCredits
  order
}`, {"fragmentName":"RoadmapCpdPlanFields"}) as unknown as TypedDocumentString<RoadmapCpdPlanFieldsFragment, unknown>;
export const RoadmapWidgetFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment RoadmapWidgetFields on RoadmapWidget {
  type
  field
  maxSelections
  options {
    value
    label
  }
}
    `, {"fragmentName":"RoadmapWidgetFields"}) as unknown as TypedDocumentString<RoadmapWidgetFieldsFragment, unknown>;
export const RoadmapChatMessageFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment RoadmapChatMessageFields on RoadmapChatMessage {
  id
  role
  content
  stepKey
  createdAt
  widget {
    ...RoadmapWidgetFields
  }
}
    fragment RoadmapWidgetFields on RoadmapWidget {
  type
  field
  maxSelections
  options {
    value
    label
  }
}`, {"fragmentName":"RoadmapChatMessageFields"}) as unknown as TypedDocumentString<RoadmapChatMessageFieldsFragment, unknown>;
export const ProfessionalRoadmapDraftFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment ProfessionalRoadmapDraftFields on ProfessionalRoadmapDraft {
  id
  status
  currentStep
  isComplete
  needsClarification
  wasRefused
  failureReason
  completedFieldCount
  requiredFieldCount
  remainingFields
  updatedAt
  goal
  targetRole
  goalReason
  context
  targetDate
  skillLevel
  timeCommitment
  budgetPreference
  subjects
  preferredFormats
  preferredContentTypes
  preferredDeliveryFormats
  cpdEnabled
  certificationId
  certificationName
  requiredCredits
  completedCredits
  cpdPlan {
    ...RoadmapCpdPlanFields
  }
  subjectOptions {
    id
    label
  }
  widget {
    ...RoadmapWidgetFields
  }
  transcript {
    totalCount
    pageInfo {
      hasNextPage
      nextCursor
    }
    items {
      ...RoadmapChatMessageFields
    }
  }
}
    fragment RoadmapWidgetFields on RoadmapWidget {
  type
  field
  maxSelections
  options {
    value
    label
  }
}
fragment RoadmapChatMessageFields on RoadmapChatMessage {
  id
  role
  content
  stepKey
  createdAt
  widget {
    ...RoadmapWidgetFields
  }
}
fragment RoadmapCpdPlanCategoryFields on CpdPlanCategory {
  id
  name
  targetCredits
  completedCredits
  order
}
fragment RoadmapCpdPlanFields on CpdPlan {
  id
  certificationId
  certificationName
  organization
  reportingStart
  reportingEnd
  totalRequiredCredits
  evidenceTypes
  evidenceOtherNote
  reportRecipientType
  reportRecipientLabel
  categories {
    ...RoadmapCpdPlanCategoryFields
  }
}`, {"fragmentName":"ProfessionalRoadmapDraftFields"}) as unknown as TypedDocumentString<ProfessionalRoadmapDraftFieldsFragment, unknown>;
export const ProfessionalRoadmapDraftDocument = /*#__PURE__*/ new TypedDocumentString(`
    query ProfessionalRoadmapDraft($draftId: ID, $transcript: ProfessionalPaginationInput) {
  professionalRoadmapDraft(draftId: $draftId, transcript: $transcript) {
    ...ProfessionalRoadmapDraftFields
  }
}
    fragment RoadmapWidgetFields on RoadmapWidget {
  type
  field
  maxSelections
  options {
    value
    label
  }
}
fragment RoadmapChatMessageFields on RoadmapChatMessage {
  id
  role
  content
  stepKey
  createdAt
  widget {
    ...RoadmapWidgetFields
  }
}
fragment RoadmapCpdPlanCategoryFields on CpdPlanCategory {
  id
  name
  targetCredits
  completedCredits
  order
}
fragment RoadmapCpdPlanFields on CpdPlan {
  id
  certificationId
  certificationName
  organization
  reportingStart
  reportingEnd
  totalRequiredCredits
  evidenceTypes
  evidenceOtherNote
  reportRecipientType
  reportRecipientLabel
  categories {
    ...RoadmapCpdPlanCategoryFields
  }
}
fragment ProfessionalRoadmapDraftFields on ProfessionalRoadmapDraft {
  id
  status
  currentStep
  isComplete
  needsClarification
  wasRefused
  failureReason
  completedFieldCount
  requiredFieldCount
  remainingFields
  updatedAt
  goal
  targetRole
  goalReason
  context
  targetDate
  skillLevel
  timeCommitment
  budgetPreference
  subjects
  preferredFormats
  preferredContentTypes
  preferredDeliveryFormats
  cpdEnabled
  certificationId
  certificationName
  requiredCredits
  completedCredits
  cpdPlan {
    ...RoadmapCpdPlanFields
  }
  subjectOptions {
    id
    label
  }
  widget {
    ...RoadmapWidgetFields
  }
  transcript {
    totalCount
    pageInfo {
      hasNextPage
      nextCursor
    }
    items {
      ...RoadmapChatMessageFields
    }
  }
}`) as unknown as TypedDocumentString<ProfessionalRoadmapDraftQuery, ProfessionalRoadmapDraftQueryVariables>;
export const StartRoadmapDraftDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation StartRoadmapDraft {
  startRoadmapDraft {
    ...ProfessionalRoadmapDraftFields
  }
}
    fragment RoadmapWidgetFields on RoadmapWidget {
  type
  field
  maxSelections
  options {
    value
    label
  }
}
fragment RoadmapChatMessageFields on RoadmapChatMessage {
  id
  role
  content
  stepKey
  createdAt
  widget {
    ...RoadmapWidgetFields
  }
}
fragment RoadmapCpdPlanCategoryFields on CpdPlanCategory {
  id
  name
  targetCredits
  completedCredits
  order
}
fragment RoadmapCpdPlanFields on CpdPlan {
  id
  certificationId
  certificationName
  organization
  reportingStart
  reportingEnd
  totalRequiredCredits
  evidenceTypes
  evidenceOtherNote
  reportRecipientType
  reportRecipientLabel
  categories {
    ...RoadmapCpdPlanCategoryFields
  }
}
fragment ProfessionalRoadmapDraftFields on ProfessionalRoadmapDraft {
  id
  status
  currentStep
  isComplete
  needsClarification
  wasRefused
  failureReason
  completedFieldCount
  requiredFieldCount
  remainingFields
  updatedAt
  goal
  targetRole
  goalReason
  context
  targetDate
  skillLevel
  timeCommitment
  budgetPreference
  subjects
  preferredFormats
  preferredContentTypes
  preferredDeliveryFormats
  cpdEnabled
  certificationId
  certificationName
  requiredCredits
  completedCredits
  cpdPlan {
    ...RoadmapCpdPlanFields
  }
  subjectOptions {
    id
    label
  }
  widget {
    ...RoadmapWidgetFields
  }
  transcript {
    totalCount
    pageInfo {
      hasNextPage
      nextCursor
    }
    items {
      ...RoadmapChatMessageFields
    }
  }
}`) as unknown as TypedDocumentString<StartRoadmapDraftMutation, StartRoadmapDraftMutationVariables>;
export const ResetRoadmapDraftDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation ResetRoadmapDraft {
  resetRoadmapDraft {
    ...ProfessionalRoadmapDraftFields
  }
}
    fragment RoadmapWidgetFields on RoadmapWidget {
  type
  field
  maxSelections
  options {
    value
    label
  }
}
fragment RoadmapChatMessageFields on RoadmapChatMessage {
  id
  role
  content
  stepKey
  createdAt
  widget {
    ...RoadmapWidgetFields
  }
}
fragment RoadmapCpdPlanCategoryFields on CpdPlanCategory {
  id
  name
  targetCredits
  completedCredits
  order
}
fragment RoadmapCpdPlanFields on CpdPlan {
  id
  certificationId
  certificationName
  organization
  reportingStart
  reportingEnd
  totalRequiredCredits
  evidenceTypes
  evidenceOtherNote
  reportRecipientType
  reportRecipientLabel
  categories {
    ...RoadmapCpdPlanCategoryFields
  }
}
fragment ProfessionalRoadmapDraftFields on ProfessionalRoadmapDraft {
  id
  status
  currentStep
  isComplete
  needsClarification
  wasRefused
  failureReason
  completedFieldCount
  requiredFieldCount
  remainingFields
  updatedAt
  goal
  targetRole
  goalReason
  context
  targetDate
  skillLevel
  timeCommitment
  budgetPreference
  subjects
  preferredFormats
  preferredContentTypes
  preferredDeliveryFormats
  cpdEnabled
  certificationId
  certificationName
  requiredCredits
  completedCredits
  cpdPlan {
    ...RoadmapCpdPlanFields
  }
  subjectOptions {
    id
    label
  }
  widget {
    ...RoadmapWidgetFields
  }
  transcript {
    totalCount
    pageInfo {
      hasNextPage
      nextCursor
    }
    items {
      ...RoadmapChatMessageFields
    }
  }
}`) as unknown as TypedDocumentString<ResetRoadmapDraftMutation, ResetRoadmapDraftMutationVariables>;
export const SendRoadmapChatTurnDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation SendRoadmapChatTurn($input: RoadmapChatTurnInput!) {
  sendRoadmapChatTurn(input: $input) {
    ...ProfessionalRoadmapDraftFields
  }
}
    fragment RoadmapWidgetFields on RoadmapWidget {
  type
  field
  maxSelections
  options {
    value
    label
  }
}
fragment RoadmapChatMessageFields on RoadmapChatMessage {
  id
  role
  content
  stepKey
  createdAt
  widget {
    ...RoadmapWidgetFields
  }
}
fragment RoadmapCpdPlanCategoryFields on CpdPlanCategory {
  id
  name
  targetCredits
  completedCredits
  order
}
fragment RoadmapCpdPlanFields on CpdPlan {
  id
  certificationId
  certificationName
  organization
  reportingStart
  reportingEnd
  totalRequiredCredits
  evidenceTypes
  evidenceOtherNote
  reportRecipientType
  reportRecipientLabel
  categories {
    ...RoadmapCpdPlanCategoryFields
  }
}
fragment ProfessionalRoadmapDraftFields on ProfessionalRoadmapDraft {
  id
  status
  currentStep
  isComplete
  needsClarification
  wasRefused
  failureReason
  completedFieldCount
  requiredFieldCount
  remainingFields
  updatedAt
  goal
  targetRole
  goalReason
  context
  targetDate
  skillLevel
  timeCommitment
  budgetPreference
  subjects
  preferredFormats
  preferredContentTypes
  preferredDeliveryFormats
  cpdEnabled
  certificationId
  certificationName
  requiredCredits
  completedCredits
  cpdPlan {
    ...RoadmapCpdPlanFields
  }
  subjectOptions {
    id
    label
  }
  widget {
    ...RoadmapWidgetFields
  }
  transcript {
    totalCount
    pageInfo {
      hasNextPage
      nextCursor
    }
    items {
      ...RoadmapChatMessageFields
    }
  }
}`) as unknown as TypedDocumentString<SendRoadmapChatTurnMutation, SendRoadmapChatTurnMutationVariables>;
export const PatchRoadmapDraftDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation PatchRoadmapDraft($input: PatchRoadmapDraftInput!) {
  patchRoadmapDraft(input: $input) {
    ...ProfessionalRoadmapDraftFields
  }
}
    fragment RoadmapWidgetFields on RoadmapWidget {
  type
  field
  maxSelections
  options {
    value
    label
  }
}
fragment RoadmapChatMessageFields on RoadmapChatMessage {
  id
  role
  content
  stepKey
  createdAt
  widget {
    ...RoadmapWidgetFields
  }
}
fragment RoadmapCpdPlanCategoryFields on CpdPlanCategory {
  id
  name
  targetCredits
  completedCredits
  order
}
fragment RoadmapCpdPlanFields on CpdPlan {
  id
  certificationId
  certificationName
  organization
  reportingStart
  reportingEnd
  totalRequiredCredits
  evidenceTypes
  evidenceOtherNote
  reportRecipientType
  reportRecipientLabel
  categories {
    ...RoadmapCpdPlanCategoryFields
  }
}
fragment ProfessionalRoadmapDraftFields on ProfessionalRoadmapDraft {
  id
  status
  currentStep
  isComplete
  needsClarification
  wasRefused
  failureReason
  completedFieldCount
  requiredFieldCount
  remainingFields
  updatedAt
  goal
  targetRole
  goalReason
  context
  targetDate
  skillLevel
  timeCommitment
  budgetPreference
  subjects
  preferredFormats
  preferredContentTypes
  preferredDeliveryFormats
  cpdEnabled
  certificationId
  certificationName
  requiredCredits
  completedCredits
  cpdPlan {
    ...RoadmapCpdPlanFields
  }
  subjectOptions {
    id
    label
  }
  widget {
    ...RoadmapWidgetFields
  }
  transcript {
    totalCount
    pageInfo {
      hasNextPage
      nextCursor
    }
    items {
      ...RoadmapChatMessageFields
    }
  }
}`) as unknown as TypedDocumentString<PatchRoadmapDraftMutation, PatchRoadmapDraftMutationVariables>;
export const PatchRoadmapCpdSetupDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation PatchRoadmapCpdSetup($input: PatchRoadmapCpdSetupInput!) {
  patchRoadmapCpdSetup(input: $input) {
    ...ProfessionalRoadmapDraftFields
  }
}
    fragment RoadmapWidgetFields on RoadmapWidget {
  type
  field
  maxSelections
  options {
    value
    label
  }
}
fragment RoadmapChatMessageFields on RoadmapChatMessage {
  id
  role
  content
  stepKey
  createdAt
  widget {
    ...RoadmapWidgetFields
  }
}
fragment RoadmapCpdPlanCategoryFields on CpdPlanCategory {
  id
  name
  targetCredits
  completedCredits
  order
}
fragment RoadmapCpdPlanFields on CpdPlan {
  id
  certificationId
  certificationName
  organization
  reportingStart
  reportingEnd
  totalRequiredCredits
  evidenceTypes
  evidenceOtherNote
  reportRecipientType
  reportRecipientLabel
  categories {
    ...RoadmapCpdPlanCategoryFields
  }
}
fragment ProfessionalRoadmapDraftFields on ProfessionalRoadmapDraft {
  id
  status
  currentStep
  isComplete
  needsClarification
  wasRefused
  failureReason
  completedFieldCount
  requiredFieldCount
  remainingFields
  updatedAt
  goal
  targetRole
  goalReason
  context
  targetDate
  skillLevel
  timeCommitment
  budgetPreference
  subjects
  preferredFormats
  preferredContentTypes
  preferredDeliveryFormats
  cpdEnabled
  certificationId
  certificationName
  requiredCredits
  completedCredits
  cpdPlan {
    ...RoadmapCpdPlanFields
  }
  subjectOptions {
    id
    label
  }
  widget {
    ...RoadmapWidgetFields
  }
  transcript {
    totalCount
    pageInfo {
      hasNextPage
      nextCursor
    }
    items {
      ...RoadmapChatMessageFields
    }
  }
}`) as unknown as TypedDocumentString<PatchRoadmapCpdSetupMutation, PatchRoadmapCpdSetupMutationVariables>;
export const RequestRoadmapGenerationDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation RequestRoadmapGeneration($draftId: ID!) {
  requestRoadmapGeneration(draftId: $draftId) {
    ...ProfessionalRoadmapDraftFields
  }
}
    fragment RoadmapWidgetFields on RoadmapWidget {
  type
  field
  maxSelections
  options {
    value
    label
  }
}
fragment RoadmapChatMessageFields on RoadmapChatMessage {
  id
  role
  content
  stepKey
  createdAt
  widget {
    ...RoadmapWidgetFields
  }
}
fragment RoadmapCpdPlanCategoryFields on CpdPlanCategory {
  id
  name
  targetCredits
  completedCredits
  order
}
fragment RoadmapCpdPlanFields on CpdPlan {
  id
  certificationId
  certificationName
  organization
  reportingStart
  reportingEnd
  totalRequiredCredits
  evidenceTypes
  evidenceOtherNote
  reportRecipientType
  reportRecipientLabel
  categories {
    ...RoadmapCpdPlanCategoryFields
  }
}
fragment ProfessionalRoadmapDraftFields on ProfessionalRoadmapDraft {
  id
  status
  currentStep
  isComplete
  needsClarification
  wasRefused
  failureReason
  completedFieldCount
  requiredFieldCount
  remainingFields
  updatedAt
  goal
  targetRole
  goalReason
  context
  targetDate
  skillLevel
  timeCommitment
  budgetPreference
  subjects
  preferredFormats
  preferredContentTypes
  preferredDeliveryFormats
  cpdEnabled
  certificationId
  certificationName
  requiredCredits
  completedCredits
  cpdPlan {
    ...RoadmapCpdPlanFields
  }
  subjectOptions {
    id
    label
  }
  widget {
    ...RoadmapWidgetFields
  }
  transcript {
    totalCount
    pageInfo {
      hasNextPage
      nextCursor
    }
    items {
      ...RoadmapChatMessageFields
    }
  }
}`) as unknown as TypedDocumentString<RequestRoadmapGenerationMutation, RequestRoadmapGenerationMutationVariables>;