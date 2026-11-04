import { registerEnumType } from "@nestjs/graphql";

import * as Prisma from "@prisma/client";

export enum RoadmapDraftFieldKey {
  GOAL = "goal",
  CONTEXT = "context",
  SUBJECTS = "subjects",
  CPD_ENABLED = "cpdEnabled",
  GOAL_REASON = "goalReason",
  TARGET_DATE = "targetDate",
  TARGET_ROLE = "targetRole",
  SKILL_LEVEL = "skillLevel",
  TIME_COMMITMENT = "timeCommitment",
  BUDGET_PREFERENCE = "budgetPreference",
  PREFERRED_FORMATS = "preferredFormats",
  CERTIFICATION_NAME = "certificationName",
  PREFERRED_CONTENT_TYPES = "preferredContentTypes",
  PREFERRED_DELIVERY_FORMATS = "preferredDeliveryFormats",
}

export enum RoadmapWidgetKind {
  TEXT = "TEXT",
  DATE = "DATE",
  YES_NO = "YES_NO",
  MULTI_SELECT = "MULTI_SELECT",
  SINGLE_SELECT = "SINGLE_SELECT",
}

export enum RoadmapChangeOperationKind {
  ADD_STEP = "ADD_STEP",
  ADD_PHASE = "ADD_PHASE",
  REMOVE_STEP = "REMOVE_STEP",
  MODIFY_STEP = "MODIFY_STEP",
  MODIFY_PHASE = "MODIFY_PHASE",
  UPDATE_DRAFT = "UPDATE_DRAFT",
  REMOVE_PHASE = "REMOVE_PHASE",
  MODIFY_ROADMAP = "MODIFY_ROADMAP",
  REBUILD_ROADMAP = "REBUILD_ROADMAP",
}

registerEnumType(RoadmapDraftFieldKey, { name: "RoadmapDraftFieldKey" });
registerEnumType(RoadmapChangeOperationKind, {
  name: "RoadmapChangeOperationKind",
});
registerEnumType(RoadmapWidgetKind, { name: "RoadmapWidgetKind" });
registerEnumType(Prisma.RoadmapChatRole, { name: "RoadmapChatRole" });
registerEnumType(Prisma.RoadmapDraftStep, { name: "RoadmapDraftStep" });
registerEnumType(Prisma.RoadmapDraftStatus, { name: "RoadmapDraftStatus" });
registerEnumType(Prisma.RoadmapSource, { name: "RoadmapSource" });
registerEnumType(Prisma.RoadmapStepProgressStatus, {
  name: "RoadmapStepProgressStatus",
});
