import * as Types from "@/lib/graphql/base";
import { TypedDocumentString } from "@/lib/graphql/base";
export type RoadmapWidgetOptionFieldsFragment = { __typename?: 'RoadmapWidgetOption', value: string, label: string, groupLabel?: string | null };

export type RoadmapWidgetFieldsFragment = { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string, groupLabel?: string | null }> };

export type RoadmapChatMessageFieldsFragment = { __typename?: 'RoadmapChatMessage', id: string, role: Types.RoadmapChatRole, content: string, stepKey: Types.RoadmapDraftStep, createdAt: string, widget?: { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string, groupLabel?: string | null }> } | null };

export type RoadmapCpdPlanCategoryFieldsFragment = { __typename?: 'CpdPlanCategory', id: string, name: string, targetCredits: number, completedCredits: number, order: number };

export type RoadmapCpdPlanFieldsFragment = { __typename?: 'CpdPlan', id: string, certificationId?: string | null, certificationName: string, organization: string, reportingStart: string, reportingEnd: string, totalRequiredCredits: number, evidenceTypes: Array<Types.CpdEvidenceType>, evidenceOtherNote?: string | null, reportRecipientType: Types.CpdReportRecipientType, reportRecipientLabel?: string | null, categories: Array<{ __typename?: 'CpdPlanCategory', id: string, name: string, targetCredits: number, completedCredits: number, order: number }> };

export type RoadmapGenerationFailureFieldsFragment = { __typename?: 'RoadmapGenerationFailure', code: Types.RoadmapGenerationFailureCode, recoveryActions: Array<Types.RoadmapGenerationRecoveryAction> };

export type ProfessionalRoadmapDraftFieldsFragment = { __typename?: 'ProfessionalRoadmapDraft', id: string, status: Types.RoadmapDraftStatus, currentStep: Types.RoadmapDraftStep, isComplete: boolean, needsClarification: boolean, wasRefused: boolean, completedFieldCount: number, requiredFieldCount: number, remainingFields: Array<Types.RoadmapDraftStep>, updatedAt: string, goal?: string | null, targetRole?: string | null, goalReason?: string | null, context?: string | null, targetDate?: string | null, skillLevel?: Types.SkillLevel | null, timeCommitment?: Types.LearningTimeCommitment | null, budgetPreference?: Types.LearningBudgetPreference | null, subjects: Array<string>, preferredFormats: Array<Types.LearningFormat>, preferredContentTypes: Array<Types.ContentType>, preferredDeliveryFormats: Array<Types.DeliveryFormat>, cpdEnabled: boolean, certificationId?: string | null, certificationName?: string | null, requiredCredits?: number | null, completedCredits?: number | null, failure?: { __typename?: 'RoadmapGenerationFailure', code: Types.RoadmapGenerationFailureCode, recoveryActions: Array<Types.RoadmapGenerationRecoveryAction> } | null, cpdPlan?: { __typename?: 'CpdPlan', id: string, certificationId?: string | null, certificationName: string, organization: string, reportingStart: string, reportingEnd: string, totalRequiredCredits: number, evidenceTypes: Array<Types.CpdEvidenceType>, evidenceOtherNote?: string | null, reportRecipientType: Types.CpdReportRecipientType, reportRecipientLabel?: string | null, categories: Array<{ __typename?: 'CpdPlanCategory', id: string, name: string, targetCredits: number, completedCredits: number, order: number }> } | null, subjectOptions: Array<{ __typename?: 'RoadmapSubjectOption', id: string, label: string }>, widget?: { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string, groupLabel?: string | null }> } | null, transcript: { __typename?: 'PaginatedRoadmapChatMessages', totalCount: number, pageInfo: { __typename?: 'ProfessionalPageInfo', hasNextPage: boolean, nextCursor?: string | null }, items: Array<{ __typename?: 'RoadmapChatMessage', id: string, role: Types.RoadmapChatRole, content: string, stepKey: Types.RoadmapDraftStep, createdAt: string, widget?: { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string, groupLabel?: string | null }> } | null }> } };

