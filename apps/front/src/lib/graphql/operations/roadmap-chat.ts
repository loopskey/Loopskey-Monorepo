import * as Types from "@/lib/graphql/base";
import { TypedDocumentString } from "@/lib/graphql/base";
export type RoadmapWidgetFieldsFragment = { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string }> };

export type RoadmapChatMessageFieldsFragment = { __typename?: 'RoadmapChatMessage', id: string, role: Types.RoadmapChatRole, content: string, stepKey: Types.RoadmapDraftStep, createdAt: string, widget?: { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string }> } | null };

export type ProfessionalRoadmapDraftFieldsFragment = { __typename?: 'ProfessionalRoadmapDraft', id: string, status: Types.RoadmapDraftStatus, currentStep: Types.RoadmapDraftStep, isComplete: boolean, needsClarification: boolean, wasRefused: boolean, updatedAt: string, goal?: string | null, targetRole?: string | null, goalReason?: string | null, context?: string | null, targetDate?: string | null, skillLevel?: Types.SkillLevel | null, timeCommitment?: Types.LearningTimeCommitment | null, budgetPreference?: Types.LearningBudgetPreference | null, subjects: Array<string>, preferredFormats: Array<Types.LearningFormat>, preferredContentTypes: Array<Types.ContentType>, cpdEnabled: boolean, certificationId?: string | null, certificationName?: string | null, requiredCredits?: number | null, completedCredits?: number | null, subjectOptions: Array<{ __typename?: 'RoadmapSubjectOption', id: string, label: string }>, widget?: { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string }> } | null, transcript: { __typename?: 'PaginatedRoadmapChatMessages', totalCount: number, pageInfo: { __typename?: 'ProfessionalPageInfo', hasNextPage: boolean, nextCursor?: string | null }, items: Array<{ __typename?: 'RoadmapChatMessage', id: string, role: Types.RoadmapChatRole, content: string, stepKey: Types.RoadmapDraftStep, createdAt: string, widget?: { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string }> } | null }> } };

export type ProfessionalRoadmapDraftQueryVariables = Types.Exact<{
  draftId?: Types.InputMaybe<Types.Scalars['ID']['input']>;
  transcript?: Types.InputMaybe<Types.ProfessionalPaginationInput>;
}>;


export type ProfessionalRoadmapDraftQuery = { __typename?: 'Query', professionalRoadmapDraft?: { __typename?: 'ProfessionalRoadmapDraft', id: string, status: Types.RoadmapDraftStatus, currentStep: Types.RoadmapDraftStep, isComplete: boolean, needsClarification: boolean, wasRefused: boolean, updatedAt: string, goal?: string | null, targetRole?: string | null, goalReason?: string | null, context?: string | null, targetDate?: string | null, skillLevel?: Types.SkillLevel | null, timeCommitment?: Types.LearningTimeCommitment | null, budgetPreference?: Types.LearningBudgetPreference | null, subjects: Array<string>, preferredFormats: Array<Types.LearningFormat>, preferredContentTypes: Array<Types.ContentType>, cpdEnabled: boolean, certificationId?: string | null, certificationName?: string | null, requiredCredits?: number | null, completedCredits?: number | null, subjectOptions: Array<{ __typename?: 'RoadmapSubjectOption', id: string, label: string }>, widget?: { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string }> } | null, transcript: { __typename?: 'PaginatedRoadmapChatMessages', totalCount: number, pageInfo: { __typename?: 'ProfessionalPageInfo', hasNextPage: boolean, nextCursor?: string | null }, items: Array<{ __typename?: 'RoadmapChatMessage', id: string, role: Types.RoadmapChatRole, content: string, stepKey: Types.RoadmapDraftStep, createdAt: string, widget?: { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string }> } | null }> } } | null };

export type StartRoadmapDraftMutationVariables = Types.Exact<{ [key: string]: never; }>;


export type StartRoadmapDraftMutation = { __typename?: 'Mutation', startRoadmapDraft: { __typename?: 'ProfessionalRoadmapDraft', id: string, status: Types.RoadmapDraftStatus, currentStep: Types.RoadmapDraftStep, isComplete: boolean, needsClarification: boolean, wasRefused: boolean, updatedAt: string, goal?: string | null, targetRole?: string | null, goalReason?: string | null, context?: string | null, targetDate?: string | null, skillLevel?: Types.SkillLevel | null, timeCommitment?: Types.LearningTimeCommitment | null, budgetPreference?: Types.LearningBudgetPreference | null, subjects: Array<string>, preferredFormats: Array<Types.LearningFormat>, preferredContentTypes: Array<Types.ContentType>, cpdEnabled: boolean, certificationId?: string | null, certificationName?: string | null, requiredCredits?: number | null, completedCredits?: number | null, subjectOptions: Array<{ __typename?: 'RoadmapSubjectOption', id: string, label: string }>, widget?: { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string }> } | null, transcript: { __typename?: 'PaginatedRoadmapChatMessages', totalCount: number, pageInfo: { __typename?: 'ProfessionalPageInfo', hasNextPage: boolean, nextCursor?: string | null }, items: Array<{ __typename?: 'RoadmapChatMessage', id: string, role: Types.RoadmapChatRole, content: string, stepKey: Types.RoadmapDraftStep, createdAt: string, widget?: { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string }> } | null }> } } };

