import type {
  ProfessionalRoadmapDraftFieldsFragment,
  RoadmapChatMessageFieldsFragment,
  RoadmapWidgetFieldsFragment,
} from "@/lib/graphql/operations/roadmap-chat";

export type TRoadmapDraft = ProfessionalRoadmapDraftFieldsFragment;
export type TRoadmapChatMessage = RoadmapChatMessageFieldsFragment;
export type TRoadmapWidget = RoadmapWidgetFieldsFragment;
export type TRoadmapWidgetOption = TRoadmapWidget["options"][number];
export type TRoadmapSubjectOption = TRoadmapDraft["subjectOptions"][number];

/**
 * A message the professional has sent but the server has not acknowledged. It
 * carries no id because the server assigns one; the transcript renders it after
 * the persisted messages and drops it as soon as the draft comes back.
 */
export type TPendingMessage = {
  content: string;
  failed: boolean;
};

/**
 * What the composer needs to know to decide whether sending is allowed. Kept
 * separate from the draft so the send path does not depend on the whole record.
 */
export type TComposerState = {
  value: string;
  remaining: number;
  isOverLimit: boolean;
  showCounter: boolean;
};

export type TRoadmapChatError = {
  code: string;
  retryAfterSeconds: number | null;
};