export type ProfessionalRoadmapDraftQueryVariables = Types.Exact<{
  draftId?: Types.InputMaybe<Types.Scalars['ID']['input']>;
  transcript?: Types.InputMaybe<Types.ProfessionalPaginationInput>;
}>;


export type ProfessionalRoadmapDraftQuery = { __typename?: 'Query', professionalRoadmapDraft?: { __typename?: 'ProfessionalRoadmapDraft', id: string, status: Types.RoadmapDraftStatus, currentStep: Types.RoadmapDraftStep, isComplete: boolean, needsClarification: boolean, wasRefused: boolean, completedFieldCount: number, requiredFieldCount: number, remainingFields: Array<Types.RoadmapDraftStep>, updatedAt: string, goal?: string | null, targetRole?: string | null, goalReason?: string | null, context?: string | null, targetDate?: string | null, skillLevel?: Types.SkillLevel | null, timeCommitment?: Types.LearningTimeCommitment | null, budgetPreference?: Types.LearningBudgetPreference | null, subjects: Array<string>, preferredFormats: Array<Types.LearningFormat>, preferredContentTypes: Array<Types.ContentType>, preferredDeliveryFormats: Array<Types.DeliveryFormat>, cpdEnabled: boolean, certificationId?: string | null, certificationName?: string | null, requiredCredits?: number | null, completedCredits?: number | null, failure?: { __typename?: 'RoadmapGenerationFailure', code: Types.RoadmapGenerationFailureCode, recoveryActions: Array<Types.RoadmapGenerationRecoveryAction> } | null, cpdPlan?: { __typename?: 'CpdPlan', id: string, certificationId?: string | null, certificationName: string, organization: string, reportingStart: string, reportingEnd: string, totalRequiredCredits: number, evidenceTypes: Array<Types.CpdEvidenceType>, evidenceOtherNote?: string | null, reportRecipientType: Types.CpdReportRecipientType, reportRecipientLabel?: string | null, categories: Array<{ __typename?: 'CpdPlanCategory', id: string, name: string, targetCredits: number, completedCredits: number, order: number }> } | null, subjectOptions: Array<{ __typename?: 'RoadmapSubjectOption', id: string, label: string }>, widget?: { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string, groupLabel?: string | null }> } | null, transcript: { __typename?: 'PaginatedRoadmapChatMessages', totalCount: number, pageInfo: { __typename?: 'ProfessionalPageInfo', hasNextPage: boolean, nextCursor?: string | null }, items: Array<{ __typename?: 'RoadmapChatMessage', id: string, role: Types.RoadmapChatRole, content: string, stepKey: Types.RoadmapDraftStep, createdAt: string, widget?: { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string, groupLabel?: string | null }> } | null }> } } | null };

export type StartRoadmapDraftMutationVariables = Types.Exact<{ [key: string]: never; }>;