export type SendRoadmapChatTurnMutationVariables = Types.Exact<{
  input: Types.RoadmapChatTurnInput;
}>;


export type SendRoadmapChatTurnMutation = { __typename?: 'Mutation', sendRoadmapChatTurn: { __typename?: 'ProfessionalRoadmapDraft', id: string, status: Types.RoadmapDraftStatus, currentStep: Types.RoadmapDraftStep, isComplete: boolean, needsClarification: boolean, wasRefused: boolean, updatedAt: string, goal?: string | null, targetRole?: string | null, goalReason?: string | null, context?: string | null, targetDate?: string | null, skillLevel?: Types.SkillLevel | null, timeCommitment?: Types.LearningTimeCommitment | null, budgetPreference?: Types.LearningBudgetPreference | null, subjects: Array<string>, preferredFormats: Array<Types.LearningFormat>, preferredContentTypes: Array<Types.ContentType>, cpdEnabled: boolean, certificationId?: string | null, certificationName?: string | null, requiredCredits?: number | null, completedCredits?: number | null, subjectOptions: Array<{ __typename?: 'RoadmapSubjectOption', id: string, label: string }>, widget?: { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string }> } | null, transcript: { __typename?: 'PaginatedRoadmapChatMessages', totalCount: number, pageInfo: { __typename?: 'ProfessionalPageInfo', hasNextPage: boolean, nextCursor?: string | null }, items: Array<{ __typename?: 'RoadmapChatMessage', id: string, role: Types.RoadmapChatRole, content: string, stepKey: Types.RoadmapDraftStep, createdAt: string, widget?: { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string }> } | null }> } } };

export type PatchRoadmapDraftMutationVariables = Types.Exact<{
  input: Types.PatchRoadmapDraftInput;
}>;


export type PatchRoadmapDraftMutation = { __typename?: 'Mutation', patchRoadmapDraft: { __typename?: 'ProfessionalRoadmapDraft', id: string, status: Types.RoadmapDraftStatus, currentStep: Types.RoadmapDraftStep, isComplete: boolean, needsClarification: boolean, wasRefused: boolean, updatedAt: string, goal?: string | null, targetRole?: string | null, goalReason?: string | null, context?: string | null, targetDate?: string | null, skillLevel?: Types.SkillLevel | null, timeCommitment?: Types.LearningTimeCommitment | null, budgetPreference?: Types.LearningBudgetPreference | null, subjects: Array<string>, preferredFormats: Array<Types.LearningFormat>, preferredContentTypes: Array<Types.ContentType>, cpdEnabled: boolean, certificationId?: string | null, certificationName?: string | null, requiredCredits?: number | null, completedCredits?: number | null, subjectOptions: Array<{ __typename?: 'RoadmapSubjectOption', id: string, label: string }>, widget?: { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string }> } | null, transcript: { __typename?: 'PaginatedRoadmapChatMessages', totalCount: number, pageInfo: { __typename?: 'ProfessionalPageInfo', hasNextPage: boolean, nextCursor?: string | null }, items: Array<{ __typename?: 'RoadmapChatMessage', id: string, role: Types.RoadmapChatRole, content: string, stepKey: Types.RoadmapDraftStep, createdAt: string, widget?: { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string }> } | null }> } } };

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
  cpdEnabled
  certificationId
  certificationName
  requiredCredits
  completedCredits
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
fragment ProfessionalRoadmapDraftFields on ProfessionalRoadmapDraft {
  id
  status
  currentStep
  isComplete
  needsClarification
  wasRefused
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
  cpdEnabled
  certificationId
  certificationName
  requiredCredits
  completedCredits
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
fragment ProfessionalRoadmapDraftFields on ProfessionalRoadmapDraft {
  id
  status
  currentStep
  isComplete
  needsClarification
  wasRefused
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
  cpdEnabled
  certificationId
  certificationName
  requiredCredits
  completedCredits
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
fragment ProfessionalRoadmapDraftFields on ProfessionalRoadmapDraft {
  id
  status
  currentStep
  isComplete
  needsClarification
  wasRefused
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
  cpdEnabled
  certificationId
  certificationName
  requiredCredits
  completedCredits
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
fragment ProfessionalRoadmapDraftFields on ProfessionalRoadmapDraft {
  id
  status
  currentStep
  isComplete
  needsClarification
  wasRefused
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
  cpdEnabled
  certificationId
  certificationName
  requiredCredits
  completedCredits
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