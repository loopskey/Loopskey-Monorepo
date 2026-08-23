import type {
  RoadmapDraftField,
  RoadmapWidget,
} from "@infrastructure/service-ai/service-ai.port";

import { RoadmapDraftFieldKey, RoadmapWidgetKind } from "./roadmap-draft.enum";

/**
 * The browser is handed these as enums so it can switch on them exhaustively,
 * which is only safe while they say exactly what the port says. A field the
 * provider gains fails to compile here; one it loses fails at runtime below.
 */
const FIELD_KEYS: Record<RoadmapDraftField, RoadmapDraftFieldKey> = {
  goal: RoadmapDraftFieldKey.GOAL,
  targetRole: RoadmapDraftFieldKey.TARGET_ROLE,
  goalReason: RoadmapDraftFieldKey.GOAL_REASON,
  context: RoadmapDraftFieldKey.CONTEXT,
  targetDate: RoadmapDraftFieldKey.TARGET_DATE,
  skillLevel: RoadmapDraftFieldKey.SKILL_LEVEL,
  timeCommitment: RoadmapDraftFieldKey.TIME_COMMITMENT,
  budgetPreference: RoadmapDraftFieldKey.BUDGET_PREFERENCE,
  subjects: RoadmapDraftFieldKey.SUBJECTS,
  preferredFormats: RoadmapDraftFieldKey.PREFERRED_FORMATS,
  preferredContentTypes: RoadmapDraftFieldKey.PREFERRED_CONTENT_TYPES,
  cpdEnabled: RoadmapDraftFieldKey.CPD_ENABLED,
  certificationName: RoadmapDraftFieldKey.CERTIFICATION_NAME,
};

const WIDGET_KINDS: Record<RoadmapWidget["type"], RoadmapWidgetKind> = {
  TEXT: RoadmapWidgetKind.TEXT,
  DATE: RoadmapWidgetKind.DATE,
  YES_NO: RoadmapWidgetKind.YES_NO,
  SINGLE_SELECT: RoadmapWidgetKind.SINGLE_SELECT,
  MULTI_SELECT: RoadmapWidgetKind.MULTI_SELECT,
};

describe("exposed roadmap draft enums", () => {
  it("exposes exactly the draft fields the port names", () => {
    expect(Object.values(RoadmapDraftFieldKey).sort()).toEqual(
      Object.keys(FIELD_KEYS).sort(),
    );
  });

  it("names each field by the column it writes", () => {
    for (const [field, key] of Object.entries(FIELD_KEYS))
      expect(key).toBe(field);
  });

  it("exposes exactly the widget kinds the port names", () => {
    expect(Object.values(RoadmapWidgetKind).sort()).toEqual(
      Object.keys(WIDGET_KINDS).sort(),
    );
  });
});