export type StartRoadmapDraftMutation = { __typename?: 'Mutation', startRoadmapDraft: { __typename?: 'ProfessionalRoadmapDraft', id: string, status: Types.RoadmapDraftStatus, currentStep: Types.RoadmapDraftStep, isComplete: boolean, needsClarification: boolean, wasRefused: boolean, completedFieldCount: number, requiredFieldCount: number, remainingFields: Array<Types.RoadmapDraftStep>, updatedAt: string, goal?: string | null, targetRole?: string | null, goalReason?: string | null, context?: string | null, targetDate?: string | null, skillLevel?: Types.SkillLevel | null, timeCommitment?: Types.LearningTimeCommitment | null, budgetPreference?: Types.LearningBudgetPreference | null, subjects: Array<string>, preferredFormats: Array<Types.LearningFormat>, preferredContentTypes: Array<Types.ContentType>, preferredDeliveryFormats: Array<Types.DeliveryFormat>, cpdEnabled: boolean, certificationId?: string | null, certificationName?: string | null, requiredCredits?: number | null, completedCredits?: number | null, failure?: { __typename?: 'RoadmapGenerationFailure', code: Types.RoadmapGenerationFailureCode, recoveryActions: Array<Types.RoadmapGenerationRecoveryAction> } | null, cpdPlan?: { __typename?: 'CpdPlan', id: string, certificationId?: string | null, certificationName: string, organization: string, reportingStart: string, reportingEnd: string, totalRequiredCredits: number, evidenceTypes: Array<Types.CpdEvidenceType>, evidenceOtherNote?: string | null, reportRecipientType: Types.CpdReportRecipientType, reportRecipientLabel?: string | null, categories: Array<{ __typename?: 'CpdPlanCategory', id: string, name: string, targetCredits: number, completedCredits: number, order: number }> } | null, subjectOptions: Array<{ __typename?: 'RoadmapSubjectOption', id: string, label: string }>, widget?: { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string, groupLabel?: string | null }> } | null, transcript: { __typename?: 'PaginatedRoadmapChatMessages', totalCount: number, pageInfo: { __typename?: 'ProfessionalPageInfo', hasNextPage: boolean, nextCursor?: string | null }, items: Array<{ __typename?: 'RoadmapChatMessage', id: string, role: Types.RoadmapChatRole, content: string, stepKey: Types.RoadmapDraftStep, createdAt: string, widget?: { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string, groupLabel?: string | null }> } | null }> } } };

export type ResetRoadmapDraftMutationVariables = Types.Exact<{
  draftId?: Types.InputMaybe<Types.Scalars['ID']['input']>;
}>;


export type ResetRoadmapDraftMutation = { __typename?: 'Mutation', resetRoadmapDraft: { __typename?: 'ProfessionalRoadmapDraft', id: string, status: Types.RoadmapDraftStatus, currentStep: Types.RoadmapDraftStep, isComplete: boolean, needsClarification: boolean, wasRefused: boolean, completedFieldCount: number, requiredFieldCount: number, remainingFields: Array<Types.RoadmapDraftStep>, updatedAt: string, goal?: string | null, targetRole?: string | null, goalReason?: string | null, context?: string | null, targetDate?: string | null, skillLevel?: Types.SkillLevel | null, timeCommitment?: Types.LearningTimeCommitment | null, budgetPreference?: Types.LearningBudgetPreference | null, subjects: Array<string>, preferredFormats: Array<Types.LearningFormat>, preferredContentTypes: Array<Types.ContentType>, preferredDeliveryFormats: Array<Types.DeliveryFormat>, cpdEnabled: boolean, certificationId?: string | null, certificationName?: string | null, requiredCredits?: number | null, completedCredits?: number | null, failure?: { __typename?: 'RoadmapGenerationFailure', code: Types.RoadmapGenerationFailureCode, recoveryActions: Array<Types.RoadmapGenerationRecoveryAction> } | null, cpdPlan?: { __typename?: 'CpdPlan', id: string, certificationId?: string | null, certificationName: string, organization: string, reportingStart: string, reportingEnd: string, totalRequiredCredits: number, evidenceTypes: Array<Types.CpdEvidenceType>, evidenceOtherNote?: string | null, reportRecipientType: Types.CpdReportRecipientType, reportRecipientLabel?: string | null, categories: Array<{ __typename?: 'CpdPlanCategory', id: string, name: string, targetCredits: number, completedCredits: number, order: number }> } | null, subjectOptions: Array<{ __typename?: 'RoadmapSubjectOption', id: string, label: string }>, widget?: { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string, groupLabel?: string | null }> } | null, transcript: { __typename?: 'PaginatedRoadmapChatMessages', totalCount: number, pageInfo: { __typename?: 'ProfessionalPageInfo', hasNextPage: boolean, nextCursor?: string | null }, items: Array<{ __typename?: 'RoadmapChatMessage', id: string, role: Types.RoadmapChatRole, content: string, stepKey: Types.RoadmapDraftStep, createdAt: string, widget?: { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string, groupLabel?: string | null }> } | null }> } } };

