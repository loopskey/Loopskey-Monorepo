import * as Types from "@/lib/graphql/base";
import { TypedDocumentString } from "@/lib/graphql/base";
export type CertificationCategoryFieldsFragment = { __typename?: 'CertificationCategory', id: string, name: string, requiredCredits: number, order: number };

export type CertificationFieldsFragment = { __typename?: 'Certification', id: string, name: string, abbreviation: string, organization: string, organizationAbbr?: string | null, association?: string | null, creditType: Types.CreditType, renewalCycleLabel: string, renewalCycleMonths?: number | null, totalRequiredCredits: number, suggestedDeadline?: string | null, categories: Array<{ __typename?: 'CertificationCategory', id: string, name: string, requiredCredits: number, order: number }> };

export type CpdPlanCategoryFieldsFragment = { __typename?: 'CpdPlanCategory', id: string, name: string, targetCredits: number, completedCredits: number, order: number };

export type CpdPlanFieldsFragment = { __typename?: 'CpdPlan', id: string, certificationId?: string | null, certificationName: string, organization: string, reportingStart: string, reportingEnd: string, creditType: Types.CreditType, totalRequiredCredits: number, initialCompletedCredits: number, timeAvailable?: Types.LearningTimeCommitment | null, preferredFormats: Array<Types.LearningFormat>, evidenceTypes: Array<Types.CpdEvidenceType>, evidenceOtherNote?: string | null, reportRecipientType: Types.CpdReportRecipientType, reportRecipientLabel?: string | null, remindersEnabled: boolean, reminderTiming?: Types.CpdReminderTiming | null, status: Types.CpdPlanStatus, createdAt: string, updatedAt: string, categories: Array<{ __typename?: 'CpdPlanCategory', id: string, name: string, targetCredits: number, completedCredits: number, order: number }> };

export type CpdCategoryProgressFieldsFragment = { __typename?: 'CpdCategoryProgress', id: string, name: string, target: number, completed: number, remaining: number, progress: number, isComplete: boolean };

export type CpdMissingRequirementFieldsFragment = { __typename?: 'CpdMissingRequirement', code: string, detail?: string | null };

export type CpdPlanProgressFieldsFragment = { __typename?: 'CpdPlanProgress', planId: string, earnedCredits: number, initialCompletedCredits: number, activityCredits: number, totalRequiredCredits: number, remainingCredits: number, progressPercent: number, categoriesMissing: number, evidenceMissing: number, activitiesCounted: number, complianceStatus: string, reportingExpired: boolean, reportingNotStarted: boolean, categories: Array<{ __typename?: 'CpdCategoryProgress', id: string, name: string, target: number, completed: number, remaining: number, progress: number, isComplete: boolean }>, missingRequirements: Array<{ __typename?: 'CpdMissingRequirement', code: string, detail?: string | null }> };

export type CpdReportRecipientOptionFieldsFragment = { __typename?: 'CpdReportRecipientOption', type: Types.CpdReportRecipientType, label: string, description?: string | null };

export type CertificationSearchQueryVariables = Types.Exact<{
  input: Types.CertificationSearchInput;
}>;


export type CertificationSearchQuery = { __typename?: 'Query', certificationSearch: Array<{ __typename?: 'Certification', id: string, name: string, abbreviation: string, organization: string, organizationAbbr?: string | null, association?: string | null, creditType: Types.CreditType, renewalCycleLabel: string, renewalCycleMonths?: number | null, totalRequiredCredits: number, suggestedDeadline?: string | null, categories: Array<{ __typename?: 'CertificationCategory', id: string, name: string, requiredCredits: number, order: number }> }> };

export type MyCpdPlansQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type MyCpdPlansQuery = { __typename?: 'Query', myCpdPlans: Array<{ __typename?: 'CpdPlan', id: string, certificationId?: string | null, certificationName: string, organization: string, reportingStart: string, reportingEnd: string, creditType: Types.CreditType, totalRequiredCredits: number, initialCompletedCredits: number, timeAvailable?: Types.LearningTimeCommitment | null, preferredFormats: Array<Types.LearningFormat>, evidenceTypes: Array<Types.CpdEvidenceType>, evidenceOtherNote?: string | null, reportRecipientType: Types.CpdReportRecipientType, reportRecipientLabel?: string | null, remindersEnabled: boolean, reminderTiming?: Types.CpdReminderTiming | null, status: Types.CpdPlanStatus, createdAt: string, updatedAt: string, categories: Array<{ __typename?: 'CpdPlanCategory', id: string, name: string, targetCredits: number, completedCredits: number, order: number }> }> };

