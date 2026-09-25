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
  SINGLE_SELECT = "SINGLE_SELECT",
  MULTI_SELECT = "MULTI_SELECT",
}

registerEnumType(RoadmapDraftFieldKey, { name: "RoadmapDraftFieldKey" });
registerEnumType(RoadmapWidgetKind, { name: "RoadmapWidgetKind" });
registerEnumType(Prisma.RoadmapChatRole, { name: "RoadmapChatRole" });
registerEnumType(Prisma.RoadmapDraftStep, { name: "RoadmapDraftStep" });
registerEnumType(Prisma.RoadmapDraftStatus, { name: "RoadmapDraftStatus" });
registerEnumType(Prisma.RoadmapSource, { name: "RoadmapSource" });
registerEnumType(Prisma.RoadmapStepProgressStatus, {
  name: "RoadmapStepProgressStatus",
});