export type ProfessionalRoadmapGenerationQueryVariables = Types.Exact<{
  draftId?: Types.InputMaybe<Types.Scalars['ID']['input']>;
}>;


export type ProfessionalRoadmapGenerationQuery = { __typename?: 'Query', professionalRoadmapGeneration?: { __typename?: 'ProfessionalRoadmapGeneration', id: string, goal?: string | null, status: Types.RoadmapDraftStatus, updatedAt: string, failure?: { __typename?: 'RoadmapGenerationFailure', code: Types.RoadmapGenerationFailureCode, recoveryActions: Array<Types.RoadmapGenerationRecoveryAction> } | null } | null };

export type SendRoadmapChatTurnMutationVariables = Types.Exact<{
  input: Types.RoadmapChatTurnInput;
}>;


export type SendRoadmapChatTurnMutation = { __typename?: 'Mutation', sendRoadmapChatTurn: { __typename?: 'ProfessionalRoadmapDraft', id: string, status: Types.RoadmapDraftStatus, currentStep: Types.RoadmapDraftStep, isComplete: boolean, needsClarification: boolean, wasRefused: boolean, completedFieldCount: number, requiredFieldCount: number, remainingFields: Array<Types.RoadmapDraftStep>, updatedAt: string, goal?: string | null, targetRole?: string | null, goalReason?: string | null, context?: string | null, targetDate?: string | null, skillLevel?: Types.SkillLevel | null, timeCommitment?: Types.LearningTimeCommitment | null, budgetPreference?: Types.LearningBudgetPreference | null, subjects: Array<string>, preferredFormats: Array<Types.LearningFormat>, preferredContentTypes: Array<Types.ContentType>, preferredDeliveryFormats: Array<Types.DeliveryFormat>, cpdEnabled: boolean, certificationId?: string | null, certificationName?: string | null, requiredCredits?: number | null, completedCredits?: number | null, failure?: { __typename?: 'RoadmapGenerationFailure', code: Types.RoadmapGenerationFailureCode, recoveryActions: Array<Types.RoadmapGenerationRecoveryAction> } | null, cpdPlan?: { __typename?: 'CpdPlan', id: string, certificationId?: string | null, certificationName: string, organization: string, reportingStart: string, reportingEnd: string, totalRequiredCredits: number, evidenceTypes: Array<Types.CpdEvidenceType>, evidenceOtherNote?: string | null, reportRecipientType: Types.CpdReportRecipientType, reportRecipientLabel?: string | null, categories: Array<{ __typename?: 'CpdPlanCategory', id: string, name: string, targetCredits: number, completedCredits: number, order: number }> } | null, subjectOptions: Array<{ __typename?: 'RoadmapSubjectOption', id: string, label: string }>, widget?: { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string, groupLabel?: string | null }> } | null, transcript: { __typename?: 'PaginatedRoadmapChatMessages', totalCount: number, pageInfo: { __typename?: 'ProfessionalPageInfo', hasNextPage: boolean, nextCursor?: string | null }, items: Array<{ __typename?: 'RoadmapChatMessage', id: string, role: Types.RoadmapChatRole, content: string, stepKey: Types.RoadmapDraftStep, createdAt: string, widget?: { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string, groupLabel?: string | null }> } | null }> } } };

export type PatchRoadmapDraftMutationVariables = Types.Exact<{
  input: Types.PatchRoadmapDraftInput;
}>;