export type CpdPlanQueryVariables = Types.Exact<{
  planId: Types.Scalars['ID']['input'];
}>;


export type CpdPlanQuery = { __typename?: 'Query', cpdPlan: { __typename?: 'CpdPlan', id: string, certificationId?: string | null, certificationName: string, organization: string, reportingStart: string, reportingEnd: string, creditType: Types.CreditType, totalRequiredCredits: number, initialCompletedCredits: number, timeAvailable?: Types.LearningTimeCommitment | null, preferredFormats: Array<Types.LearningFormat>, evidenceTypes: Array<Types.CpdEvidenceType>, evidenceOtherNote?: string | null, reportRecipientType: Types.CpdReportRecipientType, reportRecipientLabel?: string | null, remindersEnabled: boolean, reminderTiming?: Types.CpdReminderTiming | null, status: Types.CpdPlanStatus, createdAt: string, updatedAt: string, categories: Array<{ __typename?: 'CpdPlanCategory', id: string, name: string, targetCredits: number, completedCredits: number, order: number }> } };

export type CpdPlanProgressQueryVariables = Types.Exact<{
  planId: Types.Scalars['ID']['input'];
}>;


export type CpdPlanProgressQuery = { __typename?: 'Query', cpdPlanProgress: { __typename?: 'CpdPlanProgress', planId: string, earnedCredits: number, initialCompletedCredits: number, activityCredits: number, totalRequiredCredits: number, remainingCredits: number, progressPercent: number, categoriesMissing: number, evidenceMissing: number, activitiesCounted: number, complianceStatus: string, reportingExpired: boolean, reportingNotStarted: boolean, categories: Array<{ __typename?: 'CpdCategoryProgress', id: string, name: string, target: number, completed: number, remaining: number, progress: number, isComplete: boolean }>, missingRequirements: Array<{ __typename?: 'CpdMissingRequirement', code: string, detail?: string | null }> } };

export type CpdReportRecipientsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type CpdReportRecipientsQuery = { __typename?: 'Query', cpdReportRecipients: Array<{ __typename?: 'CpdReportRecipientOption', type: Types.CpdReportRecipientType, label: string, description?: string | null }> };

export type CreateCpdPlanMutationVariables = Types.Exact<{
  input: Types.CreateCpdPlanInput;
}>;


export type CreateCpdPlanMutation = { __typename?: 'Mutation', createCpdPlan: { __typename?: 'CpdPlan', id: string, certificationId?: string | null, certificationName: string, organization: string, reportingStart: string, reportingEnd: string, creditType: Types.CreditType, totalRequiredCredits: number, initialCompletedCredits: number, timeAvailable?: Types.LearningTimeCommitment | null, preferredFormats: Array<Types.LearningFormat>, evidenceTypes: Array<Types.CpdEvidenceType>, evidenceOtherNote?: string | null, reportRecipientType: Types.CpdReportRecipientType, reportRecipientLabel?: string | null, remindersEnabled: boolean, reminderTiming?: Types.CpdReminderTiming | null, status: Types.CpdPlanStatus, createdAt: string, updatedAt: string, categories: Array<{ __typename?: 'CpdPlanCategory', id: string, name: string, targetCredits: number, completedCredits: number, order: number }> } };

export type CreateCpdPlanFromSuggestionMutationVariables = Types.Exact<{
  input: Types.CreateCpdPlanFromSuggestionInput;
}>;


