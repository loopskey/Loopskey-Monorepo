import { registerEnumType } from "@nestjs/graphql";

import * as Prisma from "@prisma/client";

/**
 * The draft field a widget collects. The provider types this as a closed set
 * rather than a free string, so the browser gets an enum it can handle
 * exhaustively. Kept in step with the port's `RoadmapDraftField` by
 * `roadmap-draft.enum.spec.ts`.
 */
export enum RoadmapDraftFieldKey {
  GOAL = "goal",
  TARGET_ROLE = "targetRole",
  GOAL_REASON = "goalReason",
  CONTEXT = "context",
  TARGET_DATE = "targetDate",
  SKILL_LEVEL = "skillLevel",
  TIME_COMMITMENT = "timeCommitment",
  BUDGET_PREFERENCE = "budgetPreference",
  SUBJECTS = "subjects",
  PREFERRED_FORMATS = "preferredFormats",
  PREFERRED_CONTENT_TYPES = "preferredContentTypes",
  CPD_ENABLED = "cpdEnabled",
  CERTIFICATION_NAME = "certificationName",
}

export enum RoadmapWidgetKind {
  TEXT = "TEXT",
  DATE = "DATE",
  YES_NO = "YES_NO",
  SINGLE_SELECT = "SINGLE_SELECT",
  MULTI_SELECT = "MULTI_SELECT",
}

registerEnumType(RoadmapDraftFieldKey, { name: "RoadmapDraftFieldKey" });
registerEnumType(RoadmapWidgetKind, { name: "RoadmapWidgetKind" });
registerEnumType(Prisma.RoadmapChatRole, { name: "RoadmapChatRole" });
registerEnumType(Prisma.RoadmapDraftStep, { name: "RoadmapDraftStep" });
registerEnumType(Prisma.RoadmapDraftStatus, { name: "RoadmapDraftStatus" });