export type PatchRoadmapDraftMutation = { __typename?: 'Mutation', patchRoadmapDraft: { __typename?: 'ProfessionalRoadmapDraft', id: string, status: Types.RoadmapDraftStatus, currentStep: Types.RoadmapDraftStep, isComplete: boolean, needsClarification: boolean, wasRefused: boolean, completedFieldCount: number, requiredFieldCount: number, remainingFields: Array<Types.RoadmapDraftStep>, updatedAt: string, goal?: string | null, targetRole?: string | null, goalReason?: string | null, context?: string | null, targetDate?: string | null, skillLevel?: Types.SkillLevel | null, timeCommitment?: Types.LearningTimeCommitment | null, budgetPreference?: Types.LearningBudgetPreference | null, subjects: Array<string>, preferredFormats: Array<Types.LearningFormat>, preferredContentTypes: Array<Types.ContentType>, preferredDeliveryFormats: Array<Types.DeliveryFormat>, cpdEnabled: boolean, certificationId?: string | null, certificationName?: string | null, requiredCredits?: number | null, completedCredits?: number | null, failure?: { __typename?: 'RoadmapGenerationFailure', code: Types.RoadmapGenerationFailureCode, recoveryActions: Array<Types.RoadmapGenerationRecoveryAction> } | null, cpdPlan?: { __typename?: 'CpdPlan', id: string, certificationId?: string | null, certificationName: string, organization: string, reportingStart: string, reportingEnd: string, totalRequiredCredits: number, evidenceTypes: Array<Types.CpdEvidenceType>, evidenceOtherNote?: string | null, reportRecipientType: Types.CpdReportRecipientType, reportRecipientLabel?: string | null, categories: Array<{ __typename?: 'CpdPlanCategory', id: string, name: string, targetCredits: number, completedCredits: number, order: number }> } | null, subjectOptions: Array<{ __typename?: 'RoadmapSubjectOption', id: string, label: string }>, widget?: { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string, groupLabel?: string | null }> } | null, transcript: { __typename?: 'PaginatedRoadmapChatMessages', totalCount: number, pageInfo: { __typename?: 'ProfessionalPageInfo', hasNextPage: boolean, nextCursor?: string | null }, items: Array<{ __typename?: 'RoadmapChatMessage', id: string, role: Types.RoadmapChatRole, content: string, stepKey: Types.RoadmapDraftStep, createdAt: string, widget?: { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string, groupLabel?: string | null }> } | null }> } } };

export type PatchRoadmapCpdSetupMutationVariables = Types.Exact<{
  input: Types.PatchRoadmapCpdSetupInput;
}>;


export type PatchRoadmapCpdSetupMutation = { __typename?: 'Mutation', patchRoadmapCpdSetup: { __typename?: 'ProfessionalRoadmapDraft', id: string, status: Types.RoadmapDraftStatus, currentStep: Types.RoadmapDraftStep, isComplete: boolean, needsClarification: boolean, wasRefused: boolean, completedFieldCount: number, requiredFieldCount: number, remainingFields: Array<Types.RoadmapDraftStep>, updatedAt: string, goal?: string | null, targetRole?: string | null, goalReason?: string | null, context?: string | null, targetDate?: string | null, skillLevel?: Types.SkillLevel | null, timeCommitment?: Types.LearningTimeCommitment | null, budgetPreference?: Types.LearningBudgetPreference | null, subjects: Array<string>, preferredFormats: Array<Types.LearningFormat>, preferredContentTypes: Array<Types.ContentType>, preferredDeliveryFormats: Array<Types.DeliveryFormat>, cpdEnabled: boolean, certificationId?: string | null, certificationName?: string | null, requiredCredits?: number | null, completedCredits?: number | null, failure?: { __typename?: 'RoadmapGenerationFailure', code: Types.RoadmapGenerationFailureCode, recoveryActions: Array<Types.RoadmapGenerationRecoveryAction> } | null, cpdPlan?: { __typename?: 'CpdPlan', id: string, certificationId?: string | null, certificationName: string, organization: string, reportingStart: string, reportingEnd: string, totalRequiredCredits: number, evidenceTypes: Array<Types.CpdEvidenceType>, evidenceOtherNote?: string | null, reportRecipientType: Types.CpdReportRecipientType, reportRecipientLabel?: string | null, categories: Array<{ __typename?: 'CpdPlanCategory', id: string, name: string, targetCredits: number, completedCredits: number, order: number }> } | null, subjectOptions: Array<{ __typename?: 'RoadmapSubjectOption', id: string, label: string }>, widget?: { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string, groupLabel?: string | null }> } | null, transcript: { __typename?: 'PaginatedRoadmapChatMessages', totalCount: number, pageInfo: { __typename?: 'ProfessionalPageInfo', hasNextPage: boolean, nextCursor?: string | null }, items: Array<{ __typename?: 'RoadmapChatMessage', id: string, role: Types.RoadmapChatRole, content: string, stepKey: Types.RoadmapDraftStep, createdAt: string, widget?: { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string, groupLabel?: string | null }> } | null }> } } };