export type CreateCpdPlanFromSuggestionMutation = { __typename?: 'Mutation', createCpdPlanFromSuggestion: { __typename?: 'CpdPlan', id: string, certificationId?: string | null, certificationName: string, organization: string, reportingStart: string, reportingEnd: string, creditType: Types.CreditType, totalRequiredCredits: number, initialCompletedCredits: number, timeAvailable?: Types.LearningTimeCommitment | null, preferredFormats: Array<Types.LearningFormat>, evidenceTypes: Array<Types.CpdEvidenceType>, evidenceOtherNote?: string | null, reportRecipientType: Types.CpdReportRecipientType, reportRecipientLabel?: string | null, remindersEnabled: boolean, reminderTiming?: Types.CpdReminderTiming | null, status: Types.CpdPlanStatus, createdAt: string, updatedAt: string, categories: Array<{ __typename?: 'CpdPlanCategory', id: string, name: string, targetCredits: number, completedCredits: number, order: number }> } };

export type UpdateCpdPlanMutationVariables = Types.Exact<{
  input: Types.UpdateCpdPlanInput;
}>;


export type UpdateCpdPlanMutation = { __typename?: 'Mutation', updateCpdPlan: { __typename?: 'CpdPlan', id: string, certificationId?: string | null, certificationName: string, organization: string, reportingStart: string, reportingEnd: string, creditType: Types.CreditType, totalRequiredCredits: number, initialCompletedCredits: number, timeAvailable?: Types.LearningTimeCommitment | null, preferredFormats: Array<Types.LearningFormat>, evidenceTypes: Array<Types.CpdEvidenceType>, evidenceOtherNote?: string | null, reportRecipientType: Types.CpdReportRecipientType, reportRecipientLabel?: string | null, remindersEnabled: boolean, reminderTiming?: Types.CpdReminderTiming | null, status: Types.CpdPlanStatus, createdAt: string, updatedAt: string, categories: Array<{ __typename?: 'CpdPlanCategory', id: string, name: string, targetCredits: number, completedCredits: number, order: number }> } };

export type DeleteCpdPlanMutationVariables = Types.Exact<{
  planId: Types.Scalars['ID']['input'];
}>;


export type DeleteCpdPlanMutation = { __typename?: 'Mutation', deleteCpdPlan: { __typename?: 'ProfessionalActionResponse', id: string } };

export const CertificationCategoryFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment CertificationCategoryFields on CertificationCategory {
  id
  name
  requiredCredits
  order
}
    `, {"fragmentName":"CertificationCategoryFields"}) as unknown as TypedDocumentString<CertificationCategoryFieldsFragment, unknown>;
export const CertificationFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment CertificationFields on Certification {
  id
  name
  abbreviation
  organization
  organizationAbbr
  association
  creditType
  renewalCycleLabel
  renewalCycleMonths
  totalRequiredCredits
  suggestedDeadline
  categories {
    ...CertificationCategoryFields
  }
}
    fragment CertificationCategoryFields on CertificationCategory {
  id
  name
  requiredCredits
  order
}`, {"fragmentName":"CertificationFields"}) as unknown as TypedDocumentString<CertificationFieldsFragment, unknown>;
export const CpdPlanCategoryFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment CpdPlanCategoryFields on CpdPlanCategory {
  id
  name
  targetCredits
  completedCredits
  order
}
    `, {"fragmentName":"CpdPlanCategoryFields"}) as unknown as TypedDocumentString<CpdPlanCategoryFieldsFragment, unknown>;
export const CpdPlanFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment CpdPlanFields on CpdPlan {
  id
  certificationId
  certificationName
  organization
  reportingStart
  reportingEnd
  creditType
  totalRequiredCredits
  initialCompletedCredits
  timeAvailable
  preferredFormats
  evidenceTypes
  evidenceOtherNote
  reportRecipientType
  reportRecipientLabel
  remindersEnabled
  reminderTiming
  status
  categories {
    ...CpdPlanCategoryFields
  }
  createdAt
  updatedAt
}
    fragment CpdPlanCategoryFields on CpdPlanCategory {
  id
  name
  targetCredits
  completedCredits
  order
}`, {"fragmentName":"CpdPlanFields"}) as unknown as TypedDocumentString<CpdPlanFieldsFragment, unknown>;
export const CpdCategoryProgressFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment CpdCategoryProgressFields on CpdCategoryProgress {
  id
  name
  target
  completed
  remaining
  progress
  isComplete
}
    `, {"fragmentName":"CpdCategoryProgressFields"}) as unknown as TypedDocumentString<CpdCategoryProgressFieldsFragment, unknown>;
export const CpdMissingRequirementFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment CpdMissingRequirementFields on CpdMissingRequirement {
  code
  detail
}
    `, {"fragmentName":"CpdMissingRequirementFields"}) as unknown as TypedDocumentString<CpdMissingRequirementFieldsFragment, unknown>;
