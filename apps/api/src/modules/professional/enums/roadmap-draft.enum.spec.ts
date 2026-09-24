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

/**
 * `preferredDeliveryFormats` is the one deliberate exception: the provider
 * cannot name it (it is outside `RoadmapDraftField`), but the server's own
 * PREFERENCES widgets must be able to, as a sixth preference sub-field the
 * old static wizard used to ask about locally. See `RoadmapWidgetField` in
 * `service-ai.port.ts`.
 */
const WIDGET_ONLY_FIELDS = [RoadmapDraftFieldKey.PREFERRED_DELIVERY_FORMATS];

describe("exposed roadmap draft enums", () => {
  it("exposes exactly the port's draft fields, plus the documented widget-only exception", () => {
    expect(Object.values(RoadmapDraftFieldKey).sort()).toEqual(
      [...Object.keys(FIELD_KEYS), ...WIDGET_ONLY_FIELDS].sort(),
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