export type RequestRoadmapGenerationMutationVariables = Types.Exact<{
  draftId: Types.Scalars['ID']['input'];
}>;


export type RequestRoadmapGenerationMutation = { __typename?: 'Mutation', requestRoadmapGeneration: { __typename?: 'ProfessionalRoadmapDraft', id: string, status: Types.RoadmapDraftStatus, currentStep: Types.RoadmapDraftStep, isComplete: boolean, needsClarification: boolean, wasRefused: boolean, completedFieldCount: number, requiredFieldCount: number, remainingFields: Array<Types.RoadmapDraftStep>, updatedAt: string, goal?: string | null, targetRole?: string | null, goalReason?: string | null, context?: string | null, targetDate?: string | null, skillLevel?: Types.SkillLevel | null, timeCommitment?: Types.LearningTimeCommitment | null, budgetPreference?: Types.LearningBudgetPreference | null, subjects: Array<string>, preferredFormats: Array<Types.LearningFormat>, preferredContentTypes: Array<Types.ContentType>, preferredDeliveryFormats: Array<Types.DeliveryFormat>, cpdEnabled: boolean, certificationId?: string | null, certificationName?: string | null, requiredCredits?: number | null, completedCredits?: number | null, failure?: { __typename?: 'RoadmapGenerationFailure', code: Types.RoadmapGenerationFailureCode, recoveryActions: Array<Types.RoadmapGenerationRecoveryAction> } | null, cpdPlan?: { __typename?: 'CpdPlan', id: string, certificationId?: string | null, certificationName: string, organization: string, reportingStart: string, reportingEnd: string, totalRequiredCredits: number, evidenceTypes: Array<Types.CpdEvidenceType>, evidenceOtherNote?: string | null, reportRecipientType: Types.CpdReportRecipientType, reportRecipientLabel?: string | null, categories: Array<{ __typename?: 'CpdPlanCategory', id: string, name: string, targetCredits: number, completedCredits: number, order: number }> } | null, subjectOptions: Array<{ __typename?: 'RoadmapSubjectOption', id: string, label: string }>, widget?: { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string, groupLabel?: string | null }> } | null, transcript: { __typename?: 'PaginatedRoadmapChatMessages', totalCount: number, pageInfo: { __typename?: 'ProfessionalPageInfo', hasNextPage: boolean, nextCursor?: string | null }, items: Array<{ __typename?: 'RoadmapChatMessage', id: string, role: Types.RoadmapChatRole, content: string, stepKey: Types.RoadmapDraftStep, createdAt: string, widget?: { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string, groupLabel?: string | null }> } | null }> } } };

export type RoadmapSuggestionOptionsQueryVariables = Types.Exact<{
  input: Types.RoadmapSuggestionOptionsInput;
}>;


export type RoadmapSuggestionOptionsQuery = { __typename?: 'Query', roadmapSuggestionOptions: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string, groupLabel?: string | null }> };

export const RoadmapGenerationFailureFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment RoadmapGenerationFailureFields on RoadmapGenerationFailure {
  code
  recoveryActions
}
    `, {"fragmentName":"RoadmapGenerationFailureFields"}) as unknown as TypedDocumentString<RoadmapGenerationFailureFieldsFragment, unknown>;
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
export const RoadmapWidgetOptionFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment RoadmapWidgetOptionFields on RoadmapWidgetOption {
  value
  label
  groupLabel
}
    `, {"fragmentName":"RoadmapWidgetOptionFields"}) as unknown as TypedDocumentString<RoadmapWidgetOptionFieldsFragment, unknown>;