export const CpdPlanProgressFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment CpdPlanProgressFields on CpdPlanProgress {
  planId
  earnedCredits
  initialCompletedCredits
  activityCredits
  totalRequiredCredits
  remainingCredits
  progressPercent
  categoriesMissing
  evidenceMissing
  activitiesCounted
  complianceStatus
  reportingExpired
  reportingNotStarted
  categories {
    ...CpdCategoryProgressFields
  }
  missingRequirements {
    ...CpdMissingRequirementFields
  }
}
    fragment CpdCategoryProgressFields on CpdCategoryProgress {
  id
  name
  target
  completed
  remaining
  progress
  isComplete
}
fragment CpdMissingRequirementFields on CpdMissingRequirement {
  code
  detail
}`, {"fragmentName":"CpdPlanProgressFields"}) as unknown as TypedDocumentString<CpdPlanProgressFieldsFragment, unknown>;
export const CpdReportRecipientOptionFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment CpdReportRecipientOptionFields on CpdReportRecipientOption {
  type
  label
  description
}
    `, {"fragmentName":"CpdReportRecipientOptionFields"}) as unknown as TypedDocumentString<CpdReportRecipientOptionFieldsFragment, unknown>;
export const CertificationSearchDocument = /*#__PURE__*/ new TypedDocumentString(`
    query CertificationSearch($input: CertificationSearchInput!) {
  certificationSearch(input: $input) {
    ...CertificationFields
  }
}
    fragment CertificationCategoryFields on CertificationCategory {
  id
  name
  requiredCredits
  order
}
fragment CertificationFields on Certification {
  id
  name
  abbreviation
  organization
  organizationAbbr
  association
  creditType
  renewalCycleLabel
  renewalCycleMonths
  totalRequiredCredits
  suggestedDeadline
  categories {
    ...CertificationCategoryFields
  }
}`) as unknown as TypedDocumentString<CertificationSearchQuery, CertificationSearchQueryVariables>;
export const MyCpdPlansDocument = /*#__PURE__*/ new TypedDocumentString(`
    query MyCpdPlans {
  myCpdPlans {
    ...CpdPlanFields
  }
}
    fragment CpdPlanCategoryFields on CpdPlanCategory {
  id
  name
  targetCredits
  completedCredits
  order
}
fragment CpdPlanFields on CpdPlan {
  id
  certificationId
  certificationName
  organization
  reportingStart
  reportingEnd
  creditType
  totalRequiredCredits
  initialCompletedCredits
  timeAvailable
  preferredFormats
  evidenceTypes
  evidenceOtherNote
  reportRecipientType
  reportRecipientLabel
  remindersEnabled
  reminderTiming
  status
  categories {
    ...CpdPlanCategoryFields
  }
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<MyCpdPlansQuery, MyCpdPlansQueryVariables>;
export const CpdPlanDocument = /*#__PURE__*/ new TypedDocumentString(`
    query CpdPlan($planId: ID!) {
  cpdPlan(planId: $planId) {
    ...CpdPlanFields
  }
}
    fragment CpdPlanCategoryFields on CpdPlanCategory {
  id
  name
  targetCredits
  completedCredits
  order
}
fragment CpdPlanFields on CpdPlan {
  id
  certificationId
  certificationName
  organization
  reportingStart
  reportingEnd
  creditType
  totalRequiredCredits
  initialCompletedCredits
  timeAvailable
  preferredFormats
  evidenceTypes
  evidenceOtherNote
  reportRecipientType
  reportRecipientLabel
  remindersEnabled
  reminderTiming
  status
  categories {
    ...CpdPlanCategoryFields
  }
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<CpdPlanQuery, CpdPlanQueryVariables>;
export const CpdPlanProgressDocument = /*#__PURE__*/ new TypedDocumentString(`
    query CpdPlanProgress($planId: ID!) {
  cpdPlanProgress(planId: $planId) {
    ...CpdPlanProgressFields
  }
}
    fragment CpdCategoryProgressFields on CpdCategoryProgress {
  id
  name
  target
  completed
  remaining
  progress
  isComplete
}
fragment CpdMissingRequirementFields on CpdMissingRequirement {
  code
  detail
}
fragment CpdPlanProgressFields on CpdPlanProgress {
  planId
  earnedCredits
  initialCompletedCredits
  activityCredits
  totalRequiredCredits
  remainingCredits
  progressPercent
  categoriesMissing
  evidenceMissing
  activitiesCounted
  complianceStatus
  reportingExpired
  reportingNotStarted
  categories {
    ...CpdCategoryProgressFields
  }
  missingRequirements {
    ...CpdMissingRequirementFields
  }
}`) as unknown as TypedDocumentString<CpdPlanProgressQuery, CpdPlanProgressQueryVariables>;
export const CpdReportRecipientsDocument = /*#__PURE__*/ new TypedDocumentString(`
    query CpdReportRecipients {
  cpdReportRecipients {
    ...CpdReportRecipientOptionFields
  }
}
    fragment CpdReportRecipientOptionFields on CpdReportRecipientOption {
  type
  label
  description
}`) as unknown as TypedDocumentString<CpdReportRecipientsQuery, CpdReportRecipientsQueryVariables>;
export const CreateCpdPlanDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation CreateCpdPlan($input: CreateCpdPlanInput!) {
  createCpdPlan(input: $input) {
    ...CpdPlanFields
  }
}
    fragment CpdPlanCategoryFields on CpdPlanCategory {
  id
  name
  targetCredits
  completedCredits
  order
}
fragment CpdPlanFields on CpdPlan {
  id
  certificationId
  certificationName
  organization
  reportingStart
  reportingEnd
  creditType
  totalRequiredCredits
  initialCompletedCredits
  timeAvailable
  preferredFormats
  evidenceTypes
  evidenceOtherNote
  reportRecipientType
  reportRecipientLabel
  remindersEnabled
  reminderTiming
  status
  categories {
    ...CpdPlanCategoryFields
  }
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<CreateCpdPlanMutation, CreateCpdPlanMutationVariables>;
export const CreateCpdPlanFromSuggestionDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation CreateCpdPlanFromSuggestion($input: CreateCpdPlanFromSuggestionInput!) {
  createCpdPlanFromSuggestion(input: $input) {
    ...CpdPlanFields
  }
}
    fragment CpdPlanCategoryFields on CpdPlanCategory {
  id
  name
  targetCredits
  completedCredits
  order
}
fragment CpdPlanFields on CpdPlan {
  id
  certificationId
  certificationName
  organization
  reportingStart
  reportingEnd
  creditType
  totalRequiredCredits
  initialCompletedCredits
  timeAvailable
  preferredFormats
  evidenceTypes
  evidenceOtherNote
  reportRecipientType
  reportRecipientLabel
  remindersEnabled
  reminderTiming
  status
  categories {
    ...CpdPlanCategoryFields
  }
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<CreateCpdPlanFromSuggestionMutation, CreateCpdPlanFromSuggestionMutationVariables>;
export const UpdateCpdPlanDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation UpdateCpdPlan($input: UpdateCpdPlanInput!) {
  updateCpdPlan(input: $input) {
    ...CpdPlanFields
  }
}
    fragment CpdPlanCategoryFields on CpdPlanCategory {
  id
  name
  targetCredits
  completedCredits
  order
}
fragment CpdPlanFields on CpdPlan {
  id
  certificationId
  certificationName
  organization
  reportingStart
  reportingEnd
  creditType
  totalRequiredCredits
  initialCompletedCredits
  timeAvailable
  preferredFormats
  evidenceTypes
  evidenceOtherNote
  reportRecipientType
  reportRecipientLabel
  remindersEnabled
  reminderTiming
  status
  categories {
    ...CpdPlanCategoryFields
  }
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<UpdateCpdPlanMutation, UpdateCpdPlanMutationVariables>;
export const DeleteCpdPlanDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation DeleteCpdPlan($planId: ID!) {
  deleteCpdPlan(planId: $planId) {
    id
  }
}
    `) as unknown as TypedDocumentString<DeleteCpdPlanMutation, DeleteCpdPlanMutationVariables>;