export const RoadmapWidgetFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment RoadmapWidgetFields on RoadmapWidget {
  type
  field
  maxSelections
  options {
    ...RoadmapWidgetOptionFields
  }
}
    fragment RoadmapWidgetOptionFields on RoadmapWidgetOption {
  value
  label
  groupLabel
}`, {"fragmentName":"RoadmapWidgetFields"}) as unknown as TypedDocumentString<RoadmapWidgetFieldsFragment, unknown>;
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
    fragment RoadmapWidgetOptionFields on RoadmapWidgetOption {
  value
  label
  groupLabel
}
fragment RoadmapWidgetFields on RoadmapWidget {
  type
  field
  maxSelections
  options {
    ...RoadmapWidgetOptionFields
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
  failure {
    ...RoadmapGenerationFailureFields
  }
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
    fragment RoadmapWidgetOptionFields on RoadmapWidgetOption {
  value
  label
  groupLabel
}
fragment RoadmapWidgetFields on RoadmapWidget {
  type
  field
  maxSelections
  options {
    ...RoadmapWidgetOptionFields
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
fragment RoadmapGenerationFailureFields on RoadmapGenerationFailure {
  code
  recoveryActions
}`, {"fragmentName":"ProfessionalRoadmapDraftFields"}) as unknown as TypedDocumentString<ProfessionalRoadmapDraftFieldsFragment, unknown>;
export const ProfessionalRoadmapDraftDocument = /*#__PURE__*/ new TypedDocumentString(`
    query ProfessionalRoadmapDraft($draftId: ID, $transcript: ProfessionalPaginationInput) {
  professionalRoadmapDraft(draftId: $draftId, transcript: $transcript) {
    ...ProfessionalRoadmapDraftFields
  }
}
    fragment RoadmapWidgetOptionFields on RoadmapWidgetOption {
  value
  label
  groupLabel
}
fragment RoadmapWidgetFields on RoadmapWidget {
  type
  field
  maxSelections
  options {
    ...RoadmapWidgetOptionFields
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
fragment RoadmapGenerationFailureFields on RoadmapGenerationFailure {
  code
  recoveryActions
}
fragment ProfessionalRoadmapDraftFields on ProfessionalRoadmapDraft {
  id
  status
  currentStep
  isComplete
  needsClarification
  wasRefused
  failure {
    ...RoadmapGenerationFailureFields
  }
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
    fragment RoadmapWidgetOptionFields on RoadmapWidgetOption {
  value
  label
  groupLabel
}
fragment RoadmapWidgetFields on RoadmapWidget {
  type
  field
  maxSelections
  options {
    ...RoadmapWidgetOptionFields
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
fragment RoadmapGenerationFailureFields on RoadmapGenerationFailure {
  code
  recoveryActions
}
fragment ProfessionalRoadmapDraftFields on ProfessionalRoadmapDraft {
  id
  status
  currentStep
  isComplete
  needsClarification
  wasRefused
  failure {
    ...RoadmapGenerationFailureFields
  }
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
    mutation ResetRoadmapDraft($draftId: ID) {
  resetRoadmapDraft(draftId: $draftId) {
    ...ProfessionalRoadmapDraftFields
  }
}
    fragment RoadmapWidgetOptionFields on RoadmapWidgetOption {
  value
  label
  groupLabel
}
fragment RoadmapWidgetFields on RoadmapWidget {
  type
  field
  maxSelections
  options {
    ...RoadmapWidgetOptionFields
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
fragment RoadmapGenerationFailureFields on RoadmapGenerationFailure {
  code
  recoveryActions
}
fragment ProfessionalRoadmapDraftFields on ProfessionalRoadmapDraft {
  id
  status
  currentStep
  isComplete
  needsClarification
  wasRefused
  failure {
    ...RoadmapGenerationFailureFields
  }
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
export const ProfessionalRoadmapGenerationDocument = /*#__PURE__*/ new TypedDocumentString(`
    query ProfessionalRoadmapGeneration($draftId: ID) {
  professionalRoadmapGeneration(draftId: $draftId) {
    id
    goal
    status
    updatedAt
    failure {
      ...RoadmapGenerationFailureFields
    }
  }
}
    fragment RoadmapGenerationFailureFields on RoadmapGenerationFailure {
  code
  recoveryActions
}`) as unknown as TypedDocumentString<ProfessionalRoadmapGenerationQuery, ProfessionalRoadmapGenerationQueryVariables>;
export const SendRoadmapChatTurnDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation SendRoadmapChatTurn($input: RoadmapChatTurnInput!) {
  sendRoadmapChatTurn(input: $input) {
    ...ProfessionalRoadmapDraftFields
  }
}
    fragment RoadmapWidgetOptionFields on RoadmapWidgetOption {
  value
  label
  groupLabel
}
fragment RoadmapWidgetFields on RoadmapWidget {
  type
  field
  maxSelections
  options {
    ...RoadmapWidgetOptionFields
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
fragment RoadmapGenerationFailureFields on RoadmapGenerationFailure {
  code
  recoveryActions
}
fragment ProfessionalRoadmapDraftFields on ProfessionalRoadmapDraft {
  id
  status
  currentStep
  isComplete
  needsClarification
  wasRefused
  failure {
    ...RoadmapGenerationFailureFields
  }
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
    fragment RoadmapWidgetOptionFields on RoadmapWidgetOption {
  value
  label
  groupLabel
}
fragment RoadmapWidgetFields on RoadmapWidget {
  type
  field
  maxSelections
  options {
    ...RoadmapWidgetOptionFields
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
fragment RoadmapGenerationFailureFields on RoadmapGenerationFailure {
  code
  recoveryActions
}
fragment ProfessionalRoadmapDraftFields on ProfessionalRoadmapDraft {
  id
  status
  currentStep
  isComplete
  needsClarification
  wasRefused
  failure {
    ...RoadmapGenerationFailureFields
  }
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
    fragment RoadmapWidgetOptionFields on RoadmapWidgetOption {
  value
  label
  groupLabel
}
fragment RoadmapWidgetFields on RoadmapWidget {
  type
  field
  maxSelections
  options {
    ...RoadmapWidgetOptionFields
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
fragment RoadmapGenerationFailureFields on RoadmapGenerationFailure {
  code
  recoveryActions
}
fragment ProfessionalRoadmapDraftFields on ProfessionalRoadmapDraft {
  id
  status
  currentStep
  isComplete
  needsClarification
  wasRefused
  failure {
    ...RoadmapGenerationFailureFields
  }
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
    fragment RoadmapWidgetOptionFields on RoadmapWidgetOption {
  value
  label
  groupLabel
}
fragment RoadmapWidgetFields on RoadmapWidget {
  type
  field
  maxSelections
  options {
    ...RoadmapWidgetOptionFields
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
fragment RoadmapGenerationFailureFields on RoadmapGenerationFailure {
  code
  recoveryActions
}
fragment ProfessionalRoadmapDraftFields on ProfessionalRoadmapDraft {
  id
  status
  currentStep
  isComplete
  needsClarification
  wasRefused
  failure {
    ...RoadmapGenerationFailureFields
  }
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
export const RoadmapSuggestionOptionsDocument = /*#__PURE__*/ new TypedDocumentString(`
    query RoadmapSuggestionOptions($input: RoadmapSuggestionOptionsInput!) {
  roadmapSuggestionOptions(input: $input) {
    ...RoadmapWidgetOptionFields
  }
}
    fragment RoadmapWidgetOptionFields on RoadmapWidgetOption {
  value
  label
  groupLabel
}`) as unknown as TypedDocumentString<RoadmapSuggestionOptionsQuery, RoadmapSuggestionOptionsQueryVariables>